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
import { DeliveryOrdersService } from './delivery-orders.service';
import { CreateDeliveryOrderDto } from './dto/create-delivery-order.dto';
import { UpdateDeliveryOrderDto } from './dto/update-delivery-order.dto';
import { PickItemsDto } from './dto/pick-items.dto';
import { PackItemsDto } from './dto/pack-items.dto';
import { FilterDeliveryOrderDto } from './dto/filter-delivery-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('delivery-orders')
@UseGuards(JwtAuthGuard)
export class DeliveryOrdersController {
  constructor(private readonly deliveryOrdersService: DeliveryOrdersService) {}

  @Post()
  create(@Body() createDto: CreateDeliveryOrderDto, @Request() req) {
    return this.deliveryOrdersService.create(createDto, req.user.id);
  }

  @Get()
  findAll(@Query() filterDto: FilterDeliveryOrderDto) {
    return this.deliveryOrdersService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryOrdersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateDeliveryOrderDto) {
    return this.deliveryOrdersService.update(id, updateDto);
  }

  @Post(':id/pick')
  pickItems(@Param('id') id: string, @Body() pickDto: PickItemsDto) {
    return this.deliveryOrdersService.pickItems(id, pickDto);
  }

  @Post(':id/pack')
  packItems(@Param('id') id: string, @Body() packDto: PackItemsDto) {
    return this.deliveryOrdersService.packItems(id, packDto);
  }

  @Post(':id/validate')
  validate(@Param('id') id: string, @Request() req) {
    return this.deliveryOrdersService.validate(id, req.user.id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.deliveryOrdersService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryOrdersService.cancel(id);
  }
}

