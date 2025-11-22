import { IsArray, ValidateNested, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class PackedItemDto {
  @IsString()
  itemId: string;

  @IsNumber()
  @Min(0)
  packedQuantity: number;
}

export class PackItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackedItemDto)
  items: PackedItemDto[];
}

