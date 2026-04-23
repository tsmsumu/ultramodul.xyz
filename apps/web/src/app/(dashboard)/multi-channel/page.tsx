import { getProviders, getArchivedProviders, getPhoneMappings, getLiveSessions, getForensicLogs } from "@/app/actions/multi-channel";
import MultiChannelDashboard from "./client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Multi-Channel Gateway | PUM Enterprise",
};

export default async function MultiChannelPage() {
  const providers = await getProviders();
  const mappings = await getPhoneMappings();
  const sessions = await getLiveSessions();
  const logs = await getForensicLogs();
  const archivedProviders = await getArchivedProviders();

  return (
    <div className="p-4 sm:p-8 max-w-[1800px] mx-auto min-h-[calc(100vh-6rem)]">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-widest uppercase bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent mb-1">
          Multi-Channel Gateway
        </h1>
        <p className="text-sm font-mono text-zinc-500">
          Enterprise Command Center / Omni-Messaging Network / Level 5 Clearance
        </p>
      </div>

      <MultiChannelDashboard 
        initialProviders={providers} 
        initialMappings={mappings} 
        initialSessions={sessions} 
        initialSessions={sessions} 
        initialLogs={logs} 
        archivedProviders={archivedProviders}
      />
    </div>
  );
}
