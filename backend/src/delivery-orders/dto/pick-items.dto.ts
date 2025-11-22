import { IsArray, ValidateNested, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class PickedItemDto {
  @IsString()
  itemId: string;

  @IsNumber()
  @Min(0)
  pickedQuantity: number;
}

export class PickItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PickedItemDto)
  items: PickedItemDto[];
}

