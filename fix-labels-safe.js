const fs = require('fs');
const path = require('path');

const dir = 'apps/web/src/app/(dashboard)/multi-channel';

const replacements = {
  tg: {
    'WA Group': 'Telegram Group',
    'Status WA': 'Telegram Channel',
    'Grup WA': 'Grup Telegram',
    'WAG Intel': 'Group Intel'
  },
  sig: {
    'WA Group': 'Signal Group',
    'Status WA': 'Signal Story',
    'Grup WA': 'Grup Signal',
    'WAG Intel': 'Group Intel'
  },
  sms: {
    'WA Group': 'SMS Broadcast',
    'Status WA': 'SMS Blast',
    'Grup WA': 'SMS Broadcast',
    'WAG Intel': 'Blast Intel'
  },
  email: {
    'WA Group': 'Mailing List',
    'Status WA': 'Email Newsletter',
    'Grup WA': 'Mailing List',
    'WAG Intel': 'Mailing List Intel'
  }
};

const files = fs.readdirSync(dir);

files.forEach(f => {
  if (!f.endsWith('.tsx')) return;
  
  let type = '';
  if (f.startsWith('tg-')) type = 'tg';
  else if (f.startsWith('sig-')) type = 'sig';
  else if (f.startsWith('sms-')) type = 'sms';
  else if (f.startsWith('email-')) type = 'email';
  
  if (type) {
    let content = fs.readFileSync(path.join(dir, f), 'utf8');
    let original = content;
    
    const keys = Object.keys(replacements[type]);
    
    keys.forEach(k => {
      // Safe replacements: Only replace when it's preceded/followed by >, <, ", or space
      // For instance: > WA Group<, "Status WA", etc.
      // We'll just replace literal UI strings.
      content = content.split(`> ${k}<`).join(`> ${replacements[type][k]}<`);
      content = content.split(`>${k}<`).join(`>${replacements[type][k]}<`);
      content = content.split(`"${k}"`).join(`"${replacements[type][k]}"`);
      content = content.split(`"${k} `).join(`"${replacements[type][k]} `);
      content = content.split(` ${k}"`).join(` ${replacements[type][k]}"`);
      content = content.split(`> ${k} `).join(`> ${replacements[type][k]} `);
      content = content.split(` ${k}<`).join(` ${replacements[type][k]}<`);
      content = content.split(` ${k} `).join(` ${replacements[type][k]} `);
    });
    
    // Also specific UI replacements:
    content = content.replace(/Cari target Status WA berdasarkan Nama/g, `Cari target ${replacements[type]['Status WA']} berdasarkan Nama`);
    content = content.replace(/mencari log Status WA/g, `mencari log ${replacements[type]['Status WA']}`);
    content = content.replace(/Status WA Monitor/g, `${replacements[type]['Status WA']} Monitor`);
    content = content.replace(/Status WA Targets/g, `${replacements[type]['Status WA']} Targets`);
    
    if (content !== original) {
      fs.writeFileSync(path.join(dir, f), content, 'utf8');
      console.log('Safe-fixed labels in', f);
    }
  }
});
