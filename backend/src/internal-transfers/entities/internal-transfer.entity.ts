import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { User } from '../../users/entities/user.entity';
import { InternalTransferItem } from './internal-transfer-item.entity';

export enum InternalTransferStatus {
  DRAFT = 'draft',
  WAITING = 'waiting',
  READY = 'ready',
  DONE = 'done',
  CANCELED = 'canceled',
}

@Entity('internal_transfers')
export class InternalTransfer extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  transferNumber: string;

  @Column({ type: 'uuid' })
  fromWarehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'fromWarehouseId' })
  fromWarehouse: Warehouse;

  @Column({ type: 'uuid' })
  toWarehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'toWarehouseId' })
  toWarehouse: Warehouse;

  @Column({
    type: 'varchar',
    length: 20,
    default: InternalTransferStatus.DRAFT,
  })
  status: InternalTransferStatus;

  @Column({ type: 'date', nullable: true })
  transferDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

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

  @OneToMany(() => InternalTransferItem, (item) => item.transfer, {
    cascade: true,
  })
  items: InternalTransferItem[];
}

