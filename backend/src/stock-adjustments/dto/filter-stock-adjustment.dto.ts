import { IsOptional, IsString, IsUUID, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StockAdjustmentStatus, AdjustmentReason } from '../entities/stock-adjustment.entity';

export class FilterStockAdjustmentDto {
  @IsEnum(StockAdjustmentStatus)
  @IsOptional()
  status?: StockAdjustmentStatus;

  @IsEnum(AdjustmentReason)
  @IsOptional()
  reason?: AdjustmentReason;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @IsString()
  @IsOptional()
  search?: string; // Search by adjustment number

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}

