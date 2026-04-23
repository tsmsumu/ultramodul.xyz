const fs = require('fs');

const updateTypes = (path) => {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(/"sigStory" | "sigChat"/g, '"sigStory" | "sigChat" | "smsChat" | "smsGroup" | "smsStory"');
  fs.writeFileSync(path, c, 'utf8');
};

updateTypes('apps/web/src/components/LogAnalytics.tsx');
updateTypes('apps/web/src/components/ImportMenu.tsx');

// Add sms Webhook Route
const sigWebhook = fs.readFileSync('apps/web/src/app/api/webhooks/signal/route.ts', 'utf8');
let smsWebhook = sigWebhook
  .replace(/Signal/g, 'SMS')
  .replace(/signal/g, 'sms')
  .replace(/sig/g, 'sms')
  .replace(/Sig/g, 'Sms');
  
fs.mkdirSync('apps/web/src/app/api/webhooks/sms', { recursive: true });
fs.writeFileSync('apps/web/src/app/api/webhooks/sms/route.ts', smsWebhook, 'utf8');

console.log('Updated types and webhooks');
