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
import { InternalTransfersService } from './internal-transfers.service';
import { CreateInternalTransferDto } from './dto/create-internal-transfer.dto';
import { UpdateInternalTransferDto } from './dto/update-internal-transfer.dto';
import { FilterInternalTransferDto } from './dto/filter-internal-transfer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('internal-transfers')
@UseGuards(JwtAuthGuard)
export class InternalTransfersController {
  constructor(
    private readonly internalTransfersService: InternalTransfersService,
  ) {}

  @Post()
  create(@Body() createDto: CreateInternalTransferDto, @Request() req) {
    return this.internalTransfersService.create(createDto, req.user.id);
  }

  @Get()
  findAll(@Query() filterDto: FilterInternalTransferDto) {
    return this.internalTransfersService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.internalTransfersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInternalTransferDto,
  ) {
    return this.internalTransfersService.update(id, updateDto);
  }

  @Post(':id/validate')
  validate(@Param('id') id: string, @Request() req) {
    return this.internalTransfersService.validate(id, req.user.id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.internalTransfersService.cancel(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.internalTransfersService.cancel(id);
  }
}

