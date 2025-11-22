import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
  RECEIPT = 'receipt',
  DELIVERY = 'delivery',
  TRANSFER_OUT = 'transfer_out',
  TRANSFER_IN = 'transfer_in',
  ADJUSTMENT = 'adjustment',
}

@Entity('audit_ledger')
@Index(['productId', 'timestamp'])
@Index(['warehouseId', 'timestamp'])
@Index(['documentId', 'documentNumber'])
export class AuditLedger extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 20,
  })
  transactionType: TransactionType;

  @Column({ type: 'uuid' })
  documentId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  documentNumber: string;

  @Column({ type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'integer' })
  quantityBefore: number;

  @Column({ type: 'integer' })
  quantityAfter: number;

  @Column({ type: 'integer' })
  quantityChange: number;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}

