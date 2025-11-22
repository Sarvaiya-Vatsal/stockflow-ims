import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { User } from '../../users/entities/user.entity';
import { ReceiptItem } from './receipt-item.entity';

export enum ReceiptStatus {
  DRAFT = 'draft',
  WAITING = 'waiting',
  READY = 'ready',
  DONE = 'done',
  CANCELED = 'canceled',
}

@Entity('receipts')
export class Receipt extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  receiptNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplierName: string;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({
    type: 'varchar',
    length: 20,
    default: ReceiptStatus.DRAFT,
  })
  status: ReceiptStatus;

  @Column({ type: 'date', nullable: true })
  expectedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  receivedDate: Date;

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

  @OneToMany(() => ReceiptItem, (item) => item.receipt, { cascade: true })
  items: ReceiptItem[];
}

