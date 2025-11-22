import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { ValidateReceiptDto } from './dto/validate-receipt.dto';
import { FilterReceiptDto } from './dto/filter-receipt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Post()
  create(@Body() createReceiptDto: CreateReceiptDto, @Request() req) {
    return this.receiptsService.create(createReceiptDto, req.user.id);
  }

  @Get()
  findAll(@Query() filterDto: FilterReceiptDto) {
    return this.receiptsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReceiptDto: UpdateReceiptDto) {
    return this.receiptsService.update(id, updateReceiptDto);
  }

  @Post(':id/validate')
  validate(
    @Param('id') id: string,
    @Body() validateDto: ValidateReceiptDto,
    @Request() req,
  ) {
    return this.receiptsService.validate(id, validateDto, req.user.id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.receiptsService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.receiptsService.cancel(id);
  }
}

