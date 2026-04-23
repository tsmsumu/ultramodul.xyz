const fs = require('fs');

const smsNodeStr = fs.readFileSync('apps/web/src/app/(dashboard)/multi-channel/sms-node-panel.tsx', 'utf8');

// The Auth form needs imapHost, imapPort, imapUser, imapPassword, smtpHost, smtpPort
let emailNodeStr = smsNodeStr
  .replace(/SMS/g, 'Email')
  .replace(/sms/g, 'email')
  .replace(/Sms/g, 'Email')
  .replace(/PORT 3004/g, 'PORT 3005')
  .replace(/3004/g, '3005')
  .replace(/API Key/g, 'Credentials')
  .replace(/Token/g, 'IMAP/SMTP');

// Replace the <Card> that shows API Key logic with an IMAP/SMTP form
const oldFormStart = '{/* STEP 2: Authenticate */}';
const formIdx = emailNodeStr.indexOf(oldFormStart);
if (formIdx !== -1) {
  const formEnd = '{/* STEP 3: Config & Monitoring */}';
  const formEndIdx = emailNodeStr.indexOf(formEnd);
  
  const imapForm = `
        {/* STEP 2: Authenticate (IMAP/SMTP) */}
        {status === 'awaiting_credentials' && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  Connect Email Gateway
                </span>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                  Waiting for Credentials
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">IMAP Host</label>
                  <Input id={"imapHost"+provider.id} placeholder="imap.gmail.com" className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">IMAP Port</label>
                  <Input id={"imapPort"+provider.id} placeholder="993" className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-medium text-white/70">Email Address (User)</label>
                  <Input id={"imapUser"+provider.id} placeholder="you@company.com" className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-xs font-medium text-white/70">App Password</label>
                  <Input id={"imapPassword"+provider.id} type="password" placeholder="••••••••••••" className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">SMTP Host</label>
                  <Input id={"smtpHost"+provider.id} placeholder="smtp.gmail.com" className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">SMTP Port</label>
                  <Input id={"smtpPort"+provider.id} placeholder="465" className="bg-black/20 border-white/10" />
                </div>
              </div>
              <Button onClick={() => handleProvideCredentials(provider.id)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                Connect Gateway
              </Button>
            </CardContent>
          </Card>
        )}
        
  `;
  emailNodeStr = emailNodeStr.substring(0, formIdx) + imapForm + emailNodeStr.substring(formEndIdx);
}

// Replace the connect node function
emailNodeStr = emailNodeStr.replace(
  /const handleProvideCredentials = async \(\) => {[\s\S]*?};/,
  `const handleProvideCredentials = async (id: string) => {
    try {
      setLoading(true);
      const imapHost = (document.getElementById('imapHost'+id) as HTMLInputElement).value;
      const imapPort = (document.getElementById('imapPort'+id) as HTMLInputElement).value;
      const imapUser = (document.getElementById('imapUser'+id) as HTMLInputElement).value;
      const imapPassword = (document.getElementById('imapPassword'+id) as HTMLInputElement).value;
      const smtpHost = (document.getElementById('smtpHost'+id) as HTMLInputElement).value;
      const smtpPort = (document.getElementById('smtpPort'+id) as HTMLInputElement).value;
      
      const res = await fetch(\`http://localhost:3005/auth/credentials/\${provider.id}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imapHost, imapPort, imapUser, imapPassword, smtpHost, smtpPort })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Email Gateway Connected');
        setStatus('connected');
        setHasSession(true);
      } else {
        toast.error('Connection failed');
      }
    } catch (e) {
      toast.error('Network error to Email engine');
    } finally {
      setLoading(false);
    }
  };`
);

fs.writeFileSync('apps/web/src/app/(dashboard)/multi-channel/email-node-panel.tsx', emailNodeStr, 'utf8');

const modals = ['chat', 'group', 'story'];
for (const m of modals) {
  const smsModalStr = fs.readFileSync(`apps/web/src/app/(dashboard)/multi-channel/sms-${m}-monitor-modal.tsx`, 'utf8');
  let emailModalStr = smsModalStr
    .replace(/SMS/g, 'Email')
    .replace(/sms/g, 'email')
    .replace(/Sms/g, 'Email');
  fs.writeFileSync(`apps/web/src/app/(dashboard)/multi-channel/email-${m}-monitor-modal.tsx`, emailModalStr, 'utf8');
}

const smsActionStr = fs.readFileSync('apps/web/src/app/actions/sms-monitor.ts', 'utf8');
const emailActionStr = smsActionStr
  .replace(/SMS/g, 'Email')
  .replace(/sms/g, 'email')
  .replace(/Sms/g, 'Email');
fs.writeFileSync('apps/web/src/app/actions/email-monitor.ts', emailActionStr, 'utf8');

console.log('Created Email UI components and actions');
