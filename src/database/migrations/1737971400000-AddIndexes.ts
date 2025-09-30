import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1737971400000 implements MigrationInterface {
  name = 'AddIndexes1737971400000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_leads_external_id ON "leads" ("external_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON "leads" ("campaign_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON "leads" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_deals_stage ON "deals" ("stage")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON "deals" ("assigned_to")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_deals_pipeline_id ON "deals" ("pipeline_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_deals_pipeline_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_deals_assigned_to`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_deals_stage`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_leads_created_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_leads_campaign_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_leads_external_id`);
  }
}


