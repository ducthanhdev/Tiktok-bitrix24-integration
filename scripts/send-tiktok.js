// Quick script to send a signed TikTok webhook payload to local server
const crypto = require('node:crypto');

const url = process.env.WEBHOOK_URL || 'http://localhost:3000/webhooks/tiktok/leads';
const secret = process.env.TIKTOK_WEBHOOK_SECRET || 'changeme';

const payload = {
  event: 'lead.generate',
  event_id: 'evt_' + Math.random().toString(36).slice(2, 10),
  timestamp: Math.floor(Date.now() / 1000),
  advertiser_id: '7123456789',
  campaign: {
    campaign_id: 'cmp_' + Math.random().toString(36).slice(2, 8),
    campaign_name: 'Autumn Sale',
    ad_id: 'ad_' + Math.random().toString(36).slice(2, 8),
    ad_name: 'Teaser'
  },
  form: {
    form_id: 'form_abc123',
    form_name: 'Contact Form'
  },
  lead_data: {
    full_name: 'Test User',
    email: 'test+' + Math.random().toString(36).slice(2, 6) + '@example.com',
    phone: '+84900000000',
    city: 'Ha Noi',
    utm_source: 'tiktok',
    utm_campaign: 'autumn_sale',
    ttclid: 'TT-' + Math.random().toString(36).slice(2, 10)
  },
  custom_questions: [
    { question: 'Budget range', answer: '5-10 trieu VND' }
  ]
};

const raw = JSON.stringify(payload);
const signature = crypto.createHmac('sha256', secret).update(raw).digest('base64');

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TikTok-Signature': signature,
      },
      body: raw,
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log(text);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();


