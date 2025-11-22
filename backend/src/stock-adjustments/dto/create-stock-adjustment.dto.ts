import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  IsEnum,
  IsString,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdjustmentReason } from '../entities/stock-adjustment.entity';

class StockAdjustmentItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  adjustedQuantity: number; // The new quantity after adjustment
}

export class CreateStockAdjustmentDto {
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @IsEnum(AdjustmentReason)
  @IsNotEmpty()
  reason: AdjustmentReason;

  @IsDateString()
  @IsOptional()
  adjustmentDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockAdjustmentItemDto)
  items: StockAdjustmentItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

