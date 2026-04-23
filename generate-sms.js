const fs = require('fs');

const sigNodeStr = fs.readFileSync('apps/web/src/app/(dashboard)/multi-channel/sig-node-panel.tsx', 'utf8');
const smsNodeStr = sigNodeStr
  .replace(/Signal/g, 'SMS')
  .replace(/signal/g, 'sms')
  .replace(/sig/g, 'sms')
  .replace(/Sig/g, 'Sms')
  .replace(/PORT 3003/g, 'PORT 3004')
  .replace(/3003/g, '3004')
  .replace(/QR Code/g, 'API Key')
  .replace(/OTP/g, 'Token');
fs.writeFileSync('apps/web/src/app/(dashboard)/multi-channel/sms-node-panel.tsx', smsNodeStr, 'utf8');

const modals = ['chat', 'group', 'story'];
for (const m of modals) {
  const sigModalStr = fs.readFileSync(`apps/web/src/app/(dashboard)/multi-channel/sig-${m}-monitor-modal.tsx`, 'utf8');
  let smsModalStr = sigModalStr
    .replace(/Signal/g, 'SMS')
    .replace(/signal/g, 'sms')
    .replace(/sig/g, 'sms')
    .replace(/Sig/g, 'Sms')
    .replace(/sigChat/g, 'smsChat')
    .replace(/sigGroup/g, 'smsGroup')
    .replace(/sigStory/g, 'smsStory');
  fs.writeFileSync(`apps/web/src/app/(dashboard)/multi-channel/sms-${m}-monitor-modal.tsx`, smsModalStr, 'utf8');
}

const sigActionStr = fs.readFileSync('apps/web/src/app/actions/sig-monitor.ts', 'utf8');
const smsActionStr = sigActionStr
  .replace(/Signal/g, 'SMS')
  .replace(/signal/g, 'sms')
  .replace(/sig/g, 'sms')
  .replace(/Sig/g, 'Sms');
fs.writeFileSync('apps/web/src/app/actions/sms-monitor.ts', smsActionStr, 'utf8');

console.log('Created SMS UI components and actions');
