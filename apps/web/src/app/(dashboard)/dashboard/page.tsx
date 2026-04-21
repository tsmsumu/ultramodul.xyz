"use client";

import { useTranslations } from "next-intl";
import { Activity, ShieldCheck, Database, Zap, Users, AlertTriangle, Fingerprint, Lock, ShieldAlert, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getGodsEyeTelemetry } from "../../actions/dashboard";

type TelemetryData = {
  totalUsers: number;
  activeUsers: number;
  totalComplaints: number;
  recentComplaints: any[];
  recentLogs: any[];
};

export default function DashboardPage() {
  const t = useTranslations("home");
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchTelemetry = async () => {
      const res = await getGodsEyeTelemetry();
      if (res.success && res.data && mounted) {
        setTelemetry(res.data);
      }
      if (mounted) setLoading(false);
    };
    
    fetchTelemetry();
    // Simulate real-time polling every 30 seconds
    const interval = setInterval(fetchTelemetry, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-1000 pb-10">
      
      {/* 1. ZONA ATAS: Live Neural Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Widget: Network Ping */}
        <div className="bg-zinc-950/40 dark:bg-[#0a0a0c] border border-emerald-900/30 p-5 rounded-3xl relative overflow-hidden group hover:border-emerald-500/50 transition duration-500">
           <div className="absolute -right-6 -top-6 bg-emerald-500/10 w-24 h-24 rounded-full blur-[30px] group-hover:bg-emerald-500/20 transition duration-700" />
           <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-800"><Activity className="w-5 h-5 text-emerald-400" /></div>
             <span className="flex items-center gap-2 text-xs font-mono text-emerald-500"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> LIVE C2</span>
           </div>
           <div className="relative z-10">
             <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">VPS Server Ping</h4>
             <div className="flex flex-col">
               <span className="text-3xl font-black text-white">12<span className="text-sm text-gray-500">ms</span></span>
               <span className="text-xs text-emerald-600 mt-1">Connection Optimal</span>
             </div>
           </div>
        </div>

        {/* Widget: User Identity Status */}
        <div className="bg-zinc-950/40 dark:bg-[#0a0a0c] border border-blue-900/30 p-5 rounded-3xl relative overflow-hidden group hover:border-blue-500/50 transition duration-500">
           <div className="absolute -right-6 -top-6 bg-blue-500/10 w-24 h-24 rounded-full blur-[30px] group-hover:bg-blue-500/20 transition duration-700" />
           <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="p-3 bg-blue-950/50 rounded-xl border border-blue-800"><Users className="w-5 h-5 text-blue-400" /></div>
             <span className="flex items-center gap-2 text-xs font-mono text-blue-500">MATRIX</span>
           </div>
           <div className="relative z-10">
             <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Active Identities</h4>
             <div className="flex flex-col">
               {loading ? <div className="h-9 w-12 bg-white/10 rounded animate-pulse" /> : 
                 <span className="text-3xl font-black text-white">{telemetry?.activeUsers} <span className="text-sm text-gray-500 font-normal">/ {telemetry?.totalUsers} TTL</span></span>
               }
             </div>
           </div>
        </div>

        {/* Widget: Complaint Center */}
        <div className="bg-zinc-950/40 dark:bg-[#0a0a0c] border border-amber-900/30 p-5 rounded-3xl relative overflow-hidden group hover:border-amber-500/50 transition duration-500">
           <div className="absolute -right-6 -top-6 bg-amber-500/10 w-24 h-24 rounded-full blur-[30px] group-hover:bg-amber-500/20 transition duration-700" />
           <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="p-3 bg-amber-950/50 rounded-xl border border-amber-800"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
             <span className="flex items-center gap-2 text-xs font-mono text-amber-500">RED FLAGS</span>
           </div>
           <div className="relative z-10">
             <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Open Complaints</h4>
             <div className="flex flex-col">
               {loading ? <div className="h-9 w-12 bg-white/10 rounded animate-pulse" /> : 
                 <span className="text-3xl font-black text-white">{telemetry?.totalComplaints} <span className="text-sm text-gray-500 font-normal">Total</span></span>
               }
             </div>
           </div>
        </div>

        {/* Widget: Database Integrity */}
        <div className="bg-zinc-950/40 dark:bg-[#0a0a0c] border border-purple-900/30 p-5 rounded-3xl relative overflow-hidden group hover:border-purple-500/50 transition duration-500">
           <div className="absolute -right-6 -top-6 bg-purple-500/10 w-24 h-24 rounded-full blur-[30px] group-hover:bg-purple-500/20 transition duration-700" />
           <div className="flex justify-between items-start mb-4 relative z-10">
             <div className="p-3 bg-purple-950/50 rounded-xl border border-purple-800"><Database className="w-5 h-5 text-purple-400" /></div>
             <span className="flex items-center gap-2 text-xs font-mono text-purple-500">AEGIS DB</span>
           </div>
           <div className="relative z-10">
             <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Data Gravity Status</h4>
             <div className="flex flex-col">
               <span className="text-xl font-black text-white mt-1">PROTECTED</span>
               <span className="text-[10px] text-purple-400 mt-1">Zero-Trust Implemented</span>
             </div>
           </div>
        </div>
      </div>

      {/* 2. ZONA BAWAH: Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* KOLOM KIRI: Terminal Eksekusi (The Action Terminal) */}
         <div className="lg:col-span-1 border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-[#09090b]/80 backdrop-blur-3xl rounded-3xl p-6 flex flex-col shadow-[0_0_30px_-15px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="w-6 h-6 text-emerald-500" />
              <h2 className="text-lg font-black uppercase tracking-widest">Inbox Intelijen</h2>
            </div>
            
            <div className="space-y-4 flex-1">
               <div className="flex justify-between items-center bg-gray-50 dark:bg-black p-3 rounded-xl border border-gray-100 dark:border-white/5">
                 <span className="text-xs font-bold text-gray-500 uppercase">Emergency Override Request</span>
                 <span className="text-[10px] px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md">Empty</span>
               </div>

               <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6 mb-2">Recent Public Complaints</h3>
               <div className="space-y-3">
                 {loading ? (
                    <div className="animate-pulse space-y-3">
                       <div className="h-16 bg-zinc-200 dark:bg-white/5 rounded-xl w-full"></div>
                       <div className="h-16 bg-zinc-200 dark:bg-white/5 rounded-xl w-full"></div>
                    </div>
                 ) : telemetry?.recentComplaints?.length === 0 ? (
                    <div className="p-6 border border-dashed border-gray-300 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center">
                       <ShieldCheck className="w-8 h-8 text-emerald-500/50 mb-2" />
                       <span className="text-sm font-bold text-emerald-700 dark:text-emerald-500">All Clear</span>
                       <span className="text-xs text-gray-500">No active complaints</span>
                    </div>
                 ) : (
                    telemetry?.recentComplaints?.map((c: any) => (
                      <div key={c.id} className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl relative group">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-500">{c.topic}</span>
                          <span className="text-[10px] text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-200/70 line-clamp-2">{c.content}</p>
                      </div>
                    ))
                 )}
               </div>
            </div>
         </div>

         {/* KOLOM KANAN: Radar Panopticon */}
         <div className="lg:col-span-2 border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-[#09090b]/80 backdrop-blur-3xl rounded-3xl p-6 flex flex-col shadow-[0_0_30px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden">
            <ShieldAlert className="w-96 h-96 absolute -right-20 -bottom-20 opacity-[0.03] text-white" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4 mb-6 relative z-10">
               <div>
                 <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900 dark:text-white">Security Panopticon Radar</h2>
                 <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">Real-time mapping of global DB intrusion & auth events</p>
               </div>
               <div className="flex gap-2">
                 <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/50">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> SECURE
                 </div>
               </div>
            </div>

            {/* Live Traffic Engine Hologram */}
            <div className="h-40 bg-zinc-50 dark:bg-black border border-gray-100 dark:border-zinc-900 rounded-2xl relative overflow-hidden mb-6 flex items-end px-4 gap-2 pt-10">
               {/* Mock Graph using animated bars */}
               {Array.from({ length: 40 }).map((_, i) => {
                 const height = Math.floor(Math.random() * 80) + 10;
                 return (
                   <motion.div 
                     key={i}
                     initial={{ height: 0 }}
                     animate={{ height: `${height}%` }}
                     transition={{ duration: 1, delay: i * 0.05, repeat: Infinity, repeatType: "reverse", repeatDelay: Math.random() * 2 }}
                     className="flex-1 bg-gradient-to-t from-emerald-600/80 to-teal-400/40 rounded-t-sm opacity-50"
                   />
                 )
               })}
               <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 dark:from-black via-transparent to-transparent pointer-events-none" />
               <div className="absolute top-4 left-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">NETWORK TRAFFIC FLOW</div>
            </div>

            <div className="flex-1 relative z-10">
               <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Live System Logbook</h3>
               <div className="space-y-2 h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                 {loading ? (
                    <div className="animate-pulse space-y-2">
                      {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-zinc-200 dark:bg-white/5 rounded-lg w-full"></div>)}
                    </div>
                 ) : (
                    telemetry?.recentLogs?.map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800/50 rounded-lg group hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className={`p-1.5 rounded-md ${
                              log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                              log.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-500' :
                              'bg-emerald-500/20 text-emerald-500'
                           }`}>
                             {log.severity === 'CRITICAL' ? <Lock className="w-3 h-3"/> :
                              log.severity === 'WARNING' ? <AlertTriangle className="w-3 h-3"/> :
                              <Fingerprint className="w-3 h-3"/>}
                           </div>
                           <div>
                             <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{log.actionData}</p>
                             <p className="text-[10px] text-gray-500 font-mono mt-0.5">{log.module} • {log.ipAddress || 'Internal'}</p>
                           </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                 )}
               </div>
            </div>

         </div>
      </div>
      
    </div>
  );
}
