import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { StockLevel } from './entities/stock-level.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(StockLevel)
    private stockLevelRepository: Repository<StockLevel>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // Check if SKU already exists
    const existingProduct = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new BadRequestException('Product with this SKU already exists');
    }

    // Validate category if provided
    if (createProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: createProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Create product
    const product = this.productRepository.create({
      sku: createProductDto.sku,
      name: createProductDto.name,
      description: createProductDto.description,
      categoryId: createProductDto.categoryId,
      unitOfMeasure: createProductDto.unitOfMeasure,
      reorderPoint: createProductDto.reorderPoint || 0,
      metadata: createProductDto.metadata,
    });

    const savedProduct = await this.productRepository.save(product);

    // Create initial stock levels if provided
    if (createProductDto.initialStock) {
      const warehouse = await this.warehouseRepository.findOne({
        where: { id: createProductDto.initialStock.warehouseId },
      });

      if (!warehouse) {
        throw new NotFoundException('Warehouse not found');
      }

      const stockLevel = this.stockLevelRepository.create({
        productId: savedProduct.id,
        warehouseId: createProductDto.initialStock.warehouseId,
        quantity: createProductDto.initialStock.quantity,
        reservedQuantity: 0,
        version: 0,
      });

      await this.stockLevelRepository.save(stockLevel);
    }

    return this.findOne(savedProduct.id);
  }

  async findAll(filterDto: FilterProductDto) {
    const {
      search,
      categoryId,
      warehouseId,
      lowStockOnly,
      page = 1,
      limit = 20,
    } = filterDto;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.stockLevels', 'stockLevel')
      .leftJoinAndSelect('stockLevel.warehouse', 'warehouse');

    // Search by SKU or name
    if (search) {
      queryBuilder.andWhere(
        '(product.sku ILIKE :search OR product.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by category
    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Filter by warehouse
    if (warehouseId) {
      queryBuilder.andWhere('stockLevel.warehouseId = :warehouseId', {
        warehouseId,
      });
    }

    // Filter low stock only
    if (lowStockOnly) {
      queryBuilder.andWhere('stockLevel.quantity <= product.reorderPoint');
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by name
    queryBuilder.orderBy('product.name', 'ASC');

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'stockLevels', 'stockLevels.warehouse'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findBySku(sku: string) {
    const product = await this.productRepository.findOne({
      where: { sku },
      relations: ['category', 'stockLevels', 'stockLevels.warehouse'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    // Check SKU uniqueness if updating SKU
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });

      if (existingProduct) {
        throw new BadRequestException('Product with this SKU already exists');
      }
    }

    // Validate category if provided
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Update product
    Object.assign(product, updateProductDto);
    await this.productRepository.save(product);

    return this.findOne(id);
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    // Check if product has stock or transactions
    const stockLevels = await this.stockLevelRepository.find({
      where: { productId: id },
    });

    const hasStock = stockLevels.some((sl) => sl.quantity > 0);

    if (hasStock) {
      throw new BadRequestException(
        'Cannot delete product with existing stock. Adjust stock to zero first.',
      );
    }

    // Soft delete by setting a flag (or hard delete if preferred)
    await this.productRepository.remove(product);

    return { message: 'Product deleted successfully' };
  }
}

