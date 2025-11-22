import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { StockLevel } from '../products/entities/stock-level.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
    @InjectRepository(StockLevel)
    private stockLevelRepository: Repository<StockLevel>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto) {
    const warehouse = this.warehouseRepository.create(createWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async findAll() {
    return this.warehouseRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findAllIncludingInactive() {
    return this.warehouseRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string) {
    const warehouse = await this.warehouseRepository.findOne({
      where: { id },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    const warehouse = await this.findOne(id);
    Object.assign(warehouse, updateWarehouseDto);
    return this.warehouseRepository.save(warehouse);
  }

  async remove(id: string) {
    const warehouse = await this.findOne(id);

    // Check if warehouse has stock
    const stockLevels = await this.stockLevelRepository.find({
      where: { warehouseId: id },
    });

    const hasStock = stockLevels.some((sl) => sl.quantity > 0 || sl.reservedQuantity > 0);

    if (hasStock) {
      throw new BadRequestException(
        'Cannot delete warehouse with existing stock. Transfer or adjust stock first.',
      );
    }

    // Soft delete by setting isActive to false
    warehouse.isActive = false;
    await this.warehouseRepository.save(warehouse);

    return { message: 'Warehouse deactivated successfully' };
  }
}

