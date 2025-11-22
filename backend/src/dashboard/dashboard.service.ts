import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Product } from '../products/entities/product.entity';
import { StockLevel } from '../products/entities/stock-level.entity';
import { Receipt, ReceiptStatus } from '../receipts/entities/receipt.entity';
import { DeliveryOrder, DeliveryOrderStatus } from '../delivery-orders/entities/delivery-order.entity';
import { InternalTransfer, InternalTransferStatus } from '../internal-transfers/entities/internal-transfer.entity';
import { AuditLedger } from '../receipts/entities/audit-ledger.entity';

@Injectable()
export class DashboardService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly KPI_CACHE_KEY = 'dashboard:kpis';
  private readonly RECENT_ACTIVITY_CACHE_KEY = 'dashboard:recent-activity';

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(StockLevel)
    private stockLevelRepository: Repository<StockLevel>,
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    @InjectRepository(DeliveryOrder)
    private deliveryOrderRepository: Repository<DeliveryOrder>,
    @InjectRepository(InternalTransfer)
    private transferRepository: Repository<InternalTransfer>,
    @InjectRepository(AuditLedger)
    private auditLedgerRepository: Repository<AuditLedger>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getKPIs() {
    // Try to get from cache first
    const cached = await this.cacheManager.get<any>(this.KPI_CACHE_KEY);
    if (cached) {
      return {
        ...cached,
        cached: true,
      };
    }

    // Calculate all KPIs in parallel for better performance
    const [
      totalProducts,
      lowStockCount,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
    ] = await Promise.all([
      this.getTotalProducts(),
      this.getLowStockCount(),
      this.getPendingReceipts(),
      this.getPendingDeliveries(),
      this.getScheduledTransfers(),
    ]);

    const kpis = {
      totalProducts,
      lowStockCount,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
      timestamp: new Date().toISOString(),
    };

    // Cache the result
    await this.cacheManager.set(this.KPI_CACHE_KEY, kpis, this.CACHE_TTL * 1000);

    return {
      ...kpis,
      cached: false,
    };
  }

  /**
   * Invalidate KPI cache (call this when stock changes occur)
   */
  async invalidateKPICache() {
    await this.cacheManager.del(this.KPI_CACHE_KEY);
  }

  private async getTotalProducts(): Promise<number> {
    const result = await this.stockLevelRepository
      .createQueryBuilder('stock')
      .select('COUNT(DISTINCT stock.productId)', 'count')
      .where('stock.quantity > 0')
      .getRawOne();

    return parseInt(result?.count || '0', 10);
  }

  private async getLowStockCount(): Promise<number> {
    const result = await this.stockLevelRepository
      .createQueryBuilder('stock')
      .innerJoin('stock.product', 'product')
      .where('stock.quantity <= product.reorderPoint')
      .andWhere('stock.quantity > 0')
      .select('COUNT(DISTINCT stock.productId)', 'count')
      .getRawOne();

    return parseInt(result?.count || '0', 10);
  }

  private async getPendingReceipts(): Promise<number> {
    return this.receiptRepository.count({
      where: [
        { status: ReceiptStatus.DRAFT },
        { status: ReceiptStatus.WAITING },
        { status: ReceiptStatus.READY },
      ],
    });
  }

  private async getPendingDeliveries(): Promise<number> {
    return this.deliveryOrderRepository.count({
      where: [
        { status: DeliveryOrderStatus.DRAFT },
        { status: DeliveryOrderStatus.PICKING },
        { status: DeliveryOrderStatus.PACKING },
      ],
    });
  }

  private async getScheduledTransfers(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.transferRepository.count({
      where: [
        { status: InternalTransferStatus.DRAFT },
        { status: InternalTransferStatus.WAITING },
        { status: InternalTransferStatus.READY },
      ],
    });
  }

  async getRecentActivity(limit: number = 20) {
    const cacheKey = `${this.RECENT_ACTIVITY_CACHE_KEY}:${limit}`;
    
    // Try to get from cache first
    const cached = await this.cacheManager.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const activities = await this.auditLedgerRepository.find({
      take: limit,
      order: { timestamp: 'DESC' },
      relations: ['product', 'warehouse', 'user'],
    });

    const result = activities.map((activity) => ({
      id: activity.id,
      timestamp: activity.timestamp,
      transactionType: activity.transactionType,
      documentNumber: activity.documentNumber,
      product: {
        id: activity.product.id,
        sku: activity.product.sku,
        name: activity.product.name,
      },
      warehouse: {
        id: activity.warehouse.id,
        name: activity.warehouse.name,
      },
      quantityChange: activity.quantityChange,
      quantityBefore: activity.quantityBefore,
      quantityAfter: activity.quantityAfter,
      user: {
        id: activity.user.id,
        fullName: activity.user.fullName,
        email: activity.user.email,
      },
      metadata: activity.metadata,
    }));

    // Cache for shorter time (1 minute) since recent activity changes frequently
    await this.cacheManager.set(cacheKey, result, 60 * 1000);

    return result;
  }

  /**
   * Invalidate recent activity cache (call this when new transactions occur)
   */
  async invalidateRecentActivityCache() {
    // Invalidate all recent activity cache keys (different limits)
    const limits = [10, 20, 50, 100];
    for (const limit of limits) {
      await this.cacheManager.del(`${this.RECENT_ACTIVITY_CACHE_KEY}:${limit}`);
    }
  }

  async getMoveHistory(filters: {
    productId?: string;
    warehouseId?: string;
    transactionType?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      productId,
      warehouseId,
      transactionType,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = filters;

    const queryBuilder = this.auditLedgerRepository
      .createQueryBuilder('ledger')
      .leftJoinAndSelect('ledger.product', 'product')
      .leftJoinAndSelect('ledger.warehouse', 'warehouse')
      .leftJoinAndSelect('ledger.user', 'user');

    if (productId) {
      queryBuilder.andWhere('ledger.productId = :productId', { productId });
    }

    if (warehouseId) {
      queryBuilder.andWhere('ledger.warehouseId = :warehouseId', {
        warehouseId,
      });
    }

    if (transactionType) {
      queryBuilder.andWhere('ledger.transactionType = :transactionType', {
        transactionType,
      });
    }

    if (dateFrom) {
      queryBuilder.andWhere('ledger.timestamp >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('ledger.timestamp <= :dateTo', { dateTo });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    queryBuilder.orderBy('ledger.timestamp', 'DESC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items: items.map((item) => ({
        id: item.id,
        timestamp: item.timestamp,
        transactionType: item.transactionType,
        documentNumber: item.documentNumber,
        product: {
          id: item.product.id,
          sku: item.product.sku,
          name: item.product.name,
        },
        warehouse: {
          id: item.warehouse.id,
          name: item.warehouse.name,
        },
        quantityBefore: item.quantityBefore,
        quantityAfter: item.quantityAfter,
        quantityChange: item.quantityChange,
        user: {
          id: item.user.id,
          fullName: item.user.fullName,
          email: item.user.email,
        },
        metadata: item.metadata,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

