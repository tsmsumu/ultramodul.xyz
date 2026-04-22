const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) {
        console.log("Not found: " + filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const {from, to} of replacements) {
        if (typeof from === 'string') {
           content = content.split(from).join(to);
        } else {
           content = content.replace(from, to);
        }
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + filePath);
    }
}

// 1. data-table.tsx
replaceInFile('apps/web/src/components/iam/data-table.tsx', [
  {from: /<input([^>]*)type=\"checkbox\"/g, to: '<input aria-label=\"Select row\"$1type=\"checkbox\"'},
  {from: /dark:bg-white\/\[0\.01\]/g, to: 'dark:bg-white/1'}
]);

// 2. edit-user-modal.tsx
replaceInFile('apps/web/src/components/iam/edit-user-modal.tsx', [
  {from: /<button onClick=\{\(\) => setEditUser\(null\)\}/g, to: '<button aria-label=\"Close modal\" title=\"Close modal\" onClick={() => setEditUser(null)}'},
  {from: /<input([^>]*)name=\"name\"/g, to: '<input aria-label=\"Name\" id=\"name\"$1name=\"name\"'},
  {from: /<input([^>]*)name=\"username\"/g, to: '<input aria-label=\"Username\" id=\"username\"$1name=\"username\"'},
  {from: /<input([^>]*)name=\"email\"/g, to: '<input aria-label=\"Email\" id=\"email\"$1name=\"email\"'},
  {from: /<input([^>]*)name=\"phone\"/g, to: '<input aria-label=\"Phone\" id=\"phone\"$1name=\"phone\"'},
  {from: /<select([^>]*)name=\"role\"/g, to: '<select aria-label=\"Role\" id=\"role\"$1name=\"role\"'}
]);

// 3. import-modal.tsx
replaceInFile('apps/web/src/components/iam/import-modal.tsx', [
  {from: /<button onClick=\{\(\) => setIsImportModalOpen\(false\)\}/g, to: '<button aria-label=\"Close\" title=\"Close\" onClick={() => setIsImportModalOpen(false)}'},
  {from: /<input([^>]*)type=\"file\"/g, to: '<input aria-label=\"File upload\" id=\"fileUpload\"$1type=\"file\"'}
]);

// 4. language-modal.tsx
replaceInFile('apps/web/src/components/iam/language-modal.tsx', [
  {from: /<button onClick=\{\(\) => setIsLangModalOpen\(false\)\}/g, to: '<button aria-label=\"Close\" title=\"Close\" onClick={() => setIsLangModalOpen(false)}'},
  {from: /<select([^>]*)value=\{langTemp\}/g, to: '<select aria-label=\"Language\"$1value={langTemp}'},
  {from: /<select([^>]*)value=\{timeTemp\}/g, to: '<select aria-label=\"Timezone\"$1value={timeTemp}'},
  {from: /<select([^>]*)value=\{dateTemp\}/g, to: '<select aria-label=\"Date Format\"$1value={dateTemp}'}
]);

// 5. matrix-drawer.tsx
replaceInFile('apps/web/src/components/iam/matrix-drawer.tsx', [
  {from: /<button onClick=\{\(\) => setMatrixUser\(null\)\}/g, to: '<button aria-label=\"Close\" title=\"Close\" onClick={() => setMatrixUser(null)}'},
  {from: /<select([^>]*)value=\{matrixState\[group\]/g, to: '<select aria-label=\"Matrix State\"$1value={matrixState[group]'},
  {from: /dark:bg-white\/\[0\.01\]/g, to: 'dark:bg-white/1'},
  {from: /dark:bg-white\/\[0\.02\]/g, to: 'dark:bg-white/2'}
]);

// 6. user-modal.tsx
replaceInFile('apps/web/src/components/iam/user-modal.tsx', [
  {from: /<button onClick=\{\(\) => setIsUserModalOpen\(false\)\}/g, to: '<button aria-label=\"Close\" title=\"Close\" onClick={() => setIsUserModalOpen(false)}'},
  {from: /<select([^>]*)name=\"role\"/g, to: '<select aria-label=\"Role\"$1name=\"role\"'}
]);

// 7. layout header.tsx and theme-customizer.tsx
replaceInFile('apps/web/src/components/layout/header.tsx', [
  {from: /<button([^>]*)onClick=\{toggleSidebar\}/g, to: '<button aria-label=\"Toggle Sidebar\" title=\"Toggle Sidebar\"$1onClick={toggleSidebar}'},
  {from: /<button([^>]*)className=\"p-2 hover:bg-gray-100/g, to: '<button aria-label=\"Search\" title=\"Search\"$1className=\"p-2 hover:bg-gray-100'}
]);
replaceInFile('apps/web/src/components/layout/theme-customizer.tsx', [
  {from: /<button([^>]*)onClick=\{\(\) => setIsOpen\(!isOpen\)\}/g, to: '<button aria-label=\"Toggle Theme\" title=\"Toggle Theme\"$1onClick={() => setIsOpen(!isOpen)}'}
]);

// 8. nexus smart-edge.tsx and hologram-terminal.tsx
replaceInFile('apps/web/src/components/nexus/edges/smart-edge.tsx', [
  {from: /<button([^>]*)onClick=\{\(\) => setEdgeHovered/g, to: '<button aria-label=\"Configure\" title=\"Configure\"$1onClick={() => setEdgeHovered'},
  {from: /<button([^>]*)onClick=\{\(\) => setEdgeConfig/g, to: '<button aria-label=\"Delete\" title=\"Delete\"$1onClick={() => setEdgeConfig'},
  {from: /<select([^>]*)value=\{editData\.protocol\}/g, to: '<select aria-label=\"Protocol\"$1value={editData.protocol}'},
  {from: /<select([^>]*)value=\{editData\.encryption\}/g, to: '<select aria-label=\"Encryption\"$1value={editData.encryption}'},
  {from: /<select([^>]*)value=\{editData\.bandwidth\}/g, to: '<select aria-label=\"Bandwidth\"$1value={editData.bandwidth}'},
  {from: /z-\[60\]/g, to: 'z-60'}
]);

replaceInFile('apps/web/src/components/nexus/hologram-terminal.tsx', [
  {from: /<button([^>]*)onClick=\{onClose\}/g, to: '<button aria-label=\"Close Terminal\" title=\"Close Terminal\"$1onClick={onClose}'},
  {from: /dark:hover:bg-white\/\[0\.03\]/g, to: 'dark:hover:bg-white/3'}
]);

// 9. nexus omni-db-node.tsx
replaceInFile('apps/web/src/components/nexus/nodes/omni-db-node.tsx', [
  {from: /<select([^>]*)value=\{syncMode\}/g, to: '<select aria-label=\"Sync Mode\"$1value={syncMode}'},
  {from: /<input([^>]*)type=\"file\"/g, to: '<input aria-label=\"Upload File\"$1type=\"file\"'},
  {from: /<input([^>]*)placeholder=\"SQL Query\"/g, to: '<input aria-label=\"SQL Query\"$1placeholder=\"SQL Query\"'},
  {from: /bg-gradient-to-r/g, to: 'bg-linear-to-r'},
  {from: /className=\"text-xs font-mono w-full bg-zinc-950\/50 border border-zinc-800 rounded p-2 text-white block flex gap-2\"/g, to: 'className=\"text-xs font-mono w-full bg-zinc-950/50 border border-zinc-800 rounded p-2 text-white flex gap-2\"'}
]);

// 10. others
replaceInFile('apps/web/src/app/(dashboard)/access/page.tsx', [
  {from: /dark:bg-white\/\[0\.02\]/g, to: 'dark:bg-white/2'},
  {from: /dark:hover:bg-white\/\[0\.01\]/g, to: 'dark:hover:bg-white/1'}
]);
replaceInFile('apps/web/src/app/(dashboard)/dashboard/page.tsx', [
  {from: /bg-gradient-to-t/g, to: 'bg-linear-to-t'}
]);
replaceInFile('apps/web/src/app/(dashboard)/iam/page.tsx', [
  {from: /dark:bg-white\/\[0\.02\]/g, to: 'dark:bg-white/2'}
]);
replaceInFile('apps/web/src/app/(public)/auth/page.tsx', [
  {from: /bg-\[size:24px_24px\]/g, to: 'bg-size-[24px_24px]'},
  {from: /mt-2 mt-3/g, to: 'mt-3'},
  {from: /mt-3 mt-2/g, to: 'mt-3'}
]);
replaceInFile('apps/web/src/components/nexus/nexus-canvas.tsx', [
  {from: /!bg-white\/80/g, to: 'bg-white/80!'},
  {from: /dark:!bg-\[#111113\]\/80/g, to: 'dark:bg-[#111113]/80!'},
  {from: /!border-gray-200/g, to: 'border-gray-200!'},
  {from: /dark:!border-white\/10/g, to: 'dark:border-white/10!'},
  {from: /!fill-gray-600/g, to: 'fill-gray-600!'},
  {from: /dark:!fill-gray-300/g, to: 'dark:fill-gray-300!'}
]);
replaceInFile('apps/web/src/components/nexus/nodes/database-node.tsx', [
  {from: /bg-gradient-to-r/g, to: 'bg-linear-to-r'}
]);
replaceInFile('apps/web/src/components/nexus/nodes/publish-node.tsx', [
  {from: /bg-gradient-to-r/g, to: 'bg-linear-to-r'},
  {from: /bg-gradient-to-br/g, to: 'bg-linear-to-br'}
]);

console.log('Script done!');
