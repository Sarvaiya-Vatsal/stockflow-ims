import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

class DeliveryOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateDeliveryOrderDto {
  @IsString()
  @IsOptional()
  customerName?: string;

  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @IsDateString()
  @IsOptional()
  deliveryDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryOrderItemDto)
  items: DeliveryOrderItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

