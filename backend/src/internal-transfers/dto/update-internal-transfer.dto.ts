import { PartialType } from '@nestjs/mapped-types';
import { CreateInternalTransferDto } from './create-internal-transfer.dto';

export class UpdateInternalTransferDto extends PartialType(
  CreateInternalTransferDto,
) {}

