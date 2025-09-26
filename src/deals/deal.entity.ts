import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lead } from '../leads/lead.entity';

@Entity({ name: 'deals' })
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Lead, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lead_id' })
  lead!: Lead | null;

  @Column({ type: 'int', nullable: true })
  bitrix24_id!: number | null;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  amount!: string | null;

  @Column({ type: 'varchar', length: 3, default: 'VND' })
  currency!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  stage!: string | null;

  @Column({ type: 'int', default: 0 })
  probability!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}


