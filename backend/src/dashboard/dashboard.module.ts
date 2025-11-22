import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Product } from '../products/entities/product.entity';
import { StockLevel } from '../products/entities/stock-level.entity';
import { Receipt } from '../receipts/entities/receipt.entity';
import { DeliveryOrder } from '../delivery-orders/entities/delivery-order.entity';
import { InternalTransfer } from '../internal-transfers/entities/internal-transfer.entity';
import { AuditLedger } from '../receipts/entities/audit-ledger.entity';
import { getCacheConfig } from '../config/cache.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      StockLevel,
      Receipt,
      DeliveryOrder,
      InternalTransfer,
      AuditLedger,
    ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getCacheConfig,
      inject: [ConfigService],
      isGlobal: false, // Only for dashboard module
    }),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

