import { IsArray, ValidateNested, IsOptional, IsNumber, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class ReceivedItemDto {
  @IsString()
  itemId: string;

  @IsNumber()
  @Min(0)
  receivedQuantity: number;
}

export class ValidateReceiptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceivedItemDto)
  @IsOptional()
  receivedItems?: ReceivedItemDto[]; // Optional - defaults to ordered quantity
}

