import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAssignedToToDeals1737971000000 implements MigrationInterface {
  name = 'AddAssignedToToDeals1737971000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deals" ADD COLUMN IF NOT EXISTS "assigned_to" varchar(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "deals" DROP COLUMN IF EXISTS "assigned_to"`);
  }
}


