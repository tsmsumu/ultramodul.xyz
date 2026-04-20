"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Database, FileSpreadsheet, HardDriveDownload, BoxSelect, BookOpen } from "lucide-react";
import { useState } from "react";

const SERVER_DB = ["DuckDB (Default)", "Dazle (Drizzle)", "SQLite", "PostgreSQL", "MySQL", "MsSQL", "Oracle"];
const FILE_DB = ["Parquet (Default)", "Excel", "Tableau", "Stata", "CSV", "TXT", "JSON", "HTML"];

export function OmniEtlModal({
  isOpen,
  onClose,
  selectedCount,
  onExport
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onExport: (type: string, format: string, isMetadata: boolean) => void; // Update Export signature
}) {
  const [targetGroup, setTargetGroup] = useState<'SERVER'|'FILE'|null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [isMetadataMode, setIsMetadataMode] = useState<boolean>(false);

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
            {/* SAKLAR METADATA VS RAW DATA */}
            <div className="flex bg-gray-200 dark:bg-white/10 p-1 rounded-xl mb-6 shadow-inner w-full sm:w-2/3 mx-auto">
               <button 
                 onClick={() => setIsMetadataMode(false)}
                 className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-2 ${!isMetadataMode ? 'bg-white dark:bg-[#111113] shadow-md text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 <Database className="w-4 h-4" /> EKSPOR ISI DATA (RAW)
               </button>
               <button 
                 onClick={() => setIsMetadataMode(true)}
                 className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-2 ${isMetadataMode ? 'bg-white dark:bg-[#111113] shadow-md text-amber-600 dark:text-amber-500' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 <BookOpen className="w-4 h-4" /> KAMUS/METADATA
               </button>
            </div>

            <p className="font-semibold mb-4 text-sm tracking-wide">1. PILIHAN KLAN DESTINASI:</p>
            
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
                   2. PILIH SPESIFIKASI FORMAT {targetGroup === 'SERVER' ? 'SERVER' : 'APLIKASI'}:
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
               onClick={() => onExport(targetGroup!, selectedFormat, isMetadataMode)}
               disabled={!selectedFormat}
               className={`px-6 py-2 rounded-xl text-sm font-bold disabled:opacity-50 transition shadow-lg text-white
                 ${isMetadataMode ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"}`}
             >
               Mulai Ekstraksi {isMetadataMode ? "Kamus Data" : "Raw Data"}
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
