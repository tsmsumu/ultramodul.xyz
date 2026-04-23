const fs = require('fs');

let c = fs.readFileSync('scripts/deploy-rescue.js', 'utf8');

c = c.replace('pm2 start index.js --name "tg-engine"', 'pm2 start index.js --name "tg-engine"\ncd /var/www/ultramodul/apps/sig-engine\npm2 delete sig-engine || true\npm2 start index.js --name "sig-engine"');

fs.writeFileSync('scripts/deploy-rescue.js', c, 'utf8');
