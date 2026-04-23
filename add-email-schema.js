const fs = require('fs');

let schemaStr = fs.readFileSync('packages/db/src/schema.ts', 'utf8');

const startTag = '// --- SMS INTELLIGENCE MONITOR ---';
const startIdx = schemaStr.indexOf(startTag);

if (startIdx !== -1) {
  let smsBlock = schemaStr.substring(startIdx);
  let emailBlock = smsBlock
    .replace(/\/\/ --- SMS INTELLIGENCE MONITOR ---/g, '// --- EMAIL INTELLIGENCE MONITOR ---')
    .replace(/smsStoryTargets/g, 'emailStoryTargets')
    .replace(/smsStoryLogs/g, 'emailStoryLogs')
    .replace(/smsGroupTargets/g, 'emailGroupTargets')
    .replace(/smsGroupLogs/g, 'emailGroupLogs')
    .replace(/smsChatTargets/g, 'emailChatTargets')
    .replace(/smsChatLogs/g, 'emailChatLogs')
    .replace(/'sms_story_targets'/g, "'email_story_targets'")
    .replace(/'sms_story_logs'/g, "'email_story_logs'")
    .replace(/'sms_group_targets'/g, "'email_group_targets'")
    .replace(/'sms_group_logs'/g, "'email_group_logs'")
    .replace(/'sms_chat_targets'/g, "'email_chat_targets'")
    .replace(/'sms_chat_logs'/g, "'email_chat_logs'");
    
  schemaStr += '\n\n' + emailBlock;
  fs.writeFileSync('packages/db/src/schema.ts', schemaStr, 'utf8');
  console.log('Added email schema');
} else {
  console.log('Could not find SMS schema block');
}
