const fs = require('fs');
let c = fs.readFileSync('apps/web/src/app/(dashboard)/multi-channel/client.tsx', 'utf8');

const startStr = '<div className="mt-12 pt-8 border-t border-white/10">\n          <div className="flex justify-between items-center bg-zinc-950/80 p-6 rounded-3xl border border-white/5 mb-6">\n            <div>\n              <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">\n                <MessageSquare className="w-5 h-5 text-indigo-400" /> Signal Cluster Manager';
const startIdx = c.indexOf(startStr);

if (startIdx !== -1) {
  const endStr = '</div>\n          )}\n        </div>';
  const endIdx = c.indexOf(endStr, startIdx) + endStr.length;
  
  const block = c.substring(startIdx, endIdx);
  c = c.substring(0, startIdx) + c.substring(endIdx);
  
  const liveExplorerEnd = c.indexOf('return (\n      <div className="space-y-6">');
  const fnEnd = c.indexOf('};', liveExplorerEnd);
  const insertIdx = c.lastIndexOf('</div>', fnEnd);
  
  c = c.substring(0, insertIdx) + block + '\n    ' + c.substring(insertIdx);
  fs.writeFileSync('apps/web/src/app/(dashboard)/multi-channel/client.tsx', c, 'utf8');
  console.log("Fixed client.tsx");
} else {
  console.log("Could not find start string");
}
