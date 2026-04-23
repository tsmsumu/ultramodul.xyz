const fs = require('fs');

function replaceType(path) {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(/type:\s*['"]chat['"]\s*\|\s*['"]wag['"]\s*\|\s*['"]status['"]/g, 'type: "chat" | "wag" | "status" | "tgGroup" | "tgChannel" | "tgChat"');
  c = c.replace(/type:\s*['"]status['"]\s*\|\s*['"]wag['"]\s*\|\s*['"]chat['"]/g, 'type: "status" | "wag" | "chat" | "tgGroup" | "tgChannel" | "tgChat"');
  
  c = c.replace(/case 'wag': return (.*);/g, "case 'wag': case 'tgGroup': return $1;");
  c = c.replace(/if \(type === 'wag'\) return 'emerald';/g, "if (type === 'wag' || type === 'tgGroup') return 'emerald';");
  
  fs.writeFileSync(path, c, 'utf8');
}

const dir = 'apps/web/src/components';
const files = fs.readdirSync(dir);
for (const file of files) {
  if (file.endsWith('.tsx')) {
    replaceType(dir + '/' + file);
  }
}
