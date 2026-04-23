const fs = require('fs');

let schemaStr = fs.readFileSync('packages/db/src/schema.ts', 'utf8');

// Copy signal schema block and rename to sms
const startTag = '// --- SIGNAL INTEL SCHEMA ---';
const startIdx = schemaStr.indexOf(startTag);
if (startIdx !== -1) {
  const nextTag = '// ---';
  let endIdx = schemaStr.indexOf(nextTag, startIdx + startTag.length);
  if (endIdx === -1) endIdx = schemaStr.length;
  
  const sigBlock = schemaStr.substring(startIdx, endIdx);
  const smsBlock = sigBlock
    .replace(/\/\/ --- SIGNAL INTEL SCHEMA ---/g, '// --- SMS INTEL SCHEMA ---')
    .replace(/sigStoryTargets/g, 'smsStoryTargets')
    .replace(/sigStoryLogs/g, 'smsStoryLogs')
    .replace(/sigGroupTargets/g, 'smsGroupTargets')
    .replace(/sigGroupLogs/g, 'smsGroupLogs')
    .replace(/sigChatTargets/g, 'smsChatTargets')
    .replace(/sigChatLogs/g, 'smsChatLogs');
    
  schemaStr += '\n\n' + smsBlock;
  fs.writeFileSync('packages/db/src/schema.ts', schemaStr, 'utf8');
}
