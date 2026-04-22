"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, GitMerge, Lock, Users, Terminal, Database, Server, GitBranch, ArrowRight } from "lucide-react";

export default function DevManualPage() {
  const t = useTranslations("devmanual");

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="bg-black/80 border border-white/5 p-8 md:p-10 rounded-3xl relative overflow-hidden shadow-2xl shrink-0">
         <div className="absolute -left-20 -top-20 bg-indigo-500/10 w-64 h-64 rounded-full blur-3xl" />
         <div className="absolute -right-20 -bottom-20 bg-emerald-500/10 w-64 h-64 rounded-full blur-3xl" />
         
         <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 bg-linear-to-br from-indigo-900/40 to-black border border-indigo-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] shrink-0">
              <GitMerge className="w-12 h-12 text-indigo-400" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-widest uppercase mb-2">UltraModul Developer Blueprint</h1>
              <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed mb-4">
                {t('subtitle')}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                 <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-950/30 flex items-center gap-1">
                   <ShieldCheck className="w-3 h-3" /> Zero-Trust Architecture
                 </span>
                 <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest border border-blue-500/30 px-3 py-1 rounded-full bg-blue-950/30 flex items-center gap-1">
                   <GitBranch className="w-3 h-3" /> GitHub Centric
                 </span>
              </div>
            </div>
         </div>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PILAR 1 */}
        <div className="bg-zinc-950/60 border border-white/5 rounded-3xl p-8 hover:border-indigo-500/30 transition-colors group">
           <div className="w-12 h-12 bg-indigo-950/50 rounded-xl flex items-center justify-center border border-indigo-900/50 mb-6 group-hover:scale-110 transition-transform">
             <Server className="w-6 h-6 text-indigo-400" />
           </div>
           <h2 className="text-xl font-bold text-white mb-3 tracking-wide">{t('p1Title')}</h2>
           <p className="text-sm text-zinc-400 leading-relaxed mb-6">{t('p1Desc')}</p>
           
           <div className="bg-black/50 rounded-xl p-5 border border-white/5 space-y-3">
             <div className="flex gap-3 text-sm"><span className="text-indigo-500 font-bold">1.</span><span className="text-zinc-300">{t('p1S1')}</span></div>
             <div className="flex gap-3 text-sm"><span className="text-indigo-500 font-bold">2.</span><span className="text-zinc-300">{t('p1S2')}</span></div>
             <div className="flex gap-3 text-sm"><span className="text-indigo-500 font-bold">3.</span><span className="text-zinc-300 font-mono text-xs bg-zinc-900 px-2 py-1 rounded">git clone https://github.com/tsmsumu/ultramodul.xyz.git</span></div>
             <div className="flex gap-3 text-sm"><span className="text-indigo-500 font-bold">4.</span><span className="text-zinc-300">{t('p1S4')}</span></div>
           </div>
        </div>

        {/* PILAR 2 */}
        <div className="bg-zinc-950/60 border border-white/5 rounded-3xl p-8 hover:border-emerald-500/30 transition-colors group">
           <div className="w-12 h-12 bg-emerald-950/50 rounded-xl flex items-center justify-center border border-emerald-900/50 mb-6 group-hover:scale-110 transition-transform">
             <Lock className="w-6 h-6 text-emerald-400" />
           </div>
           <h2 className="text-xl font-bold text-white mb-3 tracking-wide">{t('p2Title')}</h2>
           
           <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 mb-6 flex gap-3">
             <ShieldCheck className="w-5 h-5 text-red-500 shrink-0" />
             <p className="text-xs text-red-400/90 leading-relaxed">{t('p2Warning')}</p>
           </div>

           <ul className="space-y-3 text-sm text-zinc-300 list-disc list-inside">
             <li>{t('p2L1')}</li>
             <li>{t('p2L2')}</li>
             <li>{t('p2L3')}</li>
           </ul>
        </div>

        {/* PILAR 3 */}
        <div className="bg-zinc-950/60 border border-white/5 rounded-3xl p-8 hover:border-amber-500/30 transition-colors group lg:col-span-2">
           <div className="w-12 h-12 bg-amber-950/50 rounded-xl flex items-center justify-center border border-amber-900/50 mb-6 group-hover:scale-110 transition-transform">
             <GitBranch className="w-6 h-6 text-amber-400" />
           </div>
           <h2 className="text-xl font-bold text-white mb-3 tracking-wide">{t('p3Title')}</h2>
           <p className="text-sm text-zinc-400 leading-relaxed mb-6">{t('p3Desc')}</p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
                 <div className="text-amber-500 font-bold mb-2">Branch `main`</div>
                 <div className="text-xs text-zinc-400">{t('p3Main')}</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
                 <div className="text-indigo-400 font-bold mb-2">Branch `dev-andi`</div>
                 <div className="text-xs text-zinc-400">{t('p3Andi')}</div>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
                 <div className="text-emerald-400 font-bold mb-2">Branch `dev-susi`</div>
                 <div className="text-xs text-zinc-400">{t('p3Susi')}</div>
              </div>
           </div>

           <div className="bg-black/50 rounded-xl p-6 border border-white/5">
             <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">{t('p3Merge')}</h3>
             <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{t('p3Merge1')}</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{t('p3Merge2')}</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-amber-900/30 text-amber-500 border border-amber-500/30 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <p className="text-sm text-amber-300/90 leading-relaxed">{t('p3Merge3')}</p>
                </div>
             </div>
           </div>
        </div>

        {/* PILAR 4 */}
        <div className="bg-zinc-950/60 border border-white/5 rounded-3xl p-8 hover:border-red-500/30 transition-colors group lg:col-span-2">
           <div className="w-12 h-12 bg-red-950/50 rounded-xl flex items-center justify-center border border-red-900/50 mb-6 group-hover:scale-110 transition-transform">
             <Lock className="w-6 h-6 text-red-400" />
           </div>
           <h2 className="text-xl font-bold text-white mb-3 tracking-wide">{t('p4Title')}</h2>
           <p className="text-sm text-red-400 leading-relaxed font-bold mb-6">{t('p4Desc')}</p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4 items-start">
                <ShieldCheck className="w-5 h-5 text-zinc-500 mt-1 shrink-0" />
                <p className="text-sm text-zinc-400">{t('p4L1')}</p>
              </div>
              <div className="flex gap-4 items-start">
                <Terminal className="w-5 h-5 text-zinc-500 mt-1 shrink-0" />
                <p className="text-sm text-zinc-400">{t('p4L2')}</p>
              </div>
              <div className="flex gap-4 items-start">
                <Database className="w-5 h-5 text-zinc-500 mt-1 shrink-0" />
                <p className="text-sm text-zinc-400">{t('p4L3')}</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
