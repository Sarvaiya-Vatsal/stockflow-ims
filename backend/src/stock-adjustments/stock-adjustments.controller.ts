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
import { StockAdjustmentsService } from './stock-adjustments.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { UpdateStockAdjustmentDto } from './dto/update-stock-adjustment.dto';
import { FilterStockAdjustmentDto } from './dto/filter-stock-adjustment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stock-adjustments')
@UseGuards(JwtAuthGuard)
export class StockAdjustmentsController {
  constructor(
    private readonly stockAdjustmentsService: StockAdjustmentsService,
  ) {}

  @Post()
  create(@Body() createDto: CreateStockAdjustmentDto, @Request() req) {
    return this.stockAdjustmentsService.create(createDto, req.user.id);
  }

  @Get()
  findAll(@Query() filterDto: FilterStockAdjustmentDto) {
    return this.stockAdjustmentsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockAdjustmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStockAdjustmentDto,
  ) {
    return this.stockAdjustmentsService.update(id, updateDto);
  }

  @Post(':id/validate')
  validate(@Param('id') id: string, @Request() req) {
    return this.stockAdjustmentsService.validate(id, req.user.id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.stockAdjustmentsService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockAdjustmentsService.cancel(id);
  }
}

