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
  InternalTransfer,
  InternalTransferStatus,
} from './entities/internal-transfer.entity';
import { InternalTransferItem } from './entities/internal-transfer-item.entity';
import { StockLevel } from '../products/entities/stock-level.entity';
import { AuditLedger, TransactionType } from '../receipts/entities/audit-ledger.entity';
import { CreateInternalTransferDto } from './dto/create-internal-transfer.dto';
import { UpdateInternalTransferDto } from './dto/update-internal-transfer.dto';
import { FilterInternalTransferDto } from './dto/filter-internal-transfer.dto';
import { DashboardService } from '../dashboard/dashboard.service';

@Injectable()
export class InternalTransfersService {
  constructor(
    @InjectRepository(InternalTransfer)
    private transferRepository: Repository<InternalTransfer>,
    @InjectRepository(InternalTransferItem)
    private transferItemRepository: Repository<InternalTransferItem>,
    @InjectRepository(StockLevel)
    private stockLevelRepository: Repository<StockLevel>,
    @InjectRepository(AuditLedger)
    private auditLedgerRepository: Repository<AuditLedger>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => DashboardService))
    private dashboardService: DashboardService,
  ) {}

  private generateTransferNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `IT-${dateStr}-${random}`;
  }

  async create(createDto: CreateInternalTransferDto, userId: string) {
    if (!createDto.items || createDto.items.length === 0) {
      throw new BadRequestException('Transfer must have at least one item');
    }

    if (createDto.fromWarehouseId === createDto.toWarehouseId) {
      throw new BadRequestException(
        'Source and destination warehouses cannot be the same',
      );
    }

    const transferNumber = this.generateTransferNumber();

    const transfer = this.transferRepository.create({
      transferNumber,
      fromWarehouseId: createDto.fromWarehouseId,
      toWarehouseId: createDto.toWarehouseId,
      status: InternalTransferStatus.DRAFT,
      transferDate: createDto.transferDate
        ? new Date(createDto.transferDate)
        : null,
      notes: createDto.notes,
      createdBy: userId,
    });

    const savedTransfer = await this.transferRepository.save(transfer);

    // Create transfer items
    const items = createDto.items.map((item) => {
      return this.transferItemRepository.create({
        transferId: savedTransfer.id,
        productId: item.productId,
        quantity: item.quantity,
      });
    });

    await this.transferItemRepository.save(items);

    return this.findOne(savedTransfer.id);
  }

  async findAll(filterDto: FilterInternalTransferDto) {
    const {
      status,
      fromWarehouseId,
      toWarehouseId,
      search,
      page = 1,
      limit = 20,
    } = filterDto;

    const queryBuilder = this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.fromWarehouse', 'fromWarehouse')
      .leftJoinAndSelect('transfer.toWarehouse', 'toWarehouse')
      .leftJoinAndSelect('transfer.creator', 'creator')
      .leftJoinAndSelect('transfer.validator', 'validator')
      .leftJoinAndSelect('transfer.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    if (status) {
      queryBuilder.andWhere('transfer.status = :status', { status });
    }

    if (fromWarehouseId) {
      queryBuilder.andWhere('transfer.fromWarehouseId = :fromWarehouseId', {
        fromWarehouseId,
      });
    }

    if (toWarehouseId) {
      queryBuilder.andWhere('transfer.toWarehouseId = :toWarehouseId', {
        toWarehouseId,
      });
    }

    if (search) {
      queryBuilder.andWhere('transfer.transferNumber ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('transfer.createdAt', 'DESC');

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
    const transfer = await this.transferRepository.findOne({
      where: { id },
      relations: [
        'fromWarehouse',
        'toWarehouse',
        'creator',
        'validator',
        'items',
        'items.product',
      ],
    });

    if (!transfer) {
      throw new NotFoundException('Internal transfer not found');
    }

    return transfer;
  }

  async update(id: string, updateDto: UpdateInternalTransferDto) {
    const transfer = await this.findOne(id);

    if (transfer.status !== InternalTransferStatus.DRAFT) {
      throw new BadRequestException('Only draft transfers can be updated');
    }

    if (
      updateDto.fromWarehouseId &&
      updateDto.toWarehouseId &&
      updateDto.fromWarehouseId === updateDto.toWarehouseId
    ) {
      throw new BadRequestException(
        'Source and destination warehouses cannot be the same',
      );
    }

    Object.assign(transfer, {
      fromWarehouseId: updateDto.fromWarehouseId || transfer.fromWarehouseId,
      toWarehouseId: updateDto.toWarehouseId || transfer.toWarehouseId,
      transferDate: updateDto.transferDate
        ? new Date(updateDto.transferDate)
        : transfer.transferDate,
      notes: updateDto.notes,
    });

    // Update items if provided
    if (updateDto.items) {
      await this.transferItemRepository.delete({ transferId: id });

      const items = updateDto.items.map((item) => {
        return this.transferItemRepository.create({
          transferId: id,
          productId: item.productId,
          quantity: item.quantity,
        });
      });

      await this.transferItemRepository.save(items);
    }

    await this.transferRepository.save(transfer);

    return this.findOne(id);
  }

  async validate(id: string, userId: string) {
    const transfer = await this.findOne(id);

    if (transfer.status === InternalTransferStatus.DONE) {
      throw new BadRequestException('Transfer is already validated');
    }

    if (transfer.status === InternalTransferStatus.CANCELED) {
      throw new BadRequestException('Cannot validate a canceled transfer');
    }

    if (!transfer.items || transfer.items.length === 0) {
      throw new BadRequestException('Transfer has no items');
    }

    if (transfer.fromWarehouseId === transfer.toWarehouseId) {
      throw new BadRequestException(
        'Source and destination warehouses cannot be the same',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of transfer.items) {
        // Get source warehouse stock with lock
        const sourceStock = await queryRunner.manager.findOne(StockLevel, {
          where: {
            productId: item.productId,
            warehouseId: transfer.fromWarehouseId,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!sourceStock) {
          throw new BadRequestException(
            `Product ${item.productId} has no stock in source warehouse`,
          );
        }

        // Check availability
        if (sourceStock.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock in source warehouse. Available: ${sourceStock.quantity}, Required: ${item.quantity}`,
          );
        }

        // Get or create destination warehouse stock
        let destStock = await queryRunner.manager.findOne(StockLevel, {
          where: {
            productId: item.productId,
            warehouseId: transfer.toWarehouseId,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!destStock) {
          destStock = queryRunner.manager.create(StockLevel, {
            productId: item.productId,
            warehouseId: transfer.toWarehouseId,
            quantity: 0,
            reservedQuantity: 0,
            version: 0,
          });
        }

        // Update source warehouse (deduct)
        const sourceQuantityBefore = sourceStock.quantity;
        const sourceQuantityAfter = sourceQuantityBefore - item.quantity;
        sourceStock.quantity = sourceQuantityAfter;
        sourceStock.version = sourceStock.version + 1;
        await queryRunner.manager.save(StockLevel, sourceStock);

        // Update destination warehouse (add)
        const destQuantityBefore = destStock.quantity;
        const destQuantityAfter = destQuantityBefore + item.quantity;
        destStock.quantity = destQuantityAfter;
        destStock.version = destStock.version + 1;
        await queryRunner.manager.save(StockLevel, destStock);

        // Create audit ledger entry for source (outbound)
        const outboundAudit = queryRunner.manager.create(AuditLedger, {
          transactionType: TransactionType.TRANSFER_OUT,
          documentId: transfer.id,
          documentNumber: transfer.transferNumber,
          productId: item.productId,
          warehouseId: transfer.fromWarehouseId,
          quantityBefore: sourceQuantityBefore,
          quantityAfter: sourceQuantityAfter,
          quantityChange: -item.quantity,
          userId,
          metadata: {
            transferNumber: transfer.transferNumber,
            toWarehouse: transfer.toWarehouse.name,
          },
        });
        await queryRunner.manager.save(AuditLedger, outboundAudit);

        // Create audit ledger entry for destination (inbound)
        const inboundAudit = queryRunner.manager.create(AuditLedger, {
          transactionType: TransactionType.TRANSFER_IN,
          documentId: transfer.id,
          documentNumber: transfer.transferNumber,
          productId: item.productId,
          warehouseId: transfer.toWarehouseId,
          quantityBefore: destQuantityBefore,
          quantityAfter: destQuantityAfter,
          quantityChange: item.quantity,
          userId,
          metadata: {
            transferNumber: transfer.transferNumber,
            fromWarehouse: transfer.fromWarehouse.name,
          },
        });
        await queryRunner.manager.save(AuditLedger, inboundAudit);
      }

      // Update transfer status
      transfer.status = InternalTransferStatus.DONE;
      transfer.validatedBy = userId;
      transfer.validatedAt = new Date();
      transfer.completedDate = new Date();
      await queryRunner.manager.save(InternalTransfer, transfer);

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
    const transfer = await this.findOne(id);

    if (transfer.status === InternalTransferStatus.DONE) {
      throw new BadRequestException('Cannot cancel a validated transfer');
    }

    transfer.status = InternalTransferStatus.CANCELED;
    await this.transferRepository.save(transfer);

    return this.findOne(id);
  }
}

