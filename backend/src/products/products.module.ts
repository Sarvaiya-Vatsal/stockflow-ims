import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { StockLevel } from './entities/stock-level.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Category, StockLevel, Warehouse]),
  ],
  controllers: [ProductsController, CategoriesController],
  providers: [ProductsService, CategoriesService],
  exports: [ProductsService, CategoriesService],
})
export class ProductsModule {}

