import { AppDataSource } from './data-source';
import { ConfigurationEntity } from '../config/configuration.entity';

async function run() {
  await AppDataSource.initialize();
  const configRepo = AppDataSource.getRepository(ConfigurationEntity);

  const defaults: Array<{ key: string; value: Record<string, unknown> | Array<Record<string, unknown>> }> = [
    {
      key: 'field_mapping',
      value: {
        'lead_data.full_name': 'NAME',
        'lead_data.email': 'EMAIL[0][VALUE]',
        'lead_data.phone': 'PHONE[0][VALUE]',
        'lead_data.city': 'UF_CRM_CITY',
        'campaign.campaign_name': 'UF_CRM_UTM_CAMPAIGN',
        'campaign.ad_name': 'UF_CRM_AD_NAME',
        'lead_data.ttclid': 'UF_CRM_TTCLID',
      },
    },
    {
      key: 'deal_rules',
      value: [
        {
          condition: "campaign.campaign_name CONTAINS 'sale'",
          action: 'create_deal',
          pipeline_id: '1',
          stage_id: 'NEW',
          probability: 30,
        },
      ] as Array<Record<string, unknown>>,
    },
  ];

  for (const d of defaults) {
    const exists = await configRepo.findOne({ where: { key: d.key } });
    if (exists) {
      exists.value = d.value;
      await configRepo.save(exists);
    } else {
      const row = configRepo.create(d);
      await configRepo.save(row);
    }
  }

  await AppDataSource.destroy();
  // eslint-disable-next-line no-console
  console.log('Seed completed');
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


