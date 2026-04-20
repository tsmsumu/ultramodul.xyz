"use client";

import { Database, FileSpreadsheet, PlusCircle, PenTool, Link, Activity, Zap, FileText, UploadCloud, ShieldCheck } from "lucide-react";

export function NexusPanel({ onAddNode }: { onAddNode: (type: string, payload: any) => void }) {
  return (
    <>
       <div>
         <h3 className="font-bold text-[10px] tracking-widest text-[#4f46e5] mb-2 uppercase">1. The Ingestors</h3>
         <div className="space-y-1.5">
            <button 
              onClick={() => onAddNode('database', { label: 'Live Connection', dbUrl: '' })}
              className="w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-left text-[11px] font-bold transition flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><Database className="w-3.5 h-3.5"/> Live DB Connector</span>
              <PlusCircle className="w-3 h-3 opacity-50" />
            </button>
            <button 
              onClick={() => onAddNode('file', { label: 'Parquet / Stata', fileName: 'Select File...' })}
              className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl text-left text-[11px] font-bold transition flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><FileSpreadsheet className="w-3.5 h-3.5"/> File Drop Node</span>
              <PlusCircle className="w-3 h-3 opacity-50" />
            </button>
         </div>
       </div>

       <div className="mt-4">
         <h3 className="font-bold text-[10px] tracking-widest text-amber-500 mb-2 uppercase">2. The Forge</h3>
         <div className="space-y-1.5">
            <button 
              onClick={() => onAddNode('sql', { sqlQuery: 'SELECT * FROM source_data' })}
              className="w-full px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-900/30 rounded-xl text-left text-[11px] font-bold transition flex items-center justify-between shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]"
            >
              <span className="flex items-center gap-2"><PenTool className="w-3.5 h-3.5"/> Raw SQL Override</span>
              <PlusCircle className="w-3 h-3 opacity-50" />
            </button>
            <button 
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-500 border border-gray-200 dark:border-white/10 rounded-xl text-left text-[11px] font-bold transition flex items-center justify-between opacity-50 cursor-not-allowed"
            >
              <span className="flex items-center gap-2"><Link className="w-3.5 h-3.5"/> Join / Merge Node</span>
              <PlusCircle className="w-3 h-3 opacity-50" />
            </button>
         </div>
       </div>

       <div className="mt-4">
         <h3 className="font-bold text-[10px] tracking-widest text-cyan-500 mb-2 uppercase">3. The Sanitizer</h3>
         <button 
           onClick={() => onAddNode('sanitizer', { washNulls: true, trimUpper: true })}
           className="w-full px-3 py-2 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-900/30 rounded-xl text-left text-[11px] font-bold transition flex items-center justify-between"
         >
           <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5"/> Auto-Sanitizer Wash</span>
           <PlusCircle className="w-3 h-3 opacity-50" />
         </button>
       </div>

       <div className="mt-4 opacity-50">
         <h3 className="font-bold text-[10px] tracking-widest text-rose-500 mb-2 uppercase flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> 4. The Sentinel</h3>
         <button 
           className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-500 border border-gray-200 dark:border-white/10 rounded-xl text-left text-[11px] font-bold transition flex items-center justify-between cursor-not-allowed border-dashed"
         >
           <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5"/> Data Quality Auditor</span>
         </button>
       </div>

       <div className="mt-4">
         <h3 className="font-bold text-[10px] tracking-widest text-purple-500 mb-2 uppercase">5. The Destinations</h3>
         <div className="space-y-1.5">
            <button 
              onClick={() => onAddNode('publish', {})}
              className="w-full px-3 py-2 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 rounded-xl text-left text-[11px] font-bold transition flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><UploadCloud className="w-3.5 h-3.5"/> Publish Hub</span>
              <PlusCircle className="w-3 h-3 opacity-50" />
            </button>
         </div>
       </div>
    </>
  );
}
