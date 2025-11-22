import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { DeliveryOrder } from './delivery-order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('delivery_order_items')
export class DeliveryOrderItem extends BaseEntity {
  @Column({ type: 'uuid' })
  deliveryOrderId: string;

  @ManyToOne(() => DeliveryOrder, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'deliveryOrderId' })
  deliveryOrder: DeliveryOrder;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'integer', default: 0 })
  pickedQuantity: number;

  @Column({ type: 'integer', default: 0 })
  packedQuantity: number;
}

