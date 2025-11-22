import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Category } from './category.entity';
import { StockLevel } from './stock-level.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unitOfMeasure: string; // 'pcs', 'kg', 'liters', etc.

  @Column({ type: 'integer', default: 0 })
  reorderPoint: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // { brand, supplier, barcode, etc. }

  @OneToMany(() => StockLevel, (stockLevel) => stockLevel.product)
  stockLevels: StockLevel[];
}

