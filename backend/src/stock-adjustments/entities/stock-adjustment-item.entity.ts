import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { StockAdjustment } from './stock-adjustment.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('stock_adjustment_items')
export class StockAdjustmentItem extends BaseEntity {
  @Column({ type: 'uuid' })
  adjustmentId: string;

  @ManyToOne(() => StockAdjustment, (adjustment) => adjustment.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'adjustmentId' })
  adjustment: StockAdjustment;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'integer' })
  currentQuantity: number; // Snapshot at creation time

  @Column({ type: 'integer' })
  adjustedQuantity: number; // The new quantity after adjustment

  @Column({ type: 'integer' })
  difference: number; // calculated: adjustedQuantity - currentQuantity (can be negative)
}

