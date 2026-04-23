const fs = require('fs');

function replaceLiterals(path, oldStr, newStr) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(new RegExp("'" + oldStr + "'", 'g'), "'" + newStr + "'");
  c = c.replace(new RegExp('"' + oldStr + '"', 'g'), '"' + newStr + '"');
  fs.writeFileSync(path, c, 'utf8');
}

replaceLiterals('apps/web/src/app/(dashboard)/multi-channel/tg-group-monitor-modal.tsx', 'wag', 'tgGroup');
replaceLiterals('apps/web/src/app/(dashboard)/multi-channel/tg-chat-monitor-modal.tsx', 'waChat', 'chat');
