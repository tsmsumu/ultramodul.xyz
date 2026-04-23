const fs = require('fs');

// 1. Update multi-channel.ts
let mcStr = fs.readFileSync('apps/web/src/app/actions/multi-channel.ts', 'utf8');

const smsIdx = mcStr.indexOf('export async function createSmsNode');
if (smsIdx !== -1) {
  let smsBlock = mcStr.substring(smsIdx);
  
  let emailBlock = smsBlock
    .replace(/SMS/g, 'Email')
    .replace(/sms/g, 'email')
    .replace(/Sms/g, 'Email');
    
  if (!mcStr.includes('createEmailNode')) {
    mcStr += '\n\n// --- EMAIL NODE ACTIONS ---\n' + emailBlock;
    fs.writeFileSync('apps/web/src/app/actions/multi-channel.ts', mcStr, 'utf8');
  }
}

// 2. Update client.tsx
let clientStr = fs.readFileSync('apps/web/src/app/(dashboard)/multi-channel/client.tsx', 'utf8');
if (!clientStr.includes('EmailNodePanel')) {
  clientStr = clientStr.replace(
    "import { SmsNodePanel } from './sms-node-panel';",
    "import { SmsNodePanel } from './sms-node-panel';\nimport { EmailNodePanel } from './email-node-panel';"
  );
  
  clientStr = clientStr.replace(
    "// --- Signal Cluster ---",
    "// --- Signal Cluster ---\n  const emailProviders = providers.filter(p => p.providerType === 'email');"
  );
  
  const emailPanelCode = `
        {/* --- EMAIL CLUSTER MANAGER --- */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-500" />
              Email Cluster Manager
            </h2>
            <Button onClick={() => handleCreateNode('email')} size="sm" variant="outline" className="bg-white/5 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10">
              <Plus className="w-4 h-4 mr-2" />
              Deploy New Node
            </Button>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {emailProviders.map(provider => (
              <EmailNodePanel key={provider.id} provider={provider} onDelete={() => {
                setProviderToDelete(provider.id);
                setDeleteDialogOpen(true);
              }} />
            ))}
            {emailProviders.length === 0 && (
              <div className="col-span-full py-12 border border-dashed border-indigo-500/20 rounded-xl flex flex-col items-center justify-center text-indigo-400/60 bg-indigo-500/5">
                <Mail className="w-12 h-12 mb-4 opacity-50" />
                <p>No Email Nodes Deployed</p>
                <p className="text-sm">Click 'Deploy New Node' to spawn an IMAP/SMTP Gateway Instance</p>
              </div>
            )}
          </div>
        </div>
`;

  clientStr = clientStr.replace(
    "import { MessageSquare } from 'lucide-react';",
    "import { MessageSquare, Mail } from 'lucide-react';"
  );
  
  clientStr = clientStr.replace(
    "        {/* --- TELEGRAM CLUSTER MANAGER --- */}",
    emailPanelCode + "\n        {/* --- TELEGRAM CLUSTER MANAGER --- */}"
  );

  fs.writeFileSync('apps/web/src/app/(dashboard)/multi-channel/client.tsx', clientStr, 'utf8');
}

// 3. Update types for components
const updateTypes = (path) => {
  let c = fs.readFileSync(path, 'utf8');
  c = c.replace(/"smsStory"/g, '"smsStory" | "emailChat" | "emailGroup" | "emailStory"');
  fs.writeFileSync(path, c, 'utf8');
};

updateTypes('apps/web/src/components/LogAnalytics.tsx');
updateTypes('apps/web/src/components/ImportMenu.tsx');

// Add email Webhook Route
const smsWebhook = fs.readFileSync('apps/web/src/app/api/webhooks/sms/route.ts', 'utf8');
let emailWebhook = smsWebhook
  .replace(/SMS/g, 'Email')
  .replace(/sms/g, 'email')
  .replace(/Sms/g, 'Email');
  
fs.mkdirSync('apps/web/src/app/api/webhooks/email', { recursive: true });
fs.writeFileSync('apps/web/src/app/api/webhooks/email/route.ts', emailWebhook, 'utf8');

console.log('Updated client, multi-channel, types, and webhooks');
