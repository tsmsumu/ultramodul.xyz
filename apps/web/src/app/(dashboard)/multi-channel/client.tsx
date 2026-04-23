"use client";

import { useState } from "react";
import { Activity, MessageSquare, PhoneCall, Shield, Terminal as TerminalIcon, Users, Settings, Lock, Radio, Database, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toggleProviderActive, updateProviderConfig, sendMessageViaEngine, getWaEngineStatus, getWaEngineQr } from "@/app/actions/multi-channel";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MultiChannelDashboard({
  initialProviders,
  initialMappings,
  initialSessions,
  initialLogs
}: {
  initialProviders: any[];
  initialMappings: any[];
  initialSessions: any[];
  initialLogs: any[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Command Center");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Live Explorer States
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [waStatus, setWaStatus] = useState<string>("initializing");
  const [simTo, setSimTo] = useState("");
  const [simMsg, setSimMsg] = useState("");
  const [simLoading, setSimLoading] = useState(false);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-zinc-950/80 border border-white/5 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_-15px_rgba(99,102,241,0.2)]">
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

        <div className="md:col-span-2 bg-zinc-950/80 border border-white/5 rounded-3xl p-8 overflow-hidden">
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

  const fetchWaStatus = async () => {
    try {
      const data = await getWaEngineStatus();
      setWaStatus(data.status);
      if (data.status === 'qr') {
        const qrData = await getWaEngineQr();
        if (qrData.success) setQrCode(qrData.qr);
      } else {
        setQrCode(null);
      }
    } catch (err) {
      setWaStatus('offline');
    }
  };

  const handleTestSend = async () => {
    if (!simTo || !simMsg) return;
    setSimLoading(true);
    const res = await sendMessageViaEngine("whatsapp", simTo, simMsg);
    alert(res.message || (res.success ? "Sent!" : "Failed"));
    setSimLoading(false);
    setSimMsg("");
  };

  const renderLiveExplorer = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Omni WA-Engine Panel */}
      <div className="bg-zinc-950/80 border border-white/5 rounded-3xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" /> Omni WA-Engine
          </h2>
          <button onClick={fetchWaStatus} className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300">
            Refresh Status
          </button>
        </div>

        <div className="flex flex-col items-center justify-center p-8 border border-white/5 border-dashed rounded-2xl bg-black/40">
          <div className="text-center mb-6">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              waStatus === 'connected' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 
              waStatus === 'qr' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' : 
              'bg-red-900/30 text-red-400 border-red-500/30'
            }`}>
              STATUS: {waStatus}
            </span>
          </div>

          {waStatus === 'qr' && qrCode ? (
             <div className="bg-white p-4 rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
               <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48" />
             </div>
          ) : waStatus === 'connected' ? (
             <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
               <CheckCircle2 className="w-16 h-16 text-emerald-400" />
             </div>
          ) : (
             <div className="w-32 h-32 rounded-full border-4 border-red-500/30 flex items-center justify-center">
               <XCircle className="w-16 h-16 text-red-400" />
             </div>
          )}
          
          <p className="mt-6 text-xs text-zinc-500 text-center max-w-xs">
            {waStatus === 'qr' ? "Scan this QR Code using the WhatsApp app on your mobile device to link the system." : 
             waStatus === 'connected' ? "WhatsApp Engine is fully connected and ready to transmit payloads." :
             "Omni WA-Engine microservice is unreachable. Ensure PM2 is running on Port 3001."}
          </p>
        </div>
      </div>

      {/* Test Simulator Panel */}
      <div className="bg-zinc-950/80 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col">
        <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2 mb-6">
          <TerminalIcon className="w-5 h-5 text-indigo-400" /> Live Message Simulator
        </h2>
        <div className="flex-1 border border-white/5 bg-black/40 p-6 rounded-2xl space-y-4">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Target Number</label>
            <input 
              type="text" 
              value={simTo}
              onChange={(e) => setSimTo(e.target.value)}
              placeholder="e.g. 0812..., +628..., or 628..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Payload Message</label>
            <textarea 
              value={simMsg}
              onChange={(e) => setSimMsg(e.target.value)}
              placeholder="Hello from Omni Command Center..."
              className="w-full h-32 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>
          <button 
            disabled={simLoading}
            onClick={() => {
              if (waStatus !== 'connected') {
                alert("Mesin belum terhubung! Silakan pastikan Barcode sudah di-scan, lalu klik tombol 'Refresh Status' di atas terlebih dahulu.");
                return;
              }
              handleTestSend();
            }}
            className={`w-full py-3 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
              waStatus !== 'connected' 
                ? 'bg-zinc-700 hover:bg-zinc-600 cursor-not-allowed opacity-80' 
                : 'bg-indigo-600 hover:bg-indigo-500'
            } ${simLoading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {simLoading ? "Firing Payload..." : (waStatus !== 'connected' ? "Engine Not Ready (LOCKED)" : "Fire Payload")}
          </button>
        </div>
      </div>
    </div>
  );

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
