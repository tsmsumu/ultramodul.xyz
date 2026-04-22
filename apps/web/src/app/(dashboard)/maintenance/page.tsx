"use client";

import { useState, useEffect, useRef } from "react";
import { ServerCog, Activity, Shield, Terminal, RefreshCw, Power, Lock } from "lucide-react";
import { getPm2Status, restartPm2Process, getUfwStatus, toggleFirewallStealth, fetchLatestLogs } from "../../actions/panopticon";

export default function AegisPanopticonPage() {
  const [pm2Data, setPm2Data] = useState<Record<string, any>[]>([]);
  const [ufwData, setUfwData] = useState<Record<string, any>>({ active: false, rules: [] });
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [logPolling, setLogPolling] = useState(true);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!logPolling) return;
    const interval = setInterval(async () => {
      const newLogs = await fetchLatestLogs(50);
      setLogs(newLogs);
    }, 2000);
    return () => clearInterval(interval);
  }, [logPolling]);

  useEffect(() => {
    // Auto-scroll to bottom of logs
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const pData = await getPm2Status();
      setPm2Data(pData);
      
      const uData = await getUfwStatus();
      setUfwData(uData);
      
      const lData = await fetchLatestLogs(50);
      setLogs(lData);
    } catch (e) {
      console.error(e);
      alert("Akses Ditolak: Bapak tidak memiliki Izin Dewa (Admin) untuk ruang mesin ini.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRestart(name: string) {
    if(!confirm(`Yakin ingin merestart proses ${name}? Aplikasi akan mengalami downtime 1-2 detik.`)) return;
    await restartPm2Process(name);
    fetchInitialData();
  }

  async function handleToggleStealth() {
    if(!confirm(`Yakin ingin mengaktifkan Stealth Mode? Ini akan menutup semua port selain Web/SSH.`)) return;
    await toggleFirewallStealth(true);
    fetchInitialData();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-emerald-500 font-mono flex items-center gap-4">
          <RefreshCw className="w-6 h-6 animate-spin" /> MENGINISIALISASI PROTOKOL AEGIS PANOPTICON...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-6rem)] flex flex-col gap-6 text-zinc-100 font-mono">
      
      {/* HEADER */}
      <div className="bg-[#050505] border border-red-500/20 p-4 rounded-2xl flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-red-900/30 border border-red-500/50 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
             <ServerCog className="w-6 h-6 text-red-500" />
           </div>
           <div>
             <h2 className="text-xl font-black text-white tracking-widest uppercase">AEGIS PANOPTICON</h2>
             <div className="text-[10px] text-red-400 mt-0.5">WARNING: LEVEL 5 CLEARANCE REQUIRED • DIRECT PHYSICAL SERVER CONTROL</div>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <div className="text-xs text-zinc-500">SERVER IP</div>
             <div className="text-sm font-bold text-white">208.122.28.26</div>
           </div>
           <button onClick={fetchInitialData} title="Refresh Data" className="p-3 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl transition">
             <RefreshCw className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT PANEL: PM2 & UFW */}
        <div className="col-span-4 flex flex-col gap-6 overflow-hidden">
           
           {/* PM2 GUARDIAN */}
           <div className="bg-[#0a0a0a] border border-emerald-500/20 rounded-2xl p-5 flex flex-col flex-1 shrink-0">
              <h3 className="text-sm font-bold text-emerald-500 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" /> PROCESS GUARDIAN (PM2)
              </h3>
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                 {pm2Data.map((p, idx) => (
                    <div key={idx} className="bg-black border border-white/5 p-4 rounded-xl flex justify-between items-center group">
                       <div>
                         <div className="font-bold text-emerald-400 text-lg uppercase">{p.name}</div>
                         <div className="text-[10px] text-zinc-500 mt-1">PID: {p.pid} • UPTIME: {p.uptime}</div>
                         <div className="text-[10px] text-zinc-400 mt-0.5">RAM: {p.memory} • CPU: {p.cpu}</div>
                       </div>
                       <button aria-label="Action button" onClick={() => handleRestart(p.name)} className="p-2 bg-emerald-900/20 text-emerald-500 border border-emerald-500/30 rounded-lg hover:bg-emerald-600 hover:text-white transition" title="Restart Process">
                         <Power className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
              </div>
           </div>

           {/* UFW FIREWALL */}
           <div className="bg-[#0a0a0a] border border-blue-500/20 rounded-2xl p-5 flex flex-col shrink-0">
              <h3 className="text-sm font-bold text-blue-500 mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" /> UFW FIREWALL MATRIX
              </h3>
              
              <div className="flex justify-between items-center bg-black p-4 rounded-xl border border-white/5 mb-4">
                 <div>
                   <div className="text-xs text-zinc-500">STATUS FIREWALL</div>
                   <div className={`text-sm font-bold ${ufwData.active ? 'text-blue-400' : 'text-red-500'}`}>
                     {ufwData.active ? 'ACTIVE & ENFORCED' : 'INACTIVE (VULNERABLE)'}
                   </div>
                 </div>
                 <button aria-label="Action button" onClick={handleToggleStealth} className="px-4 py-2 bg-blue-900/30 border border-blue-500/50 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition flex items-center gap-2">
                   <Lock className="w-3 h-3" /> STEALTH MODE
                 </button>
              </div>

              <div className="text-[10px] text-zinc-500 mb-2 uppercase border-b border-white/5 pb-2">Active Port Rules</div>
              <div className="space-y-1 h-32 overflow-y-auto custom-scrollbar">
                 {ufwData.rules?.length > 0 ? ufwData.rules.map((r: Record<string, any>, idx: number) => (
                   <div key={idx} className="flex justify-between text-xs py-1.5 px-2 hover:bg-white/5 rounded">
                     <span className="text-zinc-300 w-16">{r.to}</span>
                     <span className="text-emerald-400 w-24">{r.action}</span>
                     <span className="text-zinc-500">{r.from}</span>
                   </div>
                 )) : (
                   <div className="text-xs text-zinc-500 py-4 text-center">Tidak ada rules terdeteksi.</div>
                 )}
              </div>
           </div>

        </div>

        {/* RIGHT PANEL: LOG STREAM */}
        <div className="col-span-8 bg-black border border-white/10 rounded-2xl flex flex-col overflow-hidden relative">
           <div className="bg-zinc-900/80 p-3 border-b border-white/10 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3">
               <Terminal className="w-4 h-4 text-zinc-400" />
               <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Live Terminal Tailing (ultramodul-out.log)</span>
             </div>
             <button aria-label="Action button" onClick={() => setLogPolling(!logPolling)} className={`px-3 py-1 text-[10px] font-bold rounded uppercase ${logPolling ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/50' : 'bg-red-900/50 text-red-400 border border-red-500/50'}`}>
               {logPolling ? 'LIVE STREAMING : ON' : 'STREAMING : PAUSED'}
             </button>
           </div>
           
           <div className="flex-1 p-4 overflow-y-auto custom-scrollbar text-[11px] leading-relaxed break-all">
             {logs.map((log, idx) => {
               // Simple syntax highlighting for logs
               let colorClass = "text-zinc-400";
               if (log.includes("error") || log.includes("Error") || log.includes("Failed")) colorClass = "text-red-400 font-bold";
               else if (log.includes("warn") || log.includes("Warning")) colorClass = "text-amber-400";
               else if (log.includes("GET") || log.includes("POST")) colorClass = "text-emerald-300";
               else if (log.includes("✓") || log.includes("Ready")) colorClass = "text-blue-400 font-bold";

               return (
                 <div key={idx} className={`${colorClass} hover:bg-white/5 px-1 rounded`}>
                   {log}
                 </div>
               );
             })}
             <div ref={logEndRef} />
           </div>
        </div>

      </div>
    </div>
  );
}
