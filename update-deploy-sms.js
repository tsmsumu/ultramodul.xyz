const fs = require('fs');

let c = fs.readFileSync('scripts/deploy-rescue.js', 'utf8');

c = c.replace(
  'pm2 start index.js --name "sig-engine"',
  'pm2 start index.js --name "sig-engine"\ncd /var/www/ultramodul/apps/sms-engine\npm2 delete sms-engine || true\npm2 start index.js --name "sms-engine"'
);

fs.writeFileSync('scripts/deploy-rescue.js', c, 'utf8');
console.log('Updated deploy-rescue.js with sms-engine');
