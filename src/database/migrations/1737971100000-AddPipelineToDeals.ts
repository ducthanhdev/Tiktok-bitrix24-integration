import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPipelineToDeals1737971100000 implements MigrationInterface {
  name = 'AddPipelineToDeals1737971100000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "pipeline_id" varchar(50)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN IF EXISTS "pipeline_id"`);
  }
}


