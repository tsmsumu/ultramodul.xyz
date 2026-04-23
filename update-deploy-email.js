const fs = require('fs');

let c = fs.readFileSync('scripts/deploy-rescue.js', 'utf8');

c = c.replace(
  'pm2 start index.js --name "sms-engine"',
  'pm2 start index.js --name "sms-engine"\ncd /var/www/ultramodul/apps/email-engine\npm2 delete email-engine || true\npm2 start index.js --name "email-engine"'
);

fs.writeFileSync('scripts/deploy-rescue.js', c, 'utf8');
console.log('Updated deploy-rescue.js with email-engine');
