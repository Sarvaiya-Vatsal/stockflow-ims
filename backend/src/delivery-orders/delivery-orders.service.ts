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
  DeliveryOrder,
  DeliveryOrderStatus,
} from './entities/delivery-order.entity';
import { DeliveryOrderItem } from './entities/delivery-order-item.entity';
import { StockLevel } from '../products/entities/stock-level.entity';
import { AuditLedger, TransactionType } from '../receipts/entities/audit-ledger.entity';
import { CreateDeliveryOrderDto } from './dto/create-delivery-order.dto';
import { UpdateDeliveryOrderDto } from './dto/update-delivery-order.dto';
import { PickItemsDto } from './dto/pick-items.dto';
import { PackItemsDto } from './dto/pack-items.dto';
import { FilterDeliveryOrderDto } from './dto/filter-delivery-order.dto';
import { DashboardService } from '../dashboard/dashboard.service';

@Injectable()
export class DeliveryOrdersService {
  constructor(
    @InjectRepository(DeliveryOrder)
    private deliveryOrderRepository: Repository<DeliveryOrder>,
    @InjectRepository(DeliveryOrderItem)
    private deliveryOrderItemRepository: Repository<DeliveryOrderItem>,
    @InjectRepository(StockLevel)
    private stockLevelRepository: Repository<StockLevel>,
    @InjectRepository(AuditLedger)
    private auditLedgerRepository: Repository<AuditLedger>,
    private dataSource: DataSource,
    @Inject(forwardRef(() => DashboardService))
    private dashboardService: DashboardService,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DO-${dateStr}-${random}`;
  }

  async create(createDto: CreateDeliveryOrderDto, userId: string) {
    if (!createDto.items || createDto.items.length === 0) {
      throw new BadRequestException('Delivery order must have at least one item');
    }

    const orderNumber = this.generateOrderNumber();

    const deliveryOrder = this.deliveryOrderRepository.create({
      orderNumber,
      customerName: createDto.customerName,
      warehouseId: createDto.warehouseId,
      status: DeliveryOrderStatus.DRAFT,
      deliveryDate: createDto.deliveryDate
        ? new Date(createDto.deliveryDate)
        : null,
      notes: createDto.notes,
      createdBy: userId,
    });

    const savedOrder = await this.deliveryOrderRepository.save(deliveryOrder);

    // Create order items and reserve stock
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const items = [];
      for (const itemDto of createDto.items) {
        // Check stock availability
        const stockLevel = await queryRunner.manager.findOne(StockLevel, {
          where: {
            productId: itemDto.productId,
            warehouseId: createDto.warehouseId,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!stockLevel) {
          throw new BadRequestException(
            `Product ${itemDto.productId} has no stock in this warehouse`,
          );
        }

        const availableStock =
          stockLevel.quantity - stockLevel.reservedQuantity;

        if (availableStock < itemDto.quantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${availableStock}, Requested: ${itemDto.quantity}`,
          );
        }

        // Reserve stock
        stockLevel.reservedQuantity += itemDto.quantity;
        await queryRunner.manager.save(StockLevel, stockLevel);

        // Create order item
        const orderItem = this.deliveryOrderItemRepository.create({
          deliveryOrderId: savedOrder.id,
          productId: itemDto.productId,
          quantity: itemDto.quantity,
          pickedQuantity: 0,
          packedQuantity: 0,
        });
        items.push(orderItem);
      }

      await queryRunner.manager.save(DeliveryOrderItem, items);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // Delete the order if stock reservation failed
      await this.deliveryOrderRepository.remove(savedOrder);
      throw error;
    } finally {
      await queryRunner.release();
    }

    return this.findOne(savedOrder.id);
  }

  async findAll(filterDto: FilterDeliveryOrderDto) {
    const { status, warehouseId, search, page = 1, limit = 20 } = filterDto;

    const queryBuilder = this.deliveryOrderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.warehouse', 'warehouse')
      .leftJoinAndSelect('order.creator', 'creator')
      .leftJoinAndSelect('order.validator', 'validator')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (warehouseId) {
      queryBuilder.andWhere('order.warehouseId = :warehouseId', {
        warehouseId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(order.orderNumber ILIKE :search OR order.customerName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('order.createdAt', 'DESC');

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
    const order = await this.deliveryOrderRepository.findOne({
      where: { id },
      relations: [
        'warehouse',
        'creator',
        'validator',
        'items',
        'items.product',
      ],
    });

    if (!order) {
      throw new NotFoundException('Delivery order not found');
    }

    return order;
  }

  async update(id: string, updateDto: UpdateDeliveryOrderDto) {
    const order = await this.findOne(id);

    if (order.status !== DeliveryOrderStatus.DRAFT) {
      throw new BadRequestException('Only draft orders can be updated');
    }

    // If items are being updated, need to release old reservations and create new ones
    if (updateDto.items) {
      // Release old reservations
      const oldItems = await this.deliveryOrderItemRepository.find({
        where: { deliveryOrderId: id },
      });

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        for (const oldItem of oldItems) {
          const stockLevel = await queryRunner.manager.findOne(StockLevel, {
            where: {
              productId: oldItem.productId,
              warehouseId: order.warehouseId,
            },
            lock: { mode: 'pessimistic_write' },
          });

          if (stockLevel) {
            stockLevel.reservedQuantity -= oldItem.quantity;
            await queryRunner.manager.save(StockLevel, stockLevel);
          }
        }

        // Delete old items
        await queryRunner.manager.delete(DeliveryOrderItem, {
          deliveryOrderId: id,
        });

        // Create new items and reserve stock
        for (const itemDto of updateDto.items) {
          const stockLevel = await queryRunner.manager.findOne(StockLevel, {
            where: {
              productId: itemDto.productId,
              warehouseId: updateDto.warehouseId || order.warehouseId,
            },
            lock: { mode: 'pessimistic_write' },
          });

          if (!stockLevel) {
            throw new BadRequestException(
              `Product ${itemDto.productId} has no stock in this warehouse`,
            );
          }

          const availableStock =
            stockLevel.quantity - stockLevel.reservedQuantity;

          if (availableStock < itemDto.quantity) {
            throw new BadRequestException(
              `Insufficient stock. Available: ${availableStock}, Requested: ${itemDto.quantity}`,
            );
          }

          stockLevel.reservedQuantity += itemDto.quantity;
          await queryRunner.manager.save(StockLevel, stockLevel);

          const orderItem = this.deliveryOrderItemRepository.create({
            deliveryOrderId: id,
            productId: itemDto.productId,
            quantity: itemDto.quantity,
            pickedQuantity: 0,
            packedQuantity: 0,
          });
          await queryRunner.manager.save(DeliveryOrderItem, orderItem);
        }

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    }

    Object.assign(order, {
      customerName: updateDto.customerName,
      warehouseId: updateDto.warehouseId,
      deliveryDate: updateDto.deliveryDate
        ? new Date(updateDto.deliveryDate)
        : order.deliveryDate,
      notes: updateDto.notes,
    });

    await this.deliveryOrderRepository.save(order);

    return this.findOne(id);
  }

  async pickItems(id: string, pickDto: PickItemsDto) {
    const order = await this.findOne(id);

    if (order.status !== DeliveryOrderStatus.DRAFT) {
      throw new BadRequestException(
        'Can only pick items for draft orders. Update status first.',
      );
    }

    for (const pickedItem of pickDto.items) {
      const item = order.items.find((i) => i.id === pickedItem.itemId);
      if (!item) {
        throw new NotFoundException(
          `Item ${pickedItem.itemId} not found in order`,
        );
      }

      if (pickedItem.pickedQuantity > item.quantity) {
        throw new BadRequestException(
          `Picked quantity cannot exceed ordered quantity`,
        );
      }

      item.pickedQuantity = pickedItem.pickedQuantity;
      await this.deliveryOrderItemRepository.save(item);
    }

    // Update status to PICKING if any items are picked
    const allPicked = order.items.every(
      (item) => item.pickedQuantity >= item.quantity,
    );
    if (allPicked && order.items.length > 0) {
      order.status = DeliveryOrderStatus.PICKING;
      await this.deliveryOrderRepository.save(order);
    }

    return this.findOne(id);
  }

  async packItems(id: string, packDto: PackItemsDto) {
    const order = await this.findOne(id);

    if (
      order.status !== DeliveryOrderStatus.PICKING &&
      order.status !== DeliveryOrderStatus.DRAFT
    ) {
      throw new BadRequestException('Order must be in picking status');
    }

    for (const packedItem of packDto.items) {
      const item = order.items.find((i) => i.id === packedItem.itemId);
      if (!item) {
        throw new NotFoundException(
          `Item ${packedItem.itemId} not found in order`,
        );
      }

      if (packedItem.packedQuantity > item.pickedQuantity) {
        throw new BadRequestException(
          `Packed quantity cannot exceed picked quantity`,
        );
      }

      item.packedQuantity = packedItem.packedQuantity;
      await this.deliveryOrderItemRepository.save(item);
    }

    // Update status to PACKING if any items are packed
    const allPacked = order.items.every(
      (item) => item.packedQuantity >= item.quantity,
    );
    if (allPacked && order.items.length > 0) {
      order.status = DeliveryOrderStatus.PACKING;
      await this.deliveryOrderRepository.save(order);
    }

    return this.findOne(id);
  }

  async validate(id: string, userId: string) {
    const order = await this.findOne(id);

    if (order.status === DeliveryOrderStatus.DONE) {
      throw new BadRequestException('Order is already validated');
    }

    if (order.status === DeliveryOrderStatus.CANCELED) {
      throw new BadRequestException('Cannot validate a canceled order');
    }

    if (!order.items || order.items.length === 0) {
      throw new BadRequestException('Order has no items');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        // Get stock level with lock
        const stockLevel = await queryRunner.manager.findOne(StockLevel, {
          where: {
            productId: item.productId,
            warehouseId: order.warehouseId,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!stockLevel) {
          throw new BadRequestException(
            `Product ${item.productId} has no stock in this warehouse`,
          );
        }

        // Check availability
        if (stockLevel.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId}. Available: ${stockLevel.quantity}, Required: ${item.quantity}`,
          );
        }

        const quantityBefore = stockLevel.quantity;
        const quantityAfter = quantityBefore - item.quantity;
        const quantityChange = -item.quantity; // Negative for outgoing

        // Update stock (deduct and release reservation)
        stockLevel.quantity = quantityAfter;
        stockLevel.reservedQuantity -= item.quantity;
        stockLevel.version = stockLevel.version + 1;
        await queryRunner.manager.save(StockLevel, stockLevel);

        // Create audit ledger entry
        const auditEntry = queryRunner.manager.create(AuditLedger, {
          transactionType: TransactionType.DELIVERY,
          documentId: order.id,
          documentNumber: order.orderNumber,
          productId: item.productId,
          warehouseId: order.warehouseId,
          quantityBefore,
          quantityAfter,
          quantityChange,
          userId,
          metadata: {
            customer: order.customerName,
            orderNumber: order.orderNumber,
          },
        });

        await queryRunner.manager.save(AuditLedger, auditEntry);
      }

      // Update order status
      order.status = DeliveryOrderStatus.DONE;
      order.validatedBy = userId;
      order.validatedAt = new Date();
      order.shippedDate = new Date();
      await queryRunner.manager.save(DeliveryOrder, order);

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
    const order = await this.findOne(id);

    if (order.status === DeliveryOrderStatus.DONE) {
      throw new BadRequestException('Cannot cancel a validated order');
    }

    // Release reserved stock
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of order.items) {
        const stockLevel = await queryRunner.manager.findOne(StockLevel, {
          where: {
            productId: item.productId,
            warehouseId: order.warehouseId,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (stockLevel) {
          stockLevel.reservedQuantity -= item.quantity;
          await queryRunner.manager.save(StockLevel, stockLevel);
        }
      }

      order.status = DeliveryOrderStatus.CANCELED;
      await queryRunner.manager.save(DeliveryOrder, order);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    return this.findOne(id);
  }
}

