const fs = require('fs');
const path = require('path');

const dir = 'apps/web/src/app/(dashboard)/multi-channel';

const replacements = {
  tg: {
    'WA Group': 'Telegram Group',
    'Status WA': 'Telegram Channel',
    'WhatsApp': 'Telegram',
    'WAG': 'TG Group',
    'Status WA Targets': 'Channel Targets',
    'Grup WA': 'Grup Telegram',
    'Status WA Monitor': 'Telegram Channel Monitor',
    'WA Group Monitor': 'Telegram Group Monitor'
  },
  sig: {
    'WA Group': 'Signal Group',
    'Status WA': 'Signal Story',
    'WhatsApp': 'Signal',
    'WAG': 'Signal Group',
    'Status WA Targets': 'Story Targets',
    'Grup WA': 'Grup Signal',
    'Status WA Monitor': 'Signal Story Monitor',
    'WA Group Monitor': 'Signal Group Monitor'
  },
  sms: {
    'WA Group': 'SMS Broadcast',
    'Status WA': 'SMS Blast',
    'WhatsApp': 'SMS',
    'WAG': 'SMS Broadcast',
    'Status WA Targets': 'Blast Targets',
    'Grup WA': 'SMS Broadcast',
    'Status WA Monitor': 'SMS Blast Monitor',
    'WA Group Monitor': 'SMS Broadcast Monitor'
  },
  email: {
    'WA Group': 'Mailing List',
    'Status WA': 'Email Newsletter',
    'WhatsApp': 'Email',
    'WAG': 'Mailing List',
    'Status WA Targets': 'Newsletter Targets',
    'Grup WA': 'Mailing List',
    'Status WA Monitor': 'Email Newsletter Monitor',
    'WA Group Monitor': 'Mailing List Monitor'
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
    
    // Sort keys by length descending to replace larger phrases first
    const keys = Object.keys(replacements[type]).sort((a, b) => b.length - a.length);
    
    keys.forEach(k => {
      const regex = new RegExp(k, 'gi');
      content = content.replace(regex, replacements[type][k]);
    });
    
    // also replace 'WA' standalone if needed, but be careful
    content = content.replace(/\bWA\b/g, replacements[type]['WhatsApp']);
    
    if (content !== original) {
      fs.writeFileSync(path.join(dir, f), content, 'utf8');
      console.log('Fixed labels in', f);
    }
  }
});
