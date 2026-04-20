const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'apps/web/src');

// 1. Rename Folders
const tailorAppPath = path.join(projectRoot, 'app/(dashboard)/tailor');
const nexusAppPath = path.join(projectRoot, 'app/(dashboard)/nexus');
if (fs.existsSync(tailorAppPath)) fs.renameSync(tailorAppPath, nexusAppPath);

const tailorCompPath = path.join(projectRoot, 'components/tailor');
const nexusCompPath = path.join(projectRoot, 'components/nexus');
if (fs.existsSync(tailorCompPath)) fs.renameSync(tailorCompPath, nexusCompPath);

// 2. Rename Files inside components/nexus
if (fs.existsSync(nexusCompPath)) {
  const files = fs.readdirSync(nexusCompPath);
  files.forEach(f => {
    if (f.includes('tailor')) {
      const oldPath = path.join(nexusCompPath, f);
      const newPath = path.join(nexusCompPath, f.replace('tailor', 'nexus'));
      fs.renameSync(oldPath, newPath);
    }
  });
}

// 3. Helper to replace text in a file
function replaceInFile(filePath, replacements) {
   if (!fs.existsSync(filePath)) return;
   let text = fs.readFileSync(filePath, 'utf8');
   replacements.forEach(([from, to]) => {
     text = text.split(from).join(to);
   });
   fs.writeFileSync(filePath, text, 'utf8');
}

// 4. Update References
replaceInFile(path.join(nexusAppPath, 'page.tsx'), [
  ['tailor', 'nexus'],
  ['Tailor', 'Nexus'],
  ['PUM Data Nexus', 'PUM Nexus Engine (PNE)']
]);

replaceInFile(path.join(nexusCompPath, 'nexus-canvas.tsx'), [
  ['tailor', 'nexus'],
  ['Tailor', 'Nexus']
]);

replaceInFile(path.join(nexusCompPath, 'nexus-panel.tsx'), [
  ['tailor', 'nexus'],
  ['Tailor', 'Nexus']
]);

// 5. Update Registry & Locales
replaceInFile(path.join(projectRoot, 'core/module-registry.ts'), [
  ['PUM Data Tailor', 'PUM Nexus Engine'],
  ['PUM Tailor (BETA)', 'Nexus Engine (PNE)'],
  ['/tailor', '/nexus']
]);

replaceInFile(path.join(projectRoot, 'messages/en.json'), [
  ['PUM Data Tailor', 'PUM Nexus Engine'],
  ['PUM Tailor (BETA)', 'Nexus Engine (PNE)']
]);

replaceInFile(path.join(projectRoot, 'messages/id.json'), [
  ['PUM Data Tailor', 'PUM Nexus Engine'],
  ['Penjahit PUM', 'Nexus Engine (PNE)']
]);

console.log("Renaming to Nexus Engine Complete!");
