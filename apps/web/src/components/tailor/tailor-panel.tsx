"use client";

import { Database, FileSpreadsheet, PlusCircle, Link, Download } from "lucide-react";

export function TailorPanel({ onAddNode }: { onAddNode: (type: string, payload: any) => void }) {
  return (
    <>
       <div>
         <h3 className="font-bold text-sm tracking-wide text-gray-500 mb-3">1. SUMBER DATA (Persenjataan)</h3>
         <div className="space-y-2">
            <button 
              onClick={() => onAddNode('database', { label: 'Oracle', dbName: 'New Connection' })}
              className="w-full px-4 py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30 rounded-xl text-left text-xs font-bold transition flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><Database className="w-4 h-4"/> Server DB Node</span>
              <PlusCircle className="w-3 h-3 opacity-50" />
            </button>
            <button 
              onClick={() => onAddNode('file', { label: 'Excel/Parquet', fileName: 'Select File...' })}
              className="w-full px-4 py-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-left text-xs font-bold transition flex items-center justify-between"
            >
              <span className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> File DB Node</span>
              <PlusCircle className="w-3 h-3 opacity-50" />
            </button>
         </div>
       </div>

       <div className="mt-4">
         <h3 className="font-bold text-sm tracking-wide text-gray-500 mb-3">2. SULAM TRANSFORMASI (Knockdown)</h3>
         <button 
           className="w-full px-4 py-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 border border-amber-200 dark:border-amber-900/30 rounded-xl text-left text-xs font-bold transition flex items-center justify-between opacity-50 cursor-not-allowed"
           title="Akan aktif setelah DuckDB Wasm dipasang"
         >
           <span className="flex items-center gap-2"><Link className="w-4 h-4"/> Join / Merge Node</span>
           <PlusCircle className="w-3 h-3 opacity-50" />
         </button>
       </div>

       <div className="mt-4">
         <h3 className="font-bold text-sm tracking-wide text-gray-500 mb-3">3. TEMBAK EKSPOR (Destinasi Akhir)</h3>
         <button 
           className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl text-left text-xs font-bold transition flex items-center justify-between opacity-50 cursor-not-allowed"
         >
           <span className="flex items-center gap-2"><Download className="w-4 h-4"/> Export Node (Word/Pdf)</span>
           <PlusCircle className="w-3 h-3 opacity-50" />
         </button>
       </div>

       <div className="mt-auto p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-xl text-xs text-blue-800 dark:text-blue-400 leading-relaxed shadow-inner">
         <strong>PUM Architecture:</strong><br/>
         Tarik bulatan tepi (Handle) di Node PostgreSQL/Oracle lalu sambungkan ke Node Parquet/Excel untuk mengisyaratkan proses Relasi (JOIN). Ini adalah uji coba kanvas.
       </div>
    </>
  );
}
