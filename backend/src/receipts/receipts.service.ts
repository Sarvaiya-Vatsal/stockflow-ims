import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Like } from 'typeorm';
import { Receipt, ReceiptStatus } from './entities/receipt.entity';
import { ReceiptItem } from './entities/receipt-item.entity';
import { StockLevel } from '../products/entities/stock-level.entity';
import { AuditLedger, TransactionType } from './entities/audit-ledger.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { ValidateReceiptDto } from './dto/validate-receipt.dto';
import { FilterReceiptDto } from './dto/filter-receipt.dto';
import { DashboardService } from '../dashboard/dashboard.service';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    @InjectRepository(ReceiptItem)
    private receiptItemRepository: Repository<ReceiptItem>,
    @InjectRepository(StockLevel)
    private stockLevelRepository: Repository<StockLevel>,
    @InjectRepository(AuditLedger)
    private auditLedgerRepository: Repository<AuditLedger>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => DashboardService))
    private dashboardService: DashboardService,
  ) {}

  private generateReceiptNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REC-${dateStr}-${random}`;
  }

  async create(createReceiptDto: CreateReceiptDto, userId: string) {
    if (!createReceiptDto.items || createReceiptDto.items.length === 0) {
      throw new BadRequestException('Receipt must have at least one item');
    }

    const receiptNumber = this.generateReceiptNumber();

    const receipt = this.receiptRepository.create({
      receiptNumber,
      supplierName: createReceiptDto.supplierName,
      warehouseId: createReceiptDto.warehouseId,
      status: ReceiptStatus.DRAFT,
      expectedDate: createReceiptDto.expectedDate
        ? new Date(createReceiptDto.expectedDate)
        : null,
      notes: createReceiptDto.notes,
      createdBy: userId,
    });

    const savedReceipt = await this.receiptRepository.save(receipt);

    // Create receipt items
    const items = createReceiptDto.items.map((item) => {
      const receiptItem = this.receiptItemRepository.create({
        receiptId: savedReceipt.id,
        productId: item.productId,
        quantity: item.quantity,
        receivedQuantity: item.quantity, // Default to ordered quantity
        unitPrice: item.unitPrice || null,
        totalPrice: item.unitPrice
          ? item.quantity * item.unitPrice
          : null,
      });
      return receiptItem;
    });

    await this.receiptItemRepository.save(items);

    return this.findOne(savedReceipt.id);
  }

  async findAll(filterDto: FilterReceiptDto) {
    const { status, warehouseId, search, page = 1, limit = 20 } = filterDto;

    const queryBuilder = this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.warehouse', 'warehouse')
      .leftJoinAndSelect('receipt.creator', 'creator')
      .leftJoinAndSelect('receipt.validator', 'validator')
      .leftJoinAndSelect('receipt.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    if (status) {
      queryBuilder.andWhere('receipt.status = :status', { status });
    }

    if (warehouseId) {
      queryBuilder.andWhere('receipt.warehouseId = :warehouseId', {
        warehouseId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(receipt.receiptNumber ILIKE :search OR receipt.supplierName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('receipt.createdAt', 'DESC');

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
    const receipt = await this.receiptRepository.findOne({
      where: { id },
      relations: [
        'warehouse',
        'creator',
        'validator',
        'items',
        'items.product',
      ],
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return receipt;
  }

  async update(id: string, updateReceiptDto: UpdateReceiptDto) {
    const receipt = await this.findOne(id);

    if (receipt.status !== ReceiptStatus.DRAFT) {
      throw new BadRequestException(
        'Only draft receipts can be updated',
      );
    }

    Object.assign(receipt, {
      supplierName: updateReceiptDto.supplierName,
      warehouseId: updateReceiptDto.warehouseId,
      expectedDate: updateReceiptDto.expectedDate
        ? new Date(updateReceiptDto.expectedDate)
        : receipt.expectedDate,
      notes: updateReceiptDto.notes,
    });

    // Update items if provided
    if (updateReceiptDto.items) {
      // Delete existing items
      await this.receiptItemRepository.delete({ receiptId: id });

      // Create new items
      const items = updateReceiptDto.items.map((item) => {
        return this.receiptItemRepository.create({
          receiptId: id,
          productId: item.productId,
          quantity: item.quantity,
          receivedQuantity: item.quantity,
          unitPrice: item.unitPrice || null,
          totalPrice: item.unitPrice ? item.quantity * item.unitPrice : null,
        });
      });

      await this.receiptItemRepository.save(items);
    }

    await this.receiptRepository.save(receipt);

    return this.findOne(id);
  }

  async validate(id: string, validateDto: ValidateReceiptDto, userId: string) {
    const receipt = await this.findOne(id);

    if (receipt.status === ReceiptStatus.DONE) {
      throw new BadRequestException('Receipt is already validated');
    }

    if (receipt.status === ReceiptStatus.CANCELED) {
      throw new BadRequestException('Cannot validate a canceled receipt');
    }

    if (!receipt.items || receipt.items.length === 0) {
      throw new BadRequestException('Receipt has no items');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Process each item
      for (const item of receipt.items) {
        // Get received quantity (from DTO or default to ordered)
        let receivedQuantity = item.quantity;
        if (validateDto.receivedItems) {
          const receivedItem = validateDto.receivedItems.find(
            (ri) => ri.itemId === item.id,
          );
          if (receivedItem) {
            receivedQuantity = receivedItem.receivedQuantity;
          }
        }

        // Update received quantity in item
        item.receivedQuantity = receivedQuantity;
        await queryRunner.manager.save(ReceiptItem, item);

        // Get or create stock level
        let stockLevel = await queryRunner.manager.findOne(StockLevel, {
          where: {
            productId: item.productId,
            warehouseId: receipt.warehouseId,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!stockLevel) {
          stockLevel = queryRunner.manager.create(StockLevel, {
            productId: item.productId,
            warehouseId: receipt.warehouseId,
            quantity: 0,
            reservedQuantity: 0,
            version: 0,
          });
        }

        const quantityBefore = stockLevel.quantity;
        const quantityAfter = quantityBefore + receivedQuantity;
        const quantityChange = receivedQuantity;

        // Update stock
        stockLevel.quantity = quantityAfter;
        stockLevel.version = stockLevel.version + 1;
        await queryRunner.manager.save(StockLevel, stockLevel);

        // Create audit ledger entry
        const auditEntry = queryRunner.manager.create(AuditLedger, {
          transactionType: TransactionType.RECEIPT,
          documentId: receipt.id,
          documentNumber: receipt.receiptNumber,
          productId: item.productId,
          warehouseId: receipt.warehouseId,
          quantityBefore,
          quantityAfter,
          quantityChange,
          userId,
          metadata: {
            supplier: receipt.supplierName,
            receiptNumber: receipt.receiptNumber,
          },
        });

        await queryRunner.manager.save(AuditLedger, auditEntry);
      }

      // Update receipt status
      receipt.status = ReceiptStatus.DONE;
      receipt.validatedBy = userId;
      receipt.validatedAt = new Date();
      receipt.receivedDate = new Date();
      await queryRunner.manager.save(Receipt, receipt);

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
    const receipt = await this.findOne(id);

    if (receipt.status === ReceiptStatus.DONE) {
      throw new BadRequestException('Cannot cancel a validated receipt');
    }

    receipt.status = ReceiptStatus.CANCELED;
    await this.receiptRepository.save(receipt);

    return this.findOne(id);
  }
}

