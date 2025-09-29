import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFormIdToLeads1737971200000 implements MigrationInterface {
  name = 'AddFormIdToLeads1737971200000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "form_id" varchar(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN IF EXISTS "form_id"`);
  }
}


