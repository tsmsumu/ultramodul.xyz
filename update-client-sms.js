const fs = require('fs');

// 1. Update multi-channel.ts
let mcStr = fs.readFileSync('apps/web/src/app/actions/multi-channel.ts', 'utf8');

const sigIdx = mcStr.indexOf('export async function createSignalNode');
if (sigIdx !== -1) {
  let sigBlock = mcStr.substring(sigIdx);
  // Cut it at the end of the file
  
  let smsBlock = sigBlock
    .replace(/Signal/g, 'SMS')
    .replace(/signal/g, 'sms')
    .replace(/sig/g, 'sms')
    .replace(/Sig/g, 'Sms');
    
  if (!mcStr.includes('createSmsNode')) {
    mcStr += '\n\n// --- SMS NODE ACTIONS ---\n' + smsBlock;
    fs.writeFileSync('apps/web/src/app/actions/multi-channel.ts', mcStr, 'utf8');
  }
}

// 2. Update client.tsx
let clientStr = fs.readFileSync('apps/web/src/app/(dashboard)/multi-channel/client.tsx', 'utf8');
if (!clientStr.includes('SmsNodePanel')) {
  clientStr = clientStr.replace(
    "import { SigNodePanel } from './sig-node-panel';",
    "import { SigNodePanel } from './sig-node-panel';\nimport { SmsNodePanel } from './sms-node-panel';"
  );
  
  clientStr = clientStr.replace(
    "// --- Signal Cluster ---",
    "// --- Signal Cluster ---\n  const smsProviders = providers.filter(p => p.providerType === 'sms');"
  );
  
  const smsPanelCode = `
        {/* --- SMS CLUSTER MANAGER --- */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              SMS Cluster Manager
            </h2>
            <Button onClick={() => handleCreateNode('sms')} size="sm" variant="outline" className="bg-white/5 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10">
              <Plus className="w-4 h-4 mr-2" />
              Deploy New Node
            </Button>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {smsProviders.map(provider => (
              <SmsNodePanel key={provider.id} provider={provider} onDelete={() => {
                setProviderToDelete(provider.id);
                setDeleteDialogOpen(true);
              }} />
            ))}
            {smsProviders.length === 0 && (
              <div className="col-span-full py-12 border border-dashed border-indigo-500/20 rounded-xl flex flex-col items-center justify-center text-indigo-400/60 bg-indigo-500/5">
                <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                <p>No SMS Nodes Deployed</p>
                <p className="text-sm">Click 'Deploy New Node' to spawn an SMS Gateway Instance</p>
              </div>
            )}
          </div>
        </div>
`;

  clientStr = clientStr.replace(
    "export function MultiChannelClient({ initialProviders }: MultiChannelClientProps) {",
    "import { MessageSquare } from 'lucide-react';\n\nexport function MultiChannelClient({ initialProviders }: MultiChannelClientProps) {"
  );
  
  clientStr = clientStr.replace(
    "        {/* --- TELEGRAM CLUSTER MANAGER --- */}",
    smsPanelCode + "\n        {/* --- TELEGRAM CLUSTER MANAGER --- */}"
  );

  fs.writeFileSync('apps/web/src/app/(dashboard)/multi-channel/client.tsx', clientStr, 'utf8');
}

console.log('Updated client.tsx and multi-channel.ts');
