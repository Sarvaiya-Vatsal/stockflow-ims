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

class ReceiptItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;
}

export class CreateReceiptDto {
  @IsString()
  @IsOptional()
  supplierName?: string;

  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @IsDateString()
  @IsOptional()
  expectedDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  items: ReceiptItemDto[];

  @IsString()
  @IsOptional()
  notes?: string;
}

