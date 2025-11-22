import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsUUID,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class InitialStockDto {
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  unitOfMeasure?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderPoint?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ValidateNested()
  @Type(() => InitialStockDto)
  @IsOptional()
  initialStock?: InitialStockDto;
}

