import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsDateString,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

class InternalTransferItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateInternalTransferDto {
  @IsUUID()
  @IsNotEmpty()
  fromWarehouseId: string;

  @IsUUID()
  @IsNotEmpty()
  toWarehouseId: string;

  @IsDateString()
  @IsOptional()
  transferDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InternalTransferItemDto)
  items: InternalTransferItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

