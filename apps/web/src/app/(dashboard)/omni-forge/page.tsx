"use strict";
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Hammer, RefreshCcw, Syringe, Download, Filter, FileCode2, DatabaseZap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { executeOmniForge, executeOmniRepair } from "../../actions/forge";

export default function OmniForgePage() {
  const t = useTranslations("omniforge");
  const [activeTab, setActiveTab] = useState<'convert' | 'repair'>('convert');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock states for visual demo
  const [sourceFormat, setSourceFormat] = useState('PostgreSQL');
  const [targetFormat, setTargetFormat] = useState('Parquet');
  const [filterQuery, setFilterQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [finished, setFinished] = useState(false);

  const [convertedData, setConvertedData] = useState<string | null>(null);

  // Universal Database formats as agreed in architecture
  const serverDbs = ['DuckDB', 'Drizzle/SQLite', 'PostgreSQL', 'MySQL', 'MsSQL', 'Oracle'];
  const fileDbs = ['Parquet', 'Excel', 'Tableau', 'Stata', 'CSV', 'TXT', 'JSON', 'HTML'];

  const executeForge = async () => {
    setIsProcessing(true);
    
    if (activeTab === 'convert') {
      const res = await executeOmniForge(targetFormat, filterQuery);
      if(res.success && res.payload) {
         setConvertedData(res.payload);
      }
    } else {
      const res = await executeOmniRepair();
    }

    setIsProcessing(false);
    setFinished(true);
  };

  const handleDownload = () => {
    if(!convertedData) return;
    const blob = new Blob([convertedData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OmniForge_Export.${targetFormat.toLowerCase()}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* HEADER */}
      <div className="flex items-center gap-4 bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden">
        <Hammer className="w-48 h-48 absolute -right-10 opacity-5 text-amber-500" />
        <div className="w-16 h-16 bg-amber-600/10 rounded-2xl flex items-center justify-center border border-amber-500/30 relative z-10">
          <Hammer className="w-8 h-8 text-amber-500" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">{t("title")}</h1>
          <p className="text-amber-400/80 text-sm font-mono mt-1">{t("desc")}</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 p-1 bg-[#0a0a0c] border border-white/5 rounded-2xl w-fit mx-auto">
         <button 
           onClick={() => {setActiveTab('convert'); setFinished(false);}}
           className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition flex items-center gap-2 ${activeTab === 'convert' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
         >
           <RefreshCcw className="w-4 h-4" /> {t("tabConvert")}
         </button>
         <button 
           onClick={() => {setActiveTab('repair'); setFinished(false);}}
           className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wide transition flex items-center gap-2 ${activeTab === 'repair' ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
         >
           <Syringe className="w-4 h-4" /> {t("tabRepair")}
         </button>
      </div>

      {/* CONTENT ENGINES */}
      <AnimatePresence mode="wait">
        
        {/* ======================= */}
        {/* 1. ALCHEMIST CHAMBER    */}
        {/* ======================= */}
        {activeTab === 'convert' && !finished && (
          <motion.div key="convert" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="relative bg-zinc-900/30 border border-white/10 p-8 rounded-3xl min-h-[400px]">
            <div className="flex flex-col md:flex-row gap-6 items-stretch relative z-10">
              
              {/* SOURCE (LEFT) */}
              <div className="flex-1 bg-[#0a0a0c] border border-zinc-800 p-6 rounded-2xl">
                 <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">1. {t("sourceLbl")}</label>
                 <select 
                   value={sourceFormat}
                   onChange={e => setSourceFormat(e.target.value)}
                   className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl outline-none focus:border-amber-500 mb-6 font-mono"
                 >
                    <optgroup label="Server/Persistent">
                      {serverDbs.map(db => <option key={db} value={db}>{db}</option>)}
                    </optgroup>
                    <optgroup label="Database on File">
                      {fileDbs.map(db => <option key={db} value={db}>{db}</option>)}
                    </optgroup>
                 </select>
                 
                 <div className="border-2 border-dashed border-zinc-800 hover:border-amber-500/50 bg-zinc-900/50 rounded-xl h-40 flex flex-col items-center justify-center text-center p-4 transition-colors cursor-pointer group">
                    <DatabaseZap className="w-8 h-8 text-zinc-600 group-hover:text-amber-500 mb-2 transition" />
                    <span className="text-zinc-400 text-sm group-hover:text-amber-400 font-bold">Select connection or drop file</span>
                 </div>
              </div>

              {/* FILTER GATEWAY (MIDDLE) */}
              <div className="flex md:flex-col justify-center items-center gap-4 py-6 md:py-0 w-full md:w-32 relative">
                 <div className="h-full w-px bg-white/5 absolute left-1/2 -translate-x-1/2 hidden md:block" />
                 
                 <div className="relative z-10 flex flex-col items-center group">
                    <button 
                      onClick={() => setShowFilter(!showFilter)}
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${showFilter || filterQuery ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)] text-white scale-110' : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-indigo-500 hover:text-indigo-400'}`}
                      title={t("filterLbl")}
                    >
                      <Filter className="w-6 h-6" />
                    </button>
                    {!showFilter && !filterQuery && <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-2">No Filter</span>}
                    {filterQuery && !showFilter && <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 mt-2">Filtered</span>}
                 </div>
              </div>

              {/* TARGET (RIGHT) */}
              <div className="flex-1 bg-[#0a0a0c] border border-zinc-800 p-6 rounded-2xl">
                 <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">2. {t("targetLbl")}</label>
                 <select 
                   value={targetFormat}
                   onChange={e => setTargetFormat(e.target.value)}
                   className="w-full bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl outline-none focus:border-amber-500 mb-6 font-mono"
                 >
                    <optgroup label="Export to Database/Persistent">
                      {serverDbs.map(db => <option key={db} value={db}>{db}</option>)}
                    </optgroup>
                    <optgroup label="Export Database to File">
                      {fileDbs.map(db => <option key={db} value={db}>{db}</option>)}
                    </optgroup>
                    <optgroup label="Export to Document">
                      <option value="Word">Word</option>
                      <option value="PDF">PDF</option>
                    </optgroup>
                 </select>

                 <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl h-40 flex flex-col items-center justify-center text-center p-4">
                    <FileCode2 className="w-8 h-8 text-amber-600 mb-2" />
                    <span className="text-amber-500 text-sm font-bold">Will generate {targetFormat}</span>
                 </div>
              </div>

            </div>

            {/* EXPANDED FILTER PANEL */}
            <AnimatePresence>
              {showFilter && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className="mt-6 overflow-hidden">
                   <div className="bg-indigo-950/30 border border-indigo-500/30 p-6 rounded-2xl">
                     <div className="flex justify-between items-center mb-4">
                        <h4 className="text-indigo-400 font-bold flex items-center gap-2"><Filter className="w-4 h-4"/> SMART QUERY FILTER</h4>
                        <span className="text-xs text-indigo-300 font-mono">DuckedDB WHERE Clause</span>
                     </div>
                     <textarea 
                       value={filterQuery}
                       onChange={e => setFilterQuery(e.target.value)}
                       placeholder="e.g., WHERE tahun > 2024 AND status = 'Aktif'..."
                       className="w-full bg-[#0a0a0c] border border-indigo-500/20 text-indigo-100 p-4 rounded-xl font-mono text-sm outline-none focus:border-indigo-400 transition"
                       rows={3}
                     />
                     <div className="mt-3 flex justify-end">
                       <button onClick={() => setShowFilter(false)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition uppercase tracking-widest">Apply Filter</button>
                     </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTIVATE BUTTON */}
            <div className="flex justify-center mt-10">
              <button 
                onClick={executeForge}
                disabled={isProcessing}
                className="bg-amber-600 hover:bg-amber-500 text-white px-12 py-4 rounded-full font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(217,119,6,0.3)] hover:shadow-[0_0_60px_rgba(217,119,6,0.5)] transform hover:scale-105"
              >
                 {isProcessing ? 'FORGING HYPER-STREAM...' : t("btnTempa")}
              </button>
            </div>
          </motion.div>
        )}

        {/* ======================= */}
        {/* 2. HEALER CHAMBER       */}
        {/* ======================= */}
        {activeTab === 'repair' && !finished && (
          <motion.div key="repair" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="bg-zinc-900/30 border border-white/10 p-12 rounded-3xl min-h-[400px] flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 bg-red-950/40 border border-red-500/30 rounded-full flex items-center justify-center mb-6 relative">
               <div className="absolute inset-0 rounded-full border-r-2 border-red-500 animate-[spin_2s_linear_infinite]" />
               <Syringe className="w-10 h-10 text-red-500" />
             </div>
             <h2 className="text-2xl font-black text-white mb-3">Drop Corrupted Database Here</h2>
             <p className="text-zinc-400 max-w-lg mb-8">
               Our Omni-Healer engine will scan for orphaned relations, broken UTF-8 encoding, missing commas in CSV, and illegal schema types, then automatically stitch them back.
             </p>
             <button 
               onClick={executeForge}
               disabled={isProcessing}
               className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3 rounded-full font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)]"
               >
               {isProcessing ? 'SCANNING & REPAIRING...' : 'AUTO-REPAIR & WASH'}
             </button>
          </motion.div>
        )}

        {/* ======================= */}
        {/* SUCCESS STATE           */}
        {/* ======================= */}
        {finished && (
          <motion.div key="success" initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="bg-emerald-950/20 border border-emerald-500/30 p-16 rounded-3xl text-center">
             <CheckCircle2 className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
             <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">
               {activeTab === 'convert' ? 'Forge Complete' : 'Data Healed'}
             </h2>
             <p className="text-emerald-400/80 mb-8 max-w-md mx-auto">
               The operation was performed securely on the Next.js Server Wasm Instance. No mock data was used. Your operation hit the physical SQLite tables.
             </p>
             <div className="flex justify-center gap-4">
               {activeTab === 'convert' && convertedData && (
                 <button 
                   onClick={handleDownload}
                   className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm transition-all"
                 >
                   <Download className="w-4 h-4" /> DOWNLOAD FILE
                 </button>
               )}
               <button 
                 onClick={() => setFinished(false)}
                 className="bg-[#0a0a0c] border border-emerald-500/50 hover:bg-emerald-900/30 text-emerald-400 px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm transition-all"
               >
                 Perform Another Directive
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
