import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryOrdersService } from './delivery-orders.service';
import { DeliveryOrdersController } from './delivery-orders.controller';
import { DeliveryOrder } from './entities/delivery-order.entity';
import { DeliveryOrderItem } from './entities/delivery-order-item.entity';
import { StockLevel } from '../products/entities/stock-level.entity';
import { AuditLedger } from '../receipts/entities/audit-ledger.entity';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeliveryOrder,
      DeliveryOrderItem,
      StockLevel,
      AuditLedger,
    ]),
    forwardRef(() => DashboardModule),
  ],
  controllers: [DeliveryOrdersController],
  providers: [DeliveryOrdersService],
  exports: [DeliveryOrdersService],
})
export class DeliveryOrdersModule {}

