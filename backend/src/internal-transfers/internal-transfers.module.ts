import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternalTransfersService } from './internal-transfers.service';
import { InternalTransfersController } from './internal-transfers.controller';
import { InternalTransfer } from './entities/internal-transfer.entity';
import { InternalTransferItem } from './entities/internal-transfer-item.entity';
import { StockLevel } from '../products/entities/stock-level.entity';
import { AuditLedger } from '../receipts/entities/audit-ledger.entity';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InternalTransfer,
      InternalTransferItem,
      StockLevel,
      AuditLedger,
    ]),
    forwardRef(() => DashboardModule),
  ],
  controllers: [InternalTransfersController],
  providers: [InternalTransfersService],
  exports: [InternalTransfersService],
})
export class InternalTransfersModule {}

