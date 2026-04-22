"use client";

import { useTranslations } from "next-intl";
import { Activity, ShieldCheck, Database, Zap, Users, AlertTriangle, Fingerprint, Lock, ShieldAlert, Cpu, Settings, LineChart, BookOpen, Dna, GripHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { getGodsEyeTelemetry } from "../../actions/dashboard";
import { getActiveUserId } from "../../actions/auth";
import Link from "next/link";

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

  // DRAG AND DROP STATE
  const [isEditing, setIsEditing] = useState(false);
  const [layout, setLayout] = useState<string[]>(['ping', 'matrix', 'complaints', 'db', 'quicklaunch', 'logbook']);
  const [userId, setUserId] = useState<string>("anonymous");
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    // 1. TELEPORTASI MEMORI: Muat posisi dari LocalStorage (0 Detik)
    getActiveUserId().then(id => {
      setUserId(id);
      const storageKey = `NexusDashboardGrid_${id}`;
      const savedLayout = localStorage.getItem(storageKey);
      if (savedLayout) {
        setLayout(JSON.parse(savedLayout));
      }
    });

    // 2. FETCH DATA
    let mounted = true;
    const fetchTelemetry = async () => {
      const res = await getGodsEyeTelemetry();
      if (res.success && res.data && mounted) {
        setTelemetry(res.data);
      }
      if (mounted) setLoading(false);
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // DRAG & DROP LOGIC
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    e.dataTransfer.effectAllowed = "move";
    // Sedikit transparansi saat digeser
    setTimeout(() => {
       if(e.target instanceof HTMLElement) e.target.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if(e.target instanceof HTMLElement) e.target.style.opacity = '1';
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newLayout = [...layout];
      const draggedItemContent = newLayout[dragItem.current];
      newLayout.splice(dragItem.current, 1);
      newLayout.splice(dragOverItem.current, 0, draggedItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setLayout(newLayout);
      const storageKey = `NexusDashboardGrid_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(newLayout));
    }
  };

  // --- KOMPONEN WIDGET HOLOGRAPHIC ---

  const widgets: Record<string, React.ReactNode> = {
    ping: (
      <div className="bg-zinc-950/40 dark:bg-[#0a0a0c] border border-emerald-900/30 p-5 rounded-3xl relative overflow-hidden h-full flex flex-col">
         <div className="absolute -right-6 -top-6 bg-emerald-500/10 w-24 h-24 rounded-full blur-[30px]" />
         <div className="flex justify-between items-start mb-4 relative z-10">
           <div className="p-3 bg-emerald-950/50 rounded-xl border border-emerald-800"><Activity className="w-5 h-5 text-emerald-400" /></div>
           <span className="flex items-center gap-2 text-xs font-mono text-emerald-500"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> LIVE C2</span>
         </div>
         <div className="relative z-10 mt-auto">
           <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">VPS Server Ping</h4>
           <div className="flex flex-col">
             <span className="text-3xl font-black text-white">12<span className="text-sm text-gray-500">ms</span></span>
           </div>
         </div>
      </div>
    ),
    matrix: (
      <div className="bg-zinc-950/40 dark:bg-[#0a0a0c] border border-blue-900/30 p-5 rounded-3xl relative overflow-hidden h-full flex flex-col">
         <div className="absolute -right-6 -top-6 bg-blue-500/10 w-24 h-24 rounded-full blur-[30px]" />
         <div className="flex justify-between items-start mb-4 relative z-10">
           <div className="p-3 bg-blue-950/50 rounded-xl border border-blue-800"><Users className="w-5 h-5 text-blue-400" /></div>
           <span className="flex items-center gap-2 text-xs font-mono text-blue-500">MATRIX</span>
         </div>
         <div className="relative z-10 mt-auto">
           <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Active Identities</h4>
           <div className="flex flex-col">
             {loading ? <div className="h-9 w-12 bg-white/10 rounded animate-pulse" /> : 
               <span className="text-3xl font-black text-white">{telemetry?.activeUsers} <span className="text-sm text-gray-500 font-normal">/ {telemetry?.totalUsers} TTL</span></span>
             }
           </div>
         </div>
      </div>
    ),
    complaints: (
      <div className="bg-zinc-950/40 dark:bg-[#0a0a0c] border border-amber-900/30 p-5 rounded-3xl relative overflow-hidden h-full flex flex-col">
         <div className="absolute -right-6 -top-6 bg-amber-500/10 w-24 h-24 rounded-full blur-[30px]" />
         <div className="flex justify-between items-start mb-4 relative z-10">
           <div className="p-3 bg-amber-950/50 rounded-xl border border-amber-800"><AlertTriangle className="w-5 h-5 text-amber-500" /></div>
           <span className="flex items-center gap-2 text-xs font-mono text-amber-500">RED FLAGS</span>
         </div>
         <div className="relative z-10 mt-auto">
           <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Open Complaints</h4>
           <div className="flex flex-col">
             {loading ? <div className="h-9 w-12 bg-white/10 rounded animate-pulse" /> : 
               <span className="text-3xl font-black text-white">{telemetry?.totalComplaints} <span className="text-sm text-gray-500 font-normal">Total</span></span>
             }
           </div>
         </div>
      </div>
    ),
    db: (
      <div className="bg-zinc-950/40 dark:bg-[#0a0a0c] border border-purple-900/30 p-5 rounded-3xl relative overflow-hidden h-full flex flex-col">
         <div className="absolute -right-6 -top-6 bg-purple-500/10 w-24 h-24 rounded-full blur-[30px]" />
         <div className="flex justify-between items-start mb-4 relative z-10">
           <div className="p-3 bg-purple-950/50 rounded-xl border border-purple-800"><Database className="w-5 h-5 text-purple-400" /></div>
           <span className="flex items-center gap-2 text-xs font-mono text-purple-500">AEGIS DB</span>
         </div>
         <div className="relative z-10 mt-auto">
           <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Data Gravity Status</h4>
           <div className="flex flex-col">
             <span className="text-xl font-black text-white mt-1">PROTECTED</span>
           </div>
         </div>
      </div>
    ),
    quicklaunch: (
      <div className="lg:col-span-1 border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-[#09090b]/80 backdrop-blur-3xl rounded-3xl p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-yellow-500" />
            <h2 className="text-lg font-black uppercase tracking-widest">Quick Launchpad</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
             <Link href="/omni-analytics" className="bg-indigo-900/20 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-indigo-400">
               <LineChart className="w-6 h-6" /> <span className="text-[10px] font-bold uppercase tracking-widest text-center">Omni<br/>Analytics</span>
             </Link>
             <Link href="/evolution" className="bg-blue-900/20 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-blue-400">
               <Dna className="w-6 h-6" /> <span className="text-[10px] font-bold uppercase tracking-widest text-center">Evolution<br/>Center</span>
             </Link>
             <Link href="/codex" className="bg-emerald-900/20 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-emerald-400">
               <BookOpen className="w-6 h-6" /> <span className="text-[10px] font-bold uppercase tracking-widest text-center">Omni<br/>Codex</span>
             </Link>
             <Link href="/maintenance" className="bg-red-900/20 border border-red-500/30 hover:bg-red-600 hover:text-white transition rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-red-400">
               <ShieldAlert className="w-6 h-6" /> <span className="text-[10px] font-bold uppercase tracking-widest text-center">Aegis<br/>Panopticon</span>
             </Link>
          </div>
      </div>
    ),
    logbook: (
      <div className="lg:col-span-2 border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-[#09090b]/80 backdrop-blur-3xl rounded-3xl p-6 flex flex-col relative overflow-hidden h-full">
          <ShieldAlert className="w-96 h-96 absolute -right-20 -bottom-20 opacity-[0.03] text-white" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-white/5 pb-4 mb-6 relative z-10">
             <div>
               <h2 className="text-lg font-black uppercase tracking-widest text-zinc-900 dark:text-white">Live System Logbook</h2>
               <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">Real-time mapping of global DB intrusion & auth events</p>
             </div>
             <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1 border border-emerald-200 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> SECURE
             </div>
          </div>

          {/* Live Traffic Engine Hologram (60 FPS Framer Motion) */}
          <div className="h-32 bg-zinc-50 dark:bg-black border border-gray-100 dark:border-zinc-900 rounded-2xl relative overflow-hidden mb-6 flex items-end px-4 gap-2 pt-10 shrink-0">
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

          <div className="flex-1 relative z-10 overflow-y-auto custom-scrollbar pr-2 space-y-2">
             {loading ? (
                <div className="animate-pulse space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-10 bg-zinc-200 dark:bg-white/5 rounded-lg w-full"></div>)}
                </div>
             ) : (
                telemetry?.recentLogs?.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                       <div className={`p-1.5 rounded-md ${
                          log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                          log.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-500' :
                          'bg-emerald-500/20 text-emerald-500'
                       }`}>
                         <Fingerprint className="w-3 h-3"/>
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
    )
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-1000 pb-10">
      
      {/* HEADER COMMAND CENTER */}
      <div className="flex justify-between items-center bg-black/40 border border-white/5 p-4 rounded-2xl">
         <div>
           <h1 className="text-xl font-black uppercase tracking-widest text-white">Dynamic Command Center</h1>
           <p className="text-xs text-zinc-500 mt-1">Sistem tata letak Widget Holografis berbasis Drag-and-Drop tanpa waktu memuat.</p>
         </div>
         <button 
           onClick={() => setIsEditing(!isEditing)}
           className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2 ${isEditing ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:text-white'}`}
         >
           <Settings className="w-4 h-4" /> {isEditing ? 'Selesai Mengedit' : 'Edit Tata Letak'}
         </button>
      </div>

      {/* NEXUS GRID (THE DRAG & DROP ARENA) */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 auto-rows-[160px]">
         {layout.map((id, index) => {
            if (!widgets[id]) return null;

            // Tentukan lebar widget berdasarkan jenisnya
            let colSpan = "md:col-span-1 lg:col-span-3"; // Default kotak kecil
            let rowSpan = "row-span-1";
            
            if (id === 'quicklaunch') { colSpan = "md:col-span-2 lg:col-span-4"; rowSpan = "row-span-2"; }
            if (id === 'logbook') { colSpan = "md:col-span-4 lg:col-span-8"; rowSpan = "row-span-2"; }

            return (
              <div 
                key={id}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className={`${colSpan} ${rowSpan} relative group transition-transform ${isEditing ? 'cursor-grab active:cursor-grabbing hover:scale-[1.02]' : ''}`}
              >
                {isEditing && (
                  <div className="absolute -top-3 -right-3 z-50 bg-blue-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                    <GripHorizontal className="w-4 h-4" />
                  </div>
                )}
                
                {/* Garis Kedip Neon saat Edit Mode */}
                {isEditing && (
                  <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-3xl pointer-events-none z-40 animate-pulse" />
                )}

                {widgets[id]}
              </div>
            );
         })}
      </div>
      
    </div>
  );
}
