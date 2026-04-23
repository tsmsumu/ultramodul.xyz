const fs = require('fs');
const path = require('path');

const dir = 'apps/web/src/app/(dashboard)/multi-channel';

const replacements = {
  tg: {
    'WA Group': 'Telegram Group',
    'Status WA': 'Telegram Channel',
    'WhatsApp': 'Telegram',
    'WAG Intel': 'Group Intel'
  },
  sig: {
    'WA Group': 'Signal Group',
    'Status WA': 'Signal Story',
    'WhatsApp': 'Signal',
    'WAG Intel': 'Group Intel'
  },
  sms: {
    'WA Group': 'SMS Broadcast',
    'Status WA': 'SMS Blast',
    'WhatsApp': 'SMS',
    'WAG Intel': 'Blast Intel'
  },
  email: {
    'WA Group': 'Mailing List',
    'Status WA': 'Email Newsletter',
    'WhatsApp': 'Email',
    'WAG Intel': 'List Intel'
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
    
    // Replace text inside elements
    content = content.replace(/> WA Group/g, `> ${replacements[type]['WA Group']}`);
    content = content.replace(/> Status WA/g, `> ${replacements[type]['Status WA']}`);
    content = content.replace(/> WAG Intel/g, `> ${replacements[type]['WAG Intel']}`);
    content = content.replace(/Status WA Monitor/g, `${replacements[type]['Status WA']} Monitor`);
    content = content.replace(/Status WA Targets/g, `${replacements[type]['Status WA']} Targets`);
    content = content.replace(/log Status WA/g, `log ${replacements[type]['Status WA']}`);
    content = content.replace(/target Status WA/g, `target ${replacements[type]['Status WA']}`);
    
    // Specifically fix Email forms
    if (type === 'email') {
      content = content.replace(/Phone Number/g, 'Email / IMAP Host');
      content = content.replace(/Enter your phone number to login to Email MTProto API/g, 'Enter your IMAP Host or Email to initialize the Mail Gateway');
      content = content.replace(/\+62812\.\.\./g, 'imap.example.com');
      content = content.replace(/Enter 2FA Password/g, 'Enter App Password / SMTP Pass');
      content = content.replace(/Enter IMAP\/SMTP Code/g, 'Enter Authentication Code');
      content = content.replace(/Send IMAP\/SMTP/g, 'Connect IMAP/SMTP');
      content = content.replace(/Phone Mappings/gi, 'Email Mappings');
      content = content.replace(/Target Number/g, 'Target Email Address');
      content = content.replace(/0812\.\.\., \+628\.\.\., or 628\.\.\./g, 'user@example.com');
    }
    
    if (type === 'sms') {
      content = content.replace(/login to SMS MTProto API/g, 'login to SMS Gateway');
    }
    
    if (type === 'sig') {
      content = content.replace(/login to Signal MTProto API/g, 'login to Signal API');
    }

    if (type === 'tg') {
      // already ok
    }
    
    if (content !== original) {
      fs.writeFileSync(path.join(dir, f), content, 'utf8');
      console.log('Fixed texts in', f);
    }
  }
});
