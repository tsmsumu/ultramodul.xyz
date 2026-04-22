import appVersion from "../../../core/version.json";
import { ShieldCheck, Cpu, Terminal, Fingerprint, Database, GitBranch, Zap } from "lucide-react";

export const metadata = {
  title: "Aegis System Core | PUM Enterprise",
};

export default function AboutPage() {
  return (
    <div className="max-w-[1200px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col font-sans py-10">
      
      {/* HEADER */}
      <div className="flex items-center gap-6 bg-black/80 border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden mb-8">
         <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px]" />
         <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px]" />
         
         <div className="w-20 h-20 bg-indigo-900/80 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-lg relative z-10 group hover:bg-indigo-600 transition-colors cursor-crosshair">
           <Cpu className="w-10 h-10 text-indigo-400 group-hover:text-white transition-colors" />
         </div>
         <div className="relative z-10">
           <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1 flex items-center gap-3">
             Aegis System Core
             <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-2 py-1 border border-indigo-500/50 rounded-full animate-pulse flex items-center gap-1">
               <Zap className="w-3 h-3" /> ONLINE
             </span>
           </h1>
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest border border-indigo-500/30 text-indigo-400 bg-indigo-950/30 px-2 py-0.5 rounded">
                Platform Specifications
              </span>
              <span className="text-xs text-zinc-500 font-mono">Top Secret Clearance</span>
           </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: IDENTITY */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-950/80 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden shadow-[0_0_50px_-15px_rgba(99,102,241,0.2)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] pointer-events-none" />
            
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Fingerprint className="w-4 h-4" /> Identity & Versioning Matrix
            </h2>
            
            <div className="space-y-6 font-mono text-sm">
              <div className="flex flex-col border-b border-white/5 pb-4">
                <span className="text-zinc-500 mb-1">PLATFORM_NAME</span>
                <span className="text-xl font-bold text-white tracking-widest">{appVersion.platform}</span>
              </div>
              
              <div className="flex flex-col border-b border-white/5 pb-4">
                <span className="text-zinc-500 mb-1">BUILD_VERSION</span>
                <span className="text-lg text-emerald-400 tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> {appVersion.version}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 block mb-1">DATE_COMPILED</span>
                  <span className="text-white font-bold">{appVersion.raw.date}</span>
                </div>
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 block mb-1">TIME_STAMP</span>
                  <span className="text-white font-bold">{appVersion.raw.time}</span>
                </div>
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 block mb-1">GIT_HASH</span>
                  <span className="text-indigo-400 font-bold">{appVersion.raw.hash}</span>
                </div>
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                  <span className="text-[10px] text-zinc-500 block mb-1">LIFESPAN</span>
                  <span className="text-emerald-400 font-bold">{appVersion.raw.daysAgo} days old</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-950/80 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <ShieldCheck className="w-4 h-4" /> Architecture Principles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="p-4 border border-white/5 rounded-xl bg-black/40 hover:bg-white/5 transition-colors cursor-default">
                 <h3 className="font-bold text-white mb-2">Blank Canvas Governance</h3>
                 <p className="text-xs text-zinc-400 leading-relaxed">No domain-specific hardcodes. Dynamic dictionaries. Agnostic NLP mapping. Fully adaptable to any sector.</p>
               </div>
               <div className="p-4 border border-white/5 rounded-xl bg-black/40 hover:bg-white/5 transition-colors cursor-default">
                 <h3 className="font-bold text-white mb-2">Zero Redundancy</h3>
                 <p className="text-xs text-zinc-400 leading-relaxed">Single source of truth via DuckDB & SQLite. Micro-frontend Pub/Sub orchestration. Unified memory.</p>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: TELEMETRY */}
        <div className="space-y-6">
          <div className="bg-zinc-950/80 border border-white/5 rounded-3xl p-8 relative h-full flex flex-col">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Database className="w-4 h-4" /> Tech Stack Telemetry
            </h2>
            
            <div className="flex-1 flex flex-col justify-center space-y-4 font-mono text-xs">
               <div className="flex items-center justify-between p-3 border border-white/5 rounded-xl bg-black/50">
                 <span className="text-zinc-500">FRAMEWORK</span>
                 <span className="text-white font-bold text-right">Next.js 16.2 Turbopack</span>
               </div>
               <div className="flex items-center justify-between p-3 border border-white/5 rounded-xl bg-black/50">
                 <span className="text-zinc-500">ORM / DB</span>
                 <span className="text-white font-bold text-right">Drizzle + LibSQL</span>
               </div>
               <div className="flex items-center justify-between p-3 border border-white/5 rounded-xl bg-black/50">
                 <span className="text-zinc-500">OLAP ENGINE</span>
                 <span className="text-white font-bold text-right">DuckDB WASM</span>
               </div>
               <div className="flex items-center justify-between p-3 border border-white/5 rounded-xl bg-black/50">
                 <span className="text-zinc-500">STYLING</span>
                 <span className="text-white font-bold text-right">TailwindCSS v4</span>
               </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <GitBranch className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
              <p className="text-[10px] text-zinc-500 tracking-widest uppercase">Manufactured by PUM Dev Team</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
