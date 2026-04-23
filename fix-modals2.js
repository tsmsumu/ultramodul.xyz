const fs = require('fs');

const fixModal = (path, oldType, newType) => {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(new RegExp(`bulkDeleteLogs\\('${oldType}'`, 'g'), `bulkDeleteLogs('${newType}'`);
  c = c.replace(new RegExp(`bulkArchiveLogs\\('${oldType}'`, 'g'), `bulkArchiveLogs('${newType}'`);
  c = c.replace(new RegExp(`bulkDeleteTargets\\('${oldType}'`, 'g'), `bulkDeleteTargets('${newType}'`);
  
  c = c.replace(new RegExp(`importLogbookData\\(providerId, '${oldType}'`, 'g'), `importLogbookData(providerId, '${newType}'`);
  
  // also fix <LogAnalytics type="status" ...> to type="story" etc.
  c = c.replace(new RegExp(`type="${oldType}"`, 'g'), `type="${newType}"`);
  
  fs.writeFileSync(path, c, 'utf8');
};

fixModal('apps/web/src/app/(dashboard)/multi-channel/sig-story-monitor-modal.tsx', 'status', 'story');
fixModal('apps/web/src/app/(dashboard)/multi-channel/sig-group-monitor-modal.tsx', 'tgGroup', 'sigGroup');
fixModal('apps/web/src/app/(dashboard)/multi-channel/sig-chat-monitor-modal.tsx', 'chat', 'chat');
