const fs = require('fs');

let schemaStr = fs.readFileSync('packages/db/src/schema.ts', 'utf8');

const startTag = '// --- SMS INTELLIGENCE MONITOR ---';
const startIdx = schemaStr.indexOf(startTag);

if (startIdx !== -1) {
  let smsBlock = schemaStr.substring(startIdx);
  smsBlock = smsBlock
    .replace(/'sig_story_targets'/g, "'sms_story_targets'")
    .replace(/'sig_story_logs'/g, "'sms_story_logs'")
    .replace(/'sig_group_targets'/g, "'sms_group_targets'")
    .replace(/'sig_group_logs'/g, "'sms_group_logs'")
    .replace(/'sig_chat_targets'/g, "'sms_chat_targets'")
    .replace(/'sig_chat_logs'/g, "'sms_chat_logs'");
    
  schemaStr = schemaStr.substring(0, startIdx) + smsBlock;
  fs.writeFileSync('packages/db/src/schema.ts', schemaStr, 'utf8');
  console.log('Fixed schema table names');
}
