import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  StockAdjustment,
  StockAdjustmentStatus,
} from './entities/stock-adjustment.entity';
import { StockAdjustmentItem } from './entities/stock-adjustment-item.entity';
import { StockLevel } from '../products/entities/stock-level.entity';
import { AuditLedger, TransactionType } from '../receipts/entities/audit-ledger.entity';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { UpdateStockAdjustmentDto } from './dto/update-stock-adjustment.dto';
import { FilterStockAdjustmentDto } from './dto/filter-stock-adjustment.dto';
import { DashboardService } from '../dashboard/dashboard.service';

@Injectable()
export class StockAdjustmentsService {
  constructor(
    @InjectRepository(StockAdjustment)
    private adjustmentRepository: Repository<StockAdjustment>,
    @InjectRepository(StockAdjustmentItem)
    private adjustmentItemRepository: Repository<StockAdjustmentItem>,
    @InjectRepository(StockLevel)
    private stockLevelRepository: Repository<StockLevel>,
    @InjectRepository(AuditLedger)
    private auditLedgerRepository: Repository<AuditLedger>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => DashboardService))
    private dashboardService: DashboardService,
  ) {}

  private generateAdjustmentNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SA-${dateStr}-${random}`;
  }

  async create(createDto: CreateStockAdjustmentDto, userId: string) {
    if (!createDto.items || createDto.items.length === 0) {
      throw new BadRequestException('Adjustment must have at least one item');
    }

    const adjustmentNumber = this.generateAdjustmentNumber();

    const adjustment = this.adjustmentRepository.create({
      adjustmentNumber,
      warehouseId: createDto.warehouseId,
      reason: createDto.reason,
      status: StockAdjustmentStatus.DRAFT,
      adjustmentDate: createDto.adjustmentDate
        ? new Date(createDto.adjustmentDate)
        : null,
      notes: createDto.notes,
      createdBy: userId,
    });

    const savedAdjustment = await this.adjustmentRepository.save(adjustment);

    // Create adjustment items with current quantity snapshots
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const items = [];
      for (const itemDto of createDto.items) {
        // Get current stock level
        const stockLevel = await queryRunner.manager.findOne(StockLevel, {
          where: {
            productId: itemDto.productId,
            warehouseId: createDto.warehouseId,
          },
        });

        const currentQuantity = stockLevel ? stockLevel.quantity : 0;
        const difference = itemDto.adjustedQuantity - currentQuantity;

        // Validate adjusted quantity is not negative
        if (itemDto.adjustedQuantity < 0) {
          throw new BadRequestException(
            `Adjusted quantity cannot be negative for product ${itemDto.productId}`,
          );
        }

        const adjustmentItem = this.adjustmentItemRepository.create({
          adjustmentId: savedAdjustment.id,
          productId: itemDto.productId,
          currentQuantity,
          adjustedQuantity: itemDto.adjustedQuantity,
          difference,
        });

        items.push(adjustmentItem);
      }

      await queryRunner.manager.save(StockAdjustmentItem, items);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await this.adjustmentRepository.remove(savedAdjustment);
      throw error;
    } finally {
      await queryRunner.release();
    }

    return this.findOne(savedAdjustment.id);
  }

  async findAll(filterDto: FilterStockAdjustmentDto) {
    const {
      status,
      reason,
      warehouseId,
      search,
      page = 1,
      limit = 20,
    } = filterDto;

    const queryBuilder = this.adjustmentRepository
      .createQueryBuilder('adjustment')
      .leftJoinAndSelect('adjustment.warehouse', 'warehouse')
      .leftJoinAndSelect('adjustment.creator', 'creator')
      .leftJoinAndSelect('adjustment.validator', 'validator')
      .leftJoinAndSelect('adjustment.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    if (status) {
      queryBuilder.andWhere('adjustment.status = :status', { status });
    }

    if (reason) {
      queryBuilder.andWhere('adjustment.reason = :reason', { reason });
    }

    if (warehouseId) {
      queryBuilder.andWhere('adjustment.warehouseId = :warehouseId', {
        warehouseId,
      });
    }

    if (search) {
      queryBuilder.andWhere('adjustment.adjustmentNumber ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('adjustment.createdAt', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const adjustment = await this.adjustmentRepository.findOne({
      where: { id },
      relations: [
        'warehouse',
        'creator',
        'validator',
        'items',
        'items.product',
      ],
    });

    if (!adjustment) {
      throw new NotFoundException('Stock adjustment not found');
    }

    return adjustment;
  }

  async update(id: string, updateDto: UpdateStockAdjustmentDto) {
    const adjustment = await this.findOne(id);

    if (adjustment.status !== StockAdjustmentStatus.DRAFT) {
      throw new BadRequestException('Only draft adjustments can be updated');
    }

    Object.assign(adjustment, {
      warehouseId: updateDto.warehouseId || adjustment.warehouseId,
      reason: updateDto.reason || adjustment.reason,
      adjustmentDate: updateDto.adjustmentDate
        ? new Date(updateDto.adjustmentDate)
        : adjustment.adjustmentDate,
      notes: updateDto.notes,
    });

    // Update items if provided
    if (updateDto.items) {
      await this.adjustmentItemRepository.delete({ adjustmentId: id });

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const items = [];
        for (const itemDto of updateDto.items) {
          const stockLevel = await queryRunner.manager.findOne(StockLevel, {
            where: {
              productId: itemDto.productId,
              warehouseId: updateDto.warehouseId || adjustment.warehouseId,
            },
          });

          const currentQuantity = stockLevel ? stockLevel.quantity : 0;
          const difference = itemDto.adjustedQuantity - currentQuantity;

          if (itemDto.adjustedQuantity < 0) {
            throw new BadRequestException(
              `Adjusted quantity cannot be negative for product ${itemDto.productId}`,
            );
          }

          const adjustmentItem = this.adjustmentItemRepository.create({
            adjustmentId: id,
            productId: itemDto.productId,
            currentQuantity,
            adjustedQuantity: itemDto.adjustedQuantity,
            difference,
          });

          items.push(adjustmentItem);
        }

        await queryRunner.manager.save(StockAdjustmentItem, items);
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    await this.adjustmentRepository.save(adjustment);

    return this.findOne(id);
  }

  async validate(id: string, userId: string) {
    const adjustment = await this.findOne(id);

    if (adjustment.status === StockAdjustmentStatus.DONE) {
      throw new BadRequestException('Adjustment is already validated');
    }

    if (adjustment.status === StockAdjustmentStatus.CANCELED) {
      throw new BadRequestException('Cannot validate a canceled adjustment');
    }

    if (!adjustment.items || adjustment.items.length === 0) {
      throw new BadRequestException('Adjustment has no items');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of adjustment.items) {
        // Get or create stock level
        let stockLevel = await queryRunner.manager.findOne(StockLevel, {
          where: {
            productId: item.productId,
            warehouseId: adjustment.warehouseId,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!stockLevel) {
          stockLevel = queryRunner.manager.create(StockLevel, {
            productId: item.productId,
            warehouseId: adjustment.warehouseId,
            quantity: 0,
            reservedQuantity: 0,
            version: 0,
          });
        }

        const quantityBefore = stockLevel.quantity;
        const quantityAfter = item.adjustedQuantity;
        const quantityChange = item.difference;

        // Update stock to adjusted quantity
        stockLevel.quantity = quantityAfter;
        stockLevel.version = stockLevel.version + 1;
        await queryRunner.manager.save(StockLevel, stockLevel);

        // Create audit ledger entry
        const auditEntry = queryRunner.manager.create(AuditLedger, {
          transactionType: TransactionType.ADJUSTMENT,
          documentId: adjustment.id,
          documentNumber: adjustment.adjustmentNumber,
          productId: item.productId,
          warehouseId: adjustment.warehouseId,
          quantityBefore,
          quantityAfter,
          quantityChange,
          userId,
          metadata: {
            reason: adjustment.reason,
            adjustmentNumber: adjustment.adjustmentNumber,
            notes: adjustment.notes,
          },
        });

        await queryRunner.manager.save(AuditLedger, auditEntry);
      }

      // Update adjustment status
      adjustment.status = StockAdjustmentStatus.DONE;
      adjustment.validatedBy = userId;
      adjustment.validatedAt = new Date();
      await queryRunner.manager.save(StockAdjustment, adjustment);

      await queryRunner.commitTransaction();

      // Invalidate dashboard cache after stock change
      await this.dashboardService.invalidateKPICache();
      await this.dashboardService.invalidateRecentActivityCache();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancel(id: string) {
    const adjustment = await this.findOne(id);

    if (adjustment.status === StockAdjustmentStatus.DONE) {
      throw new BadRequestException('Cannot cancel a validated adjustment');
    }

    adjustment.status = StockAdjustmentStatus.CANCELED;
    await this.adjustmentRepository.save(adjustment);

    return this.findOne(id);
  }
}

