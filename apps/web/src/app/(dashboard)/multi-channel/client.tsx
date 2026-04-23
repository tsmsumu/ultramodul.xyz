"use client";

import { useState } from "react";
import { Activity, MessageSquare, PhoneCall, Shield, Terminal as TerminalIcon, Users, Settings, Lock, Radio, Database, CheckCircle2, XCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toggleProviderActive, updateProviderConfig, createWhatsAppNode, createTelegramNode } from "@/app/actions/multi-channel";
import { useRouter } from "next/navigation";
import Image from "next/image";
import WaNodePanel from "./wa-node-panel";
import TgNodePanel from "./tg-node-panel";

export default function MultiChannelDashboard({
  initialProviders,
  archivedProviders,
  initialMappings,
  initialSessions,
  initialLogs,
  systemStorage
}: {
  initialProviders: any[];
  archivedProviders: any[];
  initialMappings: any[];
  initialSessions: any[];
  initialLogs: any[];
  systemStorage: any;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Command Center");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // State cleanups (Moved to WaNodePanel)

  const TABS = ["Command Center", "Platform Config", "Phone Mapping", "Ultra-PIN", "Live Sessions", "Forensik Log", "Live Explorer"];

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setLoadingId(id);
    await toggleProviderActive(id, currentStatus);
    setLoadingId(null);
    router.refresh();
  };

  const renderCommandCenter = () => {
    const activeCount = initialProviders.filter(p => p.isActive).length;
    const totalCount = initialProviders.length;
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-zinc-950/80 border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_-15px_rgba(99,102,241,0.2)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none" />
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Radio className="w-4 h-4" /> Status Gateway
          </h2>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-40 h-40 rounded-full border-4 border-white/5 flex items-center justify-center relative">
              {activeCount > 0 && <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />}
              <div className="text-center">
                <span className="text-5xl font-black text-white">{activeCount}</span>
                <span className="text-xl text-zinc-500">/{totalCount}</span>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">Active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-zinc-950/80 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Database className="w-4 h-4" /> Server Storage
          </h2>
          <div className="flex flex-col items-center justify-center py-6">
            <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center relative ${systemStorage?.usePercent > 90 ? 'border-red-500/30' : 'border-white/5'}`}>
              <div className="text-center">
                <span className={`text-5xl font-black ${systemStorage?.usePercent > 90 ? 'text-red-500' : 'text-white'}`}>
                  {systemStorage?.usePercent || 0}%
                </span>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">Used Space</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-zinc-500 font-mono mt-4">
            <span>{systemStorage?.used} Used</span>
            <span>{systemStorage?.total} Total</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-zinc-950/80 border border-white/5 rounded-3xl p-8 overflow-hidden">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4" /> Node Telemetry
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {initialProviders.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                  <span className="font-medium text-sm text-gray-200">{p.name}</span>
                </div>
                <button 
                  disabled={loadingId === p.id}
                  onClick={() => handleToggleActive(p.id, p.isActive)}
                  className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest transition-all
                    ${p.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'}`}
                >
                  {p.isActive ? 'ONLINE' : 'OFFLINE'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPlatformConfig = () => (
    <div className="bg-zinc-950/80 border border-white/5 rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-white/5 bg-black/40 flex items-center gap-3">
        <Settings className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="font-bold text-white tracking-widest uppercase">Secret Vault</h3>
          <p className="text-xs text-zinc-500">API Keys, Webhooks, & Provider Tokens</p>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialProviders.map(p => (
          <div key={p.id} className="border border-white/5 bg-black/50 p-5 rounded-2xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <span className="font-bold text-indigo-300 uppercase tracking-widest text-xs flex items-center gap-2">
                <Lock className="w-3 h-3" /> {p.providerType}
              </span>
              <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-widest border ${p.isActive ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'}`}>
                {p.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Configuration Payload</label>
                <div className="relative">
                  <textarea 
                    readOnly 
                    value={p.configPayload} 
                    className="w-full h-24 bg-zinc-900/50 border border-white/10 rounded-xl p-3 text-xs font-mono text-zinc-300 focus:outline-none resize-none"
                  />
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 rounded-xl">
                    <span className="text-xs font-bold text-white/50 tracking-widest flex items-center gap-2">
                      <Lock className="w-4 h-4" /> HOVER TO REVEAL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPhoneMapping = () => (
    <div className="bg-zinc-950/80 border border-white/5 rounded-3xl overflow-hidden">
       <div className="p-6 border-b border-white/5 bg-black/40 flex items-center gap-3">
        <Users className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="font-bold text-white tracking-widest uppercase">Identity Link</h3>
          <p className="text-xs text-zinc-500">Mapping universal accounts to messaging endpoints</p>
        </div>
      </div>
      <div className="p-6">
        {initialMappings.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm font-mono flex flex-col items-center">
            <Database className="w-8 h-8 mb-3 opacity-20" />
            No mappings established.
          </div>
        ) : (
          <table className="w-full text-left text-sm font-mono">
            <thead className="text-xs text-zinc-500 uppercase border-b border-white/5">
              <tr>
                <th className="py-3 font-normal">User Name</th>
                <th className="py-3 font-normal">Provider</th>
                <th className="py-3 font-normal">Channel ID</th>
                <th className="py-3 font-normal">Ultra PIN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300 text-xs">
              {initialMappings.map(m => (
                <tr key={m.id} className="hover:bg-white/5">
                  <td className="py-3">{m.userName}</td>
                  <td className="py-3 text-indigo-400">{m.providerType}</td>
                  <td className="py-3">{m.channelIdentifier}</td>
                  <td className="py-3">•••{m.ultraPin.slice(-2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderForensikLog = () => (
    <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
      <div className="px-6 py-3 border-b border-white/10 bg-black flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase">Forensic_Trace_Log</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-2">
        {initialLogs.length === 0 ? (
          <div className="text-zinc-600">Awaiting incoming telemetry...</div>
        ) : (
          initialLogs.map(log => (
            <div key={log.id} className="flex gap-4">
              <span className="text-zinc-500 whitespace-nowrap">
                {new Date(log.timestamp).toISOString()}
              </span>
              <span className="text-indigo-400 w-24">[{log.providerType}]</span>
              <span className={log.action.includes('ERROR') ? 'text-red-400' : 'text-emerald-400'}>
                {log.action}
              </span>
              <span className="text-zinc-400 break-all">{log.metadata}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const handleAddWaNode = async () => {
    const res = await createWhatsAppNode();
    if (res.success) {
      router.refresh();
    } else {
      alert("Failed to create WA Node");
    }
  };

  const handleAddTgNode = async () => {
    const res = await createTelegramNode();
    if (res.success) {
      router.refresh();
    } else {
      alert("Failed to create TG Node");
    }
  };

  const renderLiveExplorer = () => {
    const waProviders = initialProviders.filter(p => p.providerType === 'whatsapp');
    const waArchived = archivedProviders?.filter(p => p.providerType === 'whatsapp') || [];
    const tgProviders = initialProviders.filter(p => p.providerType === 'telegram');
    const tgArchived = archivedProviders?.filter(p => p.providerType === 'telegram') || [];

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-zinc-950/80 p-6 rounded-3xl border border-white/5">
          <div>
            <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" /> WhatsApp Cluster Manager
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Manage multiple WhatsApp sending nodes concurrently.</p>
          </div>
          <button onClick={handleAddWaNode} className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
            + Deploy New Node
          </button>
        </div>

        {waProviders.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 border border-white/5 border-dashed rounded-3xl">
            No WhatsApp Nodes active. Click deploy to start.
          </div>
        ) : (
          waProviders.map(p => <WaNodePanel key={p.id} provider={p} />)
        )}

        {waArchived.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10">
            <h3 className="text-sm font-bold text-zinc-500 tracking-widest uppercase flex items-center gap-2 mb-6">
              <Database className="w-4 h-4" /> Archived Nodes (Read Only Logbooks)
            </h3>
            {waArchived.map(p => (
              <div key={p.id} className="opacity-80">
                 <WaNodePanel provider={p} isArchived={true} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex justify-between items-center bg-zinc-950/80 p-6 rounded-3xl border border-white/5 mb-6">
            <div>
              <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-400" /> Telegram Cluster Manager
              </h2>
              <p className="text-xs text-zinc-500 mt-1">Manage multiple Telegram MTProto nodes concurrently.</p>
            </div>
            <button onClick={handleAddTgNode} className="text-xs px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-xl text-white font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(2,132,199,0.3)]">
              + Deploy New Node
            </button>
          </div>

          {tgProviders.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 border border-white/5 border-dashed rounded-3xl">
              No Telegram Nodes active. Click deploy to start.
            </div>
          ) : (
            tgProviders.map(p => <TgNodePanel key={p.id} provider={p} />)
          )}

          {tgArchived.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-sm font-bold text-zinc-500 tracking-widest uppercase flex items-center gap-2 mb-6">
                <Send className="w-4 h-4" /> Archived Telegram Nodes
              </h3>
              {tgArchived.map(p => (
                <div key={p.id} className="opacity-80">
                   <TgNodePanel provider={p} isArchived={true} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLiveSessions = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialSessions.length === 0 ? (
         <div className="col-span-full py-20 text-center font-mono text-zinc-500 border border-white/5 border-dashed rounded-3xl">
           No active sessions at this exact millisecond.
         </div>
      ) : (
        initialSessions.map(s => (
          <div key={s.id} className="border border-indigo-500/30 bg-indigo-950/20 p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> LIVE
            </div>
            <h4 className="font-bold text-white mb-1">{s.userName}</h4>
            <p className="text-xs text-indigo-300 font-mono mb-4">{s.channelIdentifier} via {s.providerName}</p>
            <div className="space-y-1 text-[10px] text-zinc-500 font-mono">
              <div className="flex justify-between"><span>IP:</span> <span className="text-zinc-300">{s.ipAddress || 'Unknown'}</span></div>
              <div className="flex justify-between"><span>TOKEN:</span> <span className="text-zinc-300">{s.sessionToken.slice(0,8)}...</span></div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* TABS MENU */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-white/5">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
              ${activeTab === tab 
                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "Command Center" && renderCommandCenter()}
          {activeTab === "Platform Config" && renderPlatformConfig()}
          {activeTab === "Phone Mapping" && renderPhoneMapping()}
          {activeTab === "Ultra-PIN" && renderPhoneMapping()}
          {activeTab === "Live Sessions" && renderLiveSessions()}
          {activeTab === "Forensik Log" && renderForensikLog()}
          {activeTab === "Live Explorer" && renderLiveExplorer()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
