"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Database, FileSpreadsheet, HardDriveDownload, BoxSelect } from "lucide-react";
import { useState } from "react";

const SERVER_DB = ["DuckDB (Default)", "PostgreSQL", "MySQL", "MsSQL", "Oracle"];
const FILE_DB = ["Parquet", "Excel", "Tableau", "Stata", "CSV", "TXT", "JSON", "HTML"];

export function OmniEtlModal({
  isOpen,
  onClose,
  selectedCount,
  onExport
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onExport: (type: string, format: string) => void;
}) {
  const [targetGroup, setTargetGroup] = useState<'SERVER'|'FILE'|null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-900/10">
             <div>
               <h2 className="text-xl font-bold flex items-center gap-2"><HardDriveDownload className="text-indigo-600" /> Omni-ETL Export Hub</h2>
               <p className="text-sm text-gray-500 mt-1">Mengemas {selectedCount} data identitas untuk diekstrak keluar dari platform.</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition"><X className="w-5 h-5"/></button>
          </div>

          <div className="p-6 flex-1 bg-gray-50/50 dark:bg-white/[0.02]">
            <p className="font-semibold mb-4 text-sm tracking-wide">PILIHAN KLAN DESTINASI:</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => { setTargetGroup('SERVER'); setSelectedFormat(''); }}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition ${targetGroup === 'SERVER' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-white/10 hover:border-indigo-300'}`}
              >
                <Database className={`w-8 h-8 ${targetGroup === 'SERVER' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span className="font-bold text-sm">Persisten / Server DB</span>
                <span className="text-[10px] text-gray-500 text-center">Hasil berupa File Dump (DDL/DML) siap tempel di server lain.</span>
              </button>

              <button 
                onClick={() => { setTargetGroup('FILE'); setSelectedFormat(''); }}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition ${targetGroup === 'FILE' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-white/10 hover:border-emerald-300'}`}
              >
                <FileSpreadsheet className={`w-8 h-8 ${targetGroup === 'FILE' ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className="font-bold text-sm">Standalone File DB</span>
                <span className="text-[10px] text-gray-500 text-center">Format biner dan teks untuk pengolahan Data Science.</span>
              </button>
            </div>

            {targetGroup && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <p className="font-semibold mb-3 text-sm tracking-wide flex items-center gap-2">
                   <BoxSelect className="w-4 h-4" /> 
                   PILIH SPESIFIKASI FORMAT {targetGroup === 'SERVER' ? 'SERVER' : 'APLIKASI'}:
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                   {(targetGroup === 'SERVER' ? SERVER_DB : FILE_DB).map(fmt => (
                     <button
                       key={fmt}
                       onClick={() => setSelectedFormat(fmt)}
                       className={`py-2 px-3 text-xs font-medium rounded-lg border transition ${selectedFormat === fmt ? (targetGroup === 'SERVER' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-emerald-600 text-white border-emerald-600') : 'border-gray-300 dark:border-white/20 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                     >
                       {fmt}
                     </button>
                   ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#0a0a0c] flex justify-end gap-3">
             <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition">Batal</button>
             <button 
               onClick={() => onExport(targetGroup!, selectedFormat)}
               disabled={!selectedFormat}
               className="px-6 py-2 rounded-xl text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 disabled:opacity-50 transition shadow-lg"
             >
               Mulai Ekstraksi
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
