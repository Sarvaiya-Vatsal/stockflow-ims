import { IsOptional, IsString, IsUUID, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DeliveryOrderStatus } from '../entities/delivery-order.entity';

export class FilterDeliveryOrderDto {
  @IsEnum(DeliveryOrderStatus)
  @IsOptional()
  status?: DeliveryOrderStatus;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;

  @IsString()
  @IsOptional()
  search?: string; // Search by order number or customer

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

