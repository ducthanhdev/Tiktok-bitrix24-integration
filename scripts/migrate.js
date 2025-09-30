const { DataSource } = require('typeorm');
const path = require('path');

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tiktok_bitrix',
  entities: [path.join(__dirname, '../dist/**/*.entity.js')],
  migrations: [path.join(__dirname, '../dist/database/migrations/*.js')],
  synchronize: false,
  logging: true,
});

async function runMigrations() {
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');
    
    const migrations = await dataSource.runMigrations();
    console.log('Migrations completed:', migrations.length);
    
    await dataSource.destroy();
    console.log('Migration process finished!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

runMigrations();
