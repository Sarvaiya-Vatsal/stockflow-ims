import { IsOptional, IsString, IsUUID, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterProductDto {
  @IsString()
  @IsOptional()
  search?: string; // Search by SKU or name

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  warehouseId?: string; // Filter by warehouse stock

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  lowStockOnly?: boolean; // Only show products below reorder point

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

