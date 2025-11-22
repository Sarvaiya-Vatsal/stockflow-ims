import { IsOptional, IsString, IsUUID, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InternalTransferStatus } from '../entities/internal-transfer.entity';

export class FilterInternalTransferDto {
  @IsEnum(InternalTransferStatus)
  @IsOptional()
  status?: InternalTransferStatus;

  @IsUUID()
  @IsOptional()
  fromWarehouseId?: string;

  @IsUUID()
  @IsOptional()
  toWarehouseId?: string;

  @IsString()
  @IsOptional()
  search?: string; // Search by transfer number

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

