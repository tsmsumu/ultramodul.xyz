const fs = require('fs');
let c = fs.readFileSync('scripts/deploy-rescue.js', 'utf8');

const tgEngineBlock = "        { name: 'tg-engine', script: 'apps/tg-engine/index.js', env: { NODE_ENV: 'production' } },";
const sigEngineBlock = "        { name: 'tg-engine', script: 'apps/tg-engine/index.js', env: { NODE_ENV: 'production' } },\n        { name: 'sig-engine', script: 'apps/sig-engine/index.js', env: { NODE_ENV: 'production' } },";

c = c.replace(tgEngineBlock, sigEngineBlock);
fs.writeFileSync('scripts/deploy-rescue.js', c, 'utf8');
