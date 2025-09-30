const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🚀 Testing TikTok-Bitrix24 Integration APIs...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Testing Health Check...');
    const health = await axios.get(`${BASE_URL}/api/v1/health`);
    console.log('✅ Health Check:', health.data);
    console.log('');

    // 2. Leads API
    console.log('2️⃣ Testing Leads API...');
    const leads = await axios.get(`${BASE_URL}/api/v1/leads`);
    console.log('✅ Leads List:', leads.data);
    console.log('');

    // 3. Config Mappings
    console.log('3️⃣ Testing Config Mappings...');
    const mappings = await axios.get(`${BASE_URL}/api/v1/config/mappings`);
    console.log('✅ Field Mappings:', mappings.data);
    console.log('');

    // 4. Config Rules
    console.log('4️⃣ Testing Config Rules...');
    const rules = await axios.get(`${BASE_URL}/api/v1/config/rules`);
    console.log('✅ Deal Rules:', rules.data);
    console.log('');

    // 5. Deals API
    console.log('5️⃣ Testing Deals API...');
    const deals = await axios.get(`${BASE_URL}/api/v1/deals`);
    console.log('✅ Deals List:', deals.data);
    console.log('');

    // 6. Analytics API
    console.log('6️⃣ Testing Analytics API...');
    const analytics = await axios.get(`${BASE_URL}/api/v1/analytics/conversion-rates`);
    console.log('✅ Conversion Rates:', analytics.data);
    console.log('');

    // 7. Campaign Performance
    console.log('7️⃣ Testing Campaign Performance...');
    const campaign = await axios.get(`${BASE_URL}/api/v1/analytics/campaign-performance`);
    console.log('✅ Campaign Performance:', campaign.data);
    console.log('');

    // 8. Test TikTok Webhook (Mock)
    console.log('8️⃣ Testing TikTok Webhook...');
    const webhookData = {
      event_id: 'test_event_' + Date.now(),
      event: 'lead.generate',
      timestamp: Math.floor(Date.now() / 1000),
      advertiser_id: 'test_advertiser',
      data: {
        external_id: 'test_' + Date.now(),
        name: 'Test User',
        email: 'test@example.com',
        phone: '+84901234567',
        campaign_id: 'test_campaign',
        ad_id: 'test_ad'
      }
    };

    const webhook = await axios.post(`${BASE_URL}/webhooks/tiktok/leads`, webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'X-TikTok-Signature': 'mock_signature'
      }
    });
    console.log('✅ TikTok Webhook Response:', webhook.data);
    console.log('');

    // 9. Check if lead was created
    console.log('9️⃣ Checking if lead was created...');
    const leadsAfter = await axios.get(`${BASE_URL}/api/v1/leads`);
    console.log('✅ Leads after webhook:', leadsAfter.data);
    console.log('');

    console.log('🎉 All API tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
