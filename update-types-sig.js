const fs = require('fs');

function replaceType(path) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(/type:\s*['"]chat['"]\s*\|\s*['"]wag['"]\s*\|\s*['"]status['"]\s*\|\s*['"]tgGroup['"]\s*\|\s*['"]tgChannel['"]\s*\|\s*['"]tgChat['"]/g, 'type: "chat" | "wag" | "status" | "tgGroup" | "tgChannel" | "tgChat" | "sigGroup" | "sigStory" | "sigChat"');
  c = c.replace(/type:\s*['"]status['"]\s*\|\s*['"]wag['"]\s*\|\s*['"]chat['"]\s*\|\s*['"]tgGroup['"]\s*\|\s*['"]tgChannel['"]\s*\|\s*['"]tgChat['"]/g, 'type: "status" | "wag" | "chat" | "tgGroup" | "tgChannel" | "tgChat" | "sigGroup" | "sigStory" | "sigChat"');
  
  c = c.replace(/case 'tgGroup': return (.*);/g, "case 'tgGroup': case 'sigGroup': return $1;");
  c = c.replace(/type === 'tgGroup'\) return 'emerald';/g, "type === 'tgGroup' || type === 'sigGroup') return 'emerald';");
  
  fs.writeFileSync(path, c, 'utf8');
}

const dir = 'apps/web/src/components';
const files = fs.readdirSync(dir);
for (const file of files) {
  if (file.endsWith('.tsx')) {
    replaceType(dir + '/' + file);
  }
}
