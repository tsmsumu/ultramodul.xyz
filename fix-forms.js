const fs = require('fs');
const path = require('path');

const dir = 'apps/web/src/app/(dashboard)/multi-channel';

// Fix Telegram
let tg = fs.readFileSync(path.join(dir, 'tg-node-panel.tsx'), 'utf8');
tg = tg.replace(/login to Telegram MTProto API/g, 'login to Telegram MTProto API');
tg = tg.replace(/login to Email MTProto API/g, 'login to Telegram MTProto API');
tg = tg.replace(/login to WhatsApp MTProto API/g, 'login to Telegram MTProto API');
fs.writeFileSync(path.join(dir, 'tg-node-panel.tsx'), tg, 'utf8');

// Fix Signal
let sig = fs.readFileSync(path.join(dir, 'sig-node-panel.tsx'), 'utf8');
sig = sig.replace(/login to Signal MTProto API/g, 'login to Signal API');
sig = sig.replace(/login to Email MTProto API/g, 'login to Signal API');
sig = sig.replace(/login to WhatsApp MTProto API/g, 'login to Signal API');
fs.writeFileSync(path.join(dir, 'sig-node-panel.tsx'), sig, 'utf8');

// Fix SMS
let sms = fs.readFileSync(path.join(dir, 'sms-node-panel.tsx'), 'utf8');
sms = sms.replace(/login to SMS MTProto API/g, 'login to SMS Gateway');
sms = sms.replace(/login to Email MTProto API/g, 'login to SMS Gateway');
sms = sms.replace(/login to WhatsApp MTProto API/g, 'login to SMS Gateway');
fs.writeFileSync(path.join(dir, 'sms-node-panel.tsx'), sms, 'utf8');

// Fix Email
let email = fs.readFileSync(path.join(dir, 'email-node-panel.tsx'), 'utf8');
email = email.replace(/Phone Number/g, 'Email / IMAP Host');
email = email.replace(/Enter your phone number to login to Email MTProto API/g, 'Enter your IMAP Host or Email to initialize the Mail Gateway');
email = email.replace(/\+62812\.\.\./g, 'imap.example.com');
email = email.replace(/Enter 2FA Password/g, 'Enter App Password / SMTP Pass');
email = email.replace(/Enter IMAP\/SMTP Code/g, 'Enter Authentication Code');
email = email.replace(/Send IMAP\/SMTP/g, 'Connect IMAP/SMTP');
email = email.replace(/Phone Mappings/gi, 'Email Mappings');
email = email.replace(/Target Number/g, 'Target Email Address');
email = email.replace(/0812\.\.\., \+628\.\.\., or 628\.\.\./g, 'user@example.com');
fs.writeFileSync(path.join(dir, 'email-node-panel.tsx'), email, 'utf8');

console.log('Fixed auth forms text!');
