import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLeadScore1737971300000 implements MigrationInterface {
  name = 'AddLeadScore1737971300000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "score" integer DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN IF EXISTS "score"`);
  }
}


