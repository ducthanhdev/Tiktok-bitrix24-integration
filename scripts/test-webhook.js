const crypto = require('crypto');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const SECRET = 'changeme'; // TIKTOK_WEBHOOK_SECRET

function generateSignature(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64');
}

async function testWebhook() {
  console.log('🔐 Testing TikTok Webhook with proper signature...\n');

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

  const payload = JSON.stringify(webhookData);
  const signature = generateSignature(payload, SECRET);

  try {
    const response = await axios.post(`${BASE_URL}/webhooks/tiktok/leads`, webhookData, {
      headers: {
        'Content-Type': 'application/json',
        'tiktok-signature': signature
      }
    });

    console.log('✅ Webhook Response:', response.data);
    
    // Check if lead was created
    console.log('\n🔍 Checking if lead was created...');
    const leads = await axios.get(`${BASE_URL}/api/v1/leads`);
    console.log('✅ Leads after webhook:', leads.data);

  } catch (error) {
    console.error('❌ Webhook test failed:', error.response?.data || error.message);
  }
}

testWebhook();
