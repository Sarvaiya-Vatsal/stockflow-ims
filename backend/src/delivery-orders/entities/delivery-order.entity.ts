import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { User } from '../../users/entities/user.entity';
import { DeliveryOrderItem } from './delivery-order-item.entity';

export enum DeliveryOrderStatus {
  DRAFT = 'draft',
  PICKING = 'picking',
  PACKING = 'packing',
  READY = 'ready',
  DONE = 'done',
  CANCELED = 'canceled',
}

@Entity('delivery_orders')
export class DeliveryOrder extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerName: string;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({
    type: 'varchar',
    length: 20,
    default: DeliveryOrderStatus.DRAFT,
  })
  status: DeliveryOrderStatus;

  @Column({ type: 'date', nullable: true })
  deliveryDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedDate: Date;

  @Column({ type: 'uuid', nullable: true })
  validatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'validatedBy' })
  validator: User;

  @Column({ type: 'timestamp', nullable: true })
  validatedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @OneToMany(() => DeliveryOrderItem, (item) => item.deliveryOrder, {
    cascade: true,
  })
  items: DeliveryOrderItem[];
}

