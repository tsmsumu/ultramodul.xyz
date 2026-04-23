const fs = require('fs');
const path = require('path');

const dir = 'apps/web/src/app/(dashboard)/multi-channel';

['wa', 'tg', 'sig', 'sms', 'email'].forEach(type => {
  const f = path.join(dir, `${type}-node-panel.tsx`);
  if (!fs.existsSync(f)) return;
  
  let content = fs.readFileSync(f, 'utf8');
  const target = 'className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-3"';
  const replacement = 'className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3"';
  
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed layout in', type);
  }
});
