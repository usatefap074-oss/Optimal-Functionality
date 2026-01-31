#!/usr/bin/env node

/**
 * Script to setup Telegram webhook for production
 * Usage: node setup-telegram-webhook.js <your-domain.com>
 */

const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const domain = process.argv[2];

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not found in environment variables');
  process.exit(1);
}

if (!domain) {
  console.error('❌ Please provide your domain as argument');
  console.log('Usage: node setup-telegram-webhook.js your-domain.com');
  process.exit(1);
}

const webhookUrl = `https://${domain}/api/telegram/webhook`;

console.log(`🔧 Setting up webhook for: ${webhookUrl}`);

const data = JSON.stringify({
  url: webhookUrl
});

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${BOT_TOKEN}/setWebhook`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    const result = JSON.parse(responseData);
    
    if (result.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(`📍 URL: ${webhookUrl}`);
    } else {
      console.error('❌ Failed to set webhook:', result.description);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

req.write(data);
req.end();
