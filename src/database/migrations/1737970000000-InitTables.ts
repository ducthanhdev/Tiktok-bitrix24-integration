import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTables1737970000000 implements MigrationInterface {
  name = 'InitTables1737970000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "leads" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "external_id" varchar(255) UNIQUE NOT NULL,
      "source" varchar(50) NOT NULL DEFAULT 'tiktok',
      "name" varchar(255) NOT NULL,
      "email" varchar(255),
      "phone" varchar(50),
      "campaign_id" varchar(255),
      "ad_id" varchar(255),
      "raw_data" jsonb,
      "bitrix24_id" integer,
      "status" varchar(50) DEFAULT 'new',
      "created_at" TIMESTAMPTZ DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ DEFAULT NOW()
    )`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_leads_email ON "leads" ("email")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_leads_phone ON "leads" ("phone")`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "deals" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "lead_id" uuid REFERENCES "leads"("id") ON DELETE SET NULL,
      "bitrix24_id" integer,
      "title" varchar(255) NOT NULL,
      "amount" numeric(10,2),
      "currency" varchar(3) DEFAULT 'VND',
      "stage" varchar(50),
      "probability" integer DEFAULT 0,
      "created_at" TIMESTAMPTZ DEFAULT NOW(),
      "updated_at" TIMESTAMPTZ DEFAULT NOW()
    )`);

    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "configurations" (
      "id" SERIAL PRIMARY KEY,
      "key" varchar(255) UNIQUE NOT NULL,
      "value" jsonb NOT NULL,
      "updated_at" TIMESTAMPTZ DEFAULT NOW()
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "configurations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "deals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "leads"`);
  }
}


