import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'leads' })
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  external_id!: string;

  @Column({ type: 'varchar', length: 50, default: 'tiktok' })
  source!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  campaign_id!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ad_id!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  form_id!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  raw_data!: Record<string, unknown> | null;

  @Column({ type: 'int', nullable: true })
  bitrix24_id!: number | null;

  @Column({ type: 'varchar', length: 50, default: 'new' })
  status!: string;

  @Column({ type: 'int', default: 0 })
  score!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;
}


