const fs = require('fs');

let mcStr = fs.readFileSync('apps/web/src/app/actions/multi-channel.ts', 'utf8');

const smsIdx = mcStr.indexOf('export async function createSMSNode');
if (smsIdx !== -1) {
  let smsBlock = mcStr.substring(smsIdx);
  
  let emailBlock = smsBlock
    .replace(/SMS/g, 'Email')
    .replace(/sms/g, 'email')
    .replace(/Sms/g, 'Email');
    
  if (!mcStr.includes('createEmailNode')) {
    mcStr += '\n\n// --- EMAIL NODE ACTIONS ---\n' + emailBlock;
    fs.writeFileSync('apps/web/src/app/actions/multi-channel.ts', mcStr, 'utf8');
    console.log('Appended Email Node Actions');
  } else {
    console.log('createEmailNode already exists');
  }
} else {
  console.log('Could not find createSMSNode');
}
