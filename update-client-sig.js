const fs = require('fs');

let c = fs.readFileSync('apps/web/src/app/(dashboard)/multi-channel/client.tsx', 'utf8');

c = c.replace(/import TgNodePanel from "\.\/tg-node-panel";/g, 'import TgNodePanel from "./tg-node-panel";\nimport SigNodePanel from "./sig-node-panel";');
c = c.replace(/import { (.*) createTelegramNode } from/g, 'import { $1 createTelegramNode, createSignalNode } from');

c = c.replace(/const tgProviders = providers\.filter\(p => p\.platform === 'telegram' && !p\.isArchived\);/g, "const tgProviders = providers.filter(p => p.platform === 'telegram' && !p.isArchived);\n  const sigProviders = providers.filter(p => p.platform === 'signal' && !p.isArchived);");
c = c.replace(/const tgArchived = providers\.filter\(p => p\.platform === 'telegram' && p\.isArchived\);/g, "const tgArchived = providers.filter(p => p.platform === 'telegram' && p.isArchived);\n  const sigArchived = providers.filter(p => p.platform === 'signal' && p.isArchived);");

c = c.replace(/const handleAddTgNode = async \(\) => {([\s\S]*?)};/g, (match) => {
  return match + '\n\n  const handleAddSigNode = async () => {\n    await createSignalNode();\n    fetchData();\n  };';
});

const sigUiBlock = `
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex justify-between items-center bg-zinc-950/80 p-6 rounded-3xl border border-white/5 mb-6">
            <div>
              <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" /> Signal Cluster Manager
              </h2>
              <p className="text-xs text-zinc-500 mt-1">Manage multiple Signal-CLI nodes concurrently.</p>
            </div>
            <button onClick={handleAddSigNode} className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              + Deploy New Node
            </button>
          </div>

          {sigProviders.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 border border-white/5 border-dashed rounded-3xl">
              No Signal Nodes active. Click deploy to start.
            </div>
          ) : (
            sigProviders.map(p => <SigNodePanel key={p.id} provider={p} />)
          )}

          {sigArchived.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-sm font-bold text-zinc-500 tracking-widest uppercase flex items-center gap-2 mb-6">
                <MessageSquare className="w-4 h-4" /> Archived Signal Nodes
              </h3>
              {sigArchived.map(p => (
                <div key={p.id} className="opacity-80">
                   <SigNodePanel provider={p} isArchived={true} />
                </div>
              ))}
            </div>
          )}
        </div>
`;

const splitPoint = c.lastIndexOf('</div>\n    </div>');
if (splitPoint !== -1) {
  c = c.slice(0, splitPoint) + sigUiBlock + c.slice(splitPoint);
} else {
  c = c.slice(0, c.lastIndexOf('</div>')) + sigUiBlock + c.slice(c.lastIndexOf('</div>'));
}

fs.writeFileSync('apps/web/src/app/(dashboard)/multi-channel/client.tsx', c, 'utf8');
