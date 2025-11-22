import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { DeliveryOrdersModule } from './delivery-orders/delivery-orders.module';
import { InternalTransfersModule } from './internal-transfers/internal-transfers.module';
import { StockAdjustmentsModule } from './stock-adjustments/stock-adjustments.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    ProductsModule,
    WarehousesModule,
    ReceiptsModule,
    DeliveryOrdersModule,
    InternalTransfersModule,
    StockAdjustmentsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}