import { IsOptional, IsString, IsUUID, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReceiptStatus } from '../entities/receipt.entity';

export class FilterReceiptDto {
  @IsEnum(ReceiptStatus)
  @IsOptional()
  status?: ReceiptStatus;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @IsString()
  @IsOptional()
  search?: string; // Search by receipt number or supplier

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

