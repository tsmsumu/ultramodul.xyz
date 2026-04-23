const fs = require('fs');
let c = fs.readFileSync('apps/web/src/app/(dashboard)/multi-channel/sig-story-monitor-modal.tsx', 'utf8');
c = c.replace(/type="story"/g, 'type="sigStory"');
fs.writeFileSync('apps/web/src/app/(dashboard)/multi-channel/sig-story-monitor-modal.tsx', c, 'utf8');

let c2 = fs.readFileSync('apps/web/src/app/(dashboard)/multi-channel/sig-chat-monitor-modal.tsx', 'utf8');
c2 = c2.replace(/type="chat"/g, 'type="sigChat"');
fs.writeFileSync('apps/web/src/app/(dashboard)/multi-channel/sig-chat-monitor-modal.tsx', c2, 'utf8');
