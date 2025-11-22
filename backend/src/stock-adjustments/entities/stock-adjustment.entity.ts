import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { User } from '../../users/entities/user.entity';
import { StockAdjustmentItem } from './stock-adjustment-item.entity';

export enum StockAdjustmentStatus {
  DRAFT = 'draft',
  WAITING = 'waiting',
  READY = 'ready',
  DONE = 'done',
  CANCELED = 'canceled',
}

export enum AdjustmentReason {
  DAMAGE = 'damage',
  LOSS = 'loss',
  FOUND = 'found',
  CYCLE_COUNT = 'cycle_count',
  OTHER = 'other',
}

@Entity('stock_adjustments')
export class StockAdjustment extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  adjustmentNumber: string;

  @Column({ type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({
    type: 'varchar',
    length: 20,
  })
  reason: AdjustmentReason;

  @Column({
    type: 'varchar',
    length: 20,
    default: StockAdjustmentStatus.DRAFT,
  })
  status: StockAdjustmentStatus;

  @Column({ type: 'date', nullable: true })
  adjustmentDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  validatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  validatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'validatedBy' })
  validator: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @OneToMany(() => StockAdjustmentItem, (item) => item.adjustment, {
    cascade: true,
  })
  items: StockAdjustmentItem[];
}

