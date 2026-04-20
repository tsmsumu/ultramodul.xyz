"use client";

import { Database, FileSpreadsheet, PlusCircle, Link, Download, BookOpen, FileText } from "lucide-react";

export function TailorPanel({ onAddNode }: { onAddNode: (type: string, payload: any) => void }) {
  return (
    <>
       <div>
         <h3 className="font-bold text-xs tracking-wide text-gray-500 mb-2">1. IMPORT DATA (Server & File)</h3>
         <div className="space-y-2">
            <button 
              onClick={() => onAddNode('database', { label: 'Oracle / Drizzle', dbName: 'New Connection' })}
              className="w-full px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30 rounded-xl text-left text-xs font-bold transition flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><Database className="w-4 h-4"/> Server DB Node</span>
              <PlusCircle className="w-3 h-3 opacity-50" />
            </button>
            <button 
              onClick={() => onAddNode('file', { label: 'Parquet / Stata', fileName: 'Select File...' })}
              className="w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-left text-xs font-bold transition flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> File DB Node</span>
              <PlusCircle className="w-3 h-3 opacity-50" />
            </button>
         </div>
       </div>

       <div className="mt-4">
         <h3 className="font-bold text-xs tracking-wide text-gray-500 mb-2">2. IMPORT DICTIONARY (Metadata)</h3>
         <button 
           onClick={() => onAddNode('metadata', { label: 'Extract Variable Schema', dbName: 'Source: Oracle/Parquet' })}
           className="w-full px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-900/30 rounded-xl text-left text-xs font-bold transition flex items-center justify-between"
         >
           <span className="flex items-center gap-2"><BookOpen className="w-4 h-4"/> Dictionary Schema Node</span>
           <PlusCircle className="w-3 h-3 opacity-50" />
         </button>
       </div>

       <div className="mt-4">
         <h3 className="font-bold text-xs tracking-wide text-gray-500 mb-2">3. TRANSFORM (Stitching)</h3>
         <button 
           className="w-full px-3 py-2 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl text-left text-xs font-bold transition flex items-center justify-between opacity-50 cursor-not-allowed"
           title="Active when DuckDB Wasm is implemented"
         >
           <span className="flex items-center gap-2"><Link className="w-4 h-4"/> Join / Merge Node</span>
           <PlusCircle className="w-3 h-3 opacity-50" />
         </button>
       </div>

       <div className="mt-4">
         <h3 className="font-bold text-xs tracking-wide text-gray-500 mb-2">4. EXPORT (Destination)</h3>
         <div className="space-y-2">
            <button 
              className="w-full px-3 py-2 bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 rounded-xl text-left text-xs font-bold transition flex items-center justify-between opacity-50 cursor-not-allowed"
            >
              <span className="flex items-center gap-2"><Download className="w-4 h-4"/> Export to File DB/Server</span>
              <PlusCircle className="w-3 h-3 opacity-50" />
            </button>
            <button 
              className="w-full px-3 py-2 bg-fuchsia-50 dark:bg-fuchsia-900/10 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-900/30 rounded-xl text-left text-xs font-bold transition flex items-center justify-between opacity-50 cursor-not-allowed"
            >
              <span className="flex items-center gap-2"><FileText className="w-4 h-4"/> Export Word/PDF/HTML</span>
              <PlusCircle className="w-3 h-3 opacity-50" />
            </button>
         </div>
       </div>
    </>
  );
}
