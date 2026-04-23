const fs = require('fs');

// 1. Create sig-monitor.ts from tg-monitor.ts
let tgMonitor = fs.readFileSync('apps/web/src/app/actions/tg-monitor.ts', 'utf8');
let sigMonitor = tgMonitor
  .replace(/tgGroup/g, 'sigGroup')
  .replace(/tgChannel/g, 'sigStory')
  .replace(/tgChat/g, 'sigChat')
  .replace(/ChannelLogs/g, 'StoryLogs')
  .replace(/ChannelTarget/g, 'StoryTarget')
  .replace(/getChannelLogs/g, 'getStoryLogs')
  .replace(/addChannelTarget/g, 'addStoryTarget')
  .replace(/removeChannelTarget/g, 'removeStoryTarget')
  .replace(/status/g, 'story')
  .replace(/channelId/g, 'storyId')
  .replace(/3002/g, '3003')
  .replace(/3001/g, '3003') // if there were any 3001 left
  .replace(/Telegram/g, 'Signal');

fs.writeFileSync('apps/web/src/app/actions/sig-monitor.ts', sigMonitor, 'utf8');

// 2. Create webhooks route
let tgWebhook = fs.readFileSync('apps/web/src/app/api/webhooks/telegram/route.ts', 'utf8');
let sigWebhook = tgWebhook
  .replace(/tgGroup/g, 'sigGroup')
  .replace(/tgChannel/g, 'sigStory')
  .replace(/tgChat/g, 'sigChat')
  .replace(/channelId/g, 'storyId')
  .replace(/status/g, 'story')
  .replace(/Telegram/g, 'Signal');

fs.mkdirSync('apps/web/src/app/api/webhooks/signal', { recursive: true });
fs.writeFileSync('apps/web/src/app/api/webhooks/signal/route.ts', sigWebhook, 'utf8');

// 3. Create Modals
function copyModal(src, dest, oldLogs, newLogs, oldTarget, newTarget, oldComp, newComp) {
  let content = fs.readFileSync(src, 'utf8');
  content = content
    .replace(/tg-monitor/g, 'sig-monitor')
    .replace(new RegExp(oldLogs, 'g'), newLogs)
    .replace(new RegExp(oldTarget, 'g'), newTarget)
    .replace(new RegExp(oldComp, 'g'), newComp)
    .replace(/tgGroup/g, 'sigGroup')
    .replace(/tgChannel/g, 'sigStory')
    .replace(/tgChat/g, 'sigChat')
    .replace(/Telegram/g, 'Signal');
    
  fs.writeFileSync(dest, content, 'utf8');
}

copyModal(
  'apps/web/src/app/(dashboard)/multi-channel/tg-chat-monitor-modal.tsx', 
  'apps/web/src/app/(dashboard)/multi-channel/sig-chat-monitor-modal.tsx',
  'TgChatLogs', 'SigChatLogs', 'TgChatTarget', 'SigChatTarget', 'TgChatMonitorModal', 'SigChatMonitorModal'
);

copyModal(
  'apps/web/src/app/(dashboard)/multi-channel/tg-group-monitor-modal.tsx', 
  'apps/web/src/app/(dashboard)/multi-channel/sig-group-monitor-modal.tsx',
  'GroupLogs', 'GroupLogs', 'GroupTarget', 'GroupTarget', 'GroupMonitorModal', 'SigGroupMonitorModal'
);

copyModal(
  'apps/web/src/app/(dashboard)/multi-channel/tg-channel-monitor-modal.tsx', 
  'apps/web/src/app/(dashboard)/multi-channel/sig-story-monitor-modal.tsx',
  'ChannelLogs', 'StoryLogs', 'ChannelTarget', 'StoryTarget', 'ChannelMonitorModal', 'SigStoryMonitorModal'
);

// 4. Create Node Panel
let tgPanel = fs.readFileSync('apps/web/src/app/(dashboard)/multi-channel/tg-node-panel.tsx', 'utf8');
let sigPanel = tgPanel
  .replace(/tg-channel-monitor-modal/g, 'sig-story-monitor-modal')
  .replace(/tg-group-monitor-modal/g, 'sig-group-monitor-modal')
  .replace(/tg-chat-monitor-modal/g, 'sig-chat-monitor-modal')
  .replace(/ChannelMonitorModal/g, 'SigStoryMonitorModal')
  .replace(/GroupMonitorModal/g, 'SigGroupMonitorModal')
  .replace(/TgChatMonitorModal/g, 'SigChatMonitorModal')
  .replace(/TgNodePanel/g, 'SigNodePanel')
  .replace(/Telegram/g, 'Signal')
  .replace(/telegram/g, 'signal')
  .replace(/Tg/g, 'Sig')
  .replace(/tg/g, 'sig');

fs.writeFileSync('apps/web/src/app/(dashboard)/multi-channel/sig-node-panel.tsx', sigPanel, 'utf8');

console.log("Done generating files");
