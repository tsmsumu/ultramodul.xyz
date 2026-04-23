const fs = require('fs');
let clientContent = fs.readFileSync('apps/web/src/app/(dashboard)/multi-channel/client.tsx', 'utf8');

// Add imports
if (!clientContent.includes('import SmsNodePanel')) {
  clientContent = clientContent.replace(
    'import SigNodePanel from "./sig-node-panel";',
    'import SigNodePanel from "./sig-node-panel";\nimport SmsNodePanel from "./sms-node-panel";\nimport EmailNodePanel from "./email-node-panel";\nimport { createSMSNode, createEmailNode } from "@/app/actions/multi-channel";'
  );
}

// Ensure the create functions are destructured inside the component
if (!clientContent.includes('const handleAddSmsNode')) {
  clientContent = clientContent.replace(
    'const handleAddSigNode = async () => {',
    `
  const handleAddSmsNode = async () => {
    await createSMSNode();
    router.refresh();
  };

  const handleAddEmailNode = async () => {
    await createEmailNode();
    router.refresh();
  };

  const handleAddSigNode = async () => {`
  );
}

// We need to pass smsProviders and emailProviders
if (!clientContent.includes('smsProviders')) {
  clientContent = clientContent.replace(
    'const sigArchived = archivedProviders.filter(p => p.providerType === "sig");',
    `const sigArchived = archivedProviders.filter(p => p.providerType === "sig");
    const smsProviders = initialProviders.filter(p => p.providerType === "sms");
    const smsArchived = archivedProviders.filter(p => p.providerType === "sms");
    const emailProviders = initialProviders.filter(p => p.providerType === "email");
    const emailArchived = archivedProviders.filter(p => p.providerType === "email");`
  );
}

// Add the UI panels at the end of the Signal section
const sigEndIdx = clientContent.indexOf('          )}', clientContent.indexOf('sigArchived.map(p => ('));
const endOfSigDivIdx = clientContent.indexOf('</div>', sigEndIdx) + 6;

const panels = `
        {/* --- SMS CLUSTER MANAGER --- */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex justify-between items-center bg-zinc-950/80 p-6 rounded-3xl border border-white/5 mb-6">
            <div>
              <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-400" /> SMS Cluster Manager
              </h2>
              <p className="text-xs text-zinc-500 mt-1">Manage multiple SMS GSM nodes concurrently.</p>
            </div>
            <button onClick={handleAddSmsNode} className="text-xs px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              + Deploy New Node
            </button>
          </div>

          {smsProviders.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 border border-white/5 border-dashed rounded-3xl">
              No SMS Nodes active. Click deploy to start.
            </div>
          ) : (
            smsProviders.map(p => <SmsNodePanel key={p.id} provider={p} />)
          )}

          {smsArchived.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-sm font-bold text-zinc-500 tracking-widest uppercase flex items-center gap-2 mb-6">
                <MessageSquare className="w-4 h-4" /> Archived SMS Nodes
              </h3>
              {smsArchived.map(p => (
                <div key={p.id} className="opacity-80">
                   <SmsNodePanel provider={p} isArchived={true} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- EMAIL CLUSTER MANAGER --- */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex justify-between items-center bg-zinc-950/80 p-6 rounded-3xl border border-white/5 mb-6">
            <div>
              <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Email Cluster Manager
              </h2>
              <p className="text-xs text-zinc-500 mt-1">Manage multiple Email (IMAP/SMTP) gateways concurrently.</p>
            </div>
            <button onClick={handleAddEmailNode} className="text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              + Deploy New Node
            </button>
          </div>

          {emailProviders.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 border border-white/5 border-dashed rounded-3xl">
              No Email Nodes active. Click deploy to start.
            </div>
          ) : (
            emailProviders.map(p => <EmailNodePanel key={p.id} provider={p} />)
          )}

          {emailArchived.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-sm font-bold text-zinc-500 tracking-widest uppercase flex items-center gap-2 mb-6">
                <Activity className="w-4 h-4" /> Archived Email Nodes
              </h3>
              {emailArchived.map(p => (
                <div key={p.id} className="opacity-80">
                   <EmailNodePanel provider={p} isArchived={true} />
                </div>
              ))}
            </div>
          )}
        </div>
`;

if (!clientContent.includes('SMS Cluster Manager')) {
  clientContent = clientContent.substring(0, endOfSigDivIdx) + panels + clientContent.substring(endOfSigDivIdx);
}

fs.writeFileSync('apps/web/src/app/(dashboard)/multi-channel/client.tsx', clientContent);
console.log("Successfully fixed client.tsx!");
