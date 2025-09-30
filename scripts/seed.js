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
  synchronize: false,
  logging: true,
});

async function seedData() {
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');
    
    const configRepo = dataSource.getRepository('ConfigurationEntity');
    
    // Seed field mapping
    const fieldMapping = {
      key: 'field_mapping',
      value: {
        'name': 'NAME',
        'email': 'EMAIL', 
        'phone': 'PHONE',
        'company': 'COMPANY',
        'source': 'SOURCE',
        'campaign_id': 'UF_CRM_CAMPAIGN_ID'
      }
    };
    
    await configRepo.upsert(fieldMapping, ['key']);
    console.log('Field mapping seeded');
    
    // Seed deal rules
    const dealRules = {
      key: 'deal_rules',
      value: {
        'default_stage': 'NEW',
        'default_probability': 10,
        'default_pipeline_id': 1,
        'auto_assign': true,
        'rules': [
          {
            'condition': 'score >= 80',
            'stage': 'QUALIFICATION',
            'probability': 50,
            'assigned_to': 1
          },
          {
            'condition': 'score >= 60',
            'stage': 'NEW',
            'probability': 25,
            'assigned_to': 2
          }
        ]
      }
    };
    
    await configRepo.upsert(dealRules, ['key']);
    console.log('Deal rules seeded');
    
    await dataSource.destroy();
    console.log('Seed process finished!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

seedData();
