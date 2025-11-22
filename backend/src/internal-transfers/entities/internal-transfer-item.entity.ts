import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { InternalTransfer } from './internal-transfer.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('internal_transfer_items')
export class InternalTransferItem extends BaseEntity {
  @Column({ type: 'uuid' })
  transferId: string;

  @ManyToOne(() => InternalTransfer, (transfer) => transfer.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transferId' })
  transfer: InternalTransfer;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'integer' })
  quantity: number;
}

