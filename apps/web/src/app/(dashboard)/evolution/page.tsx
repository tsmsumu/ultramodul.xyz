"use strict";
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { UploadCloud, Zap, FileText, Download, CheckCircle2, AlertTriangle, ArrowRight, Dna } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, label: "step1", icon: UploadCloud, color: "blue", title: "Data Ingestor" },
  { id: 2, label: "step2", icon: Zap, color: "fuchsia", title: "Quantum Diff" },
  { id: 3, label: "step3", icon: FileText, color: "amber", title: "Smart Report" },
  { id: 4, label: "step4", icon: Download, color: "emerald", title: "Publish & Export" }
];

export default function EvolutionCenter() {
  const t = useTranslations("evolution");
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock State Data
  const [diffData, setDiffData] = useState<any>(null);
  
  const handleNextStep = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(prev => Math.min(prev + 1, 4));
      
      // Simulate data population on Step 2
      if (currentStep === 1) {
        setDiffData({ newRows: 14050, missingRows: 2310, unchangedRows: 4850020 });
      }
    }, 1500); // Simulate processing time
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* HEADER TUBE */}
      <div className="flex items-center gap-4 bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md relative overflow-hidden">
        <Dna className="w-48 h-48 absolute -right-10 opacity-5 text-blue-500 animate-pulse" />
        <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/30 relative z-10">
          <Dna className="w-8 h-8 text-blue-500" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">{t("title")}</h1>
          <p className="text-blue-400 text-sm font-mono mt-1 opacity-80">{t("desc")}</p>
        </div>
      </div>

      {/* LINEAR STEPPER WIZARD */}
      <div className="flex justify-between items-center relative px-4">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-800 -z-10 -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-emerald-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-700 ease-in-out"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        />

        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isPassed = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-3 bg-[#0a0a0c] p-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-[3px] transition-all duration-500
                ${isActive ? `border-${step.color}-500 bg-${step.color}-950 shadow-[0_0_20px_rgba(var(--tw-colors-${step.color}-500),0.3)] scale-110` : 
                  isPassed ? `border-emerald-500 bg-emerald-950/30` : 
                  `border-zinc-800 bg-zinc-900 opacity-50`}`}
              >
                {isPassed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <step.icon className={`w-6 h-6 ${isActive ? `text-${step.color}-400` : `text-zinc-600`}`} />}
              </div>
              <div className="text-center">
                <div className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                  {t(step.label)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* TUBE CONTENT ENGINE */}
      <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-8 min-h-[400px] flex flex-col justify-center relative">
         <AnimatePresence mode="wait">
            
            {/* STEP 1: UPLOAD */}
            {currentStep === 1 && (
              <motion.div key="s1" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="text-center flex flex-col items-center gap-6">
                <div className="w-full max-w-xl mx-auto border-2 border-dashed border-zinc-700 hover:border-blue-500 bg-zinc-900/50 rounded-3xl p-16 transition-colors cursor-pointer group">
                   <UploadCloud className="w-16 h-16 text-zinc-600 group-hover:text-blue-500 mx-auto mb-4 transition-colors" />
                   <h3 className="text-xl font-bold text-white mb-2">Drop New Quarterly Data</h3>
                   <p className="text-zinc-500 text-sm">Supported formats: .parquet, .csv (Max 10TB Data Engine)</p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DIFF MATRiX */}
            {currentStep === 2 && (
              <motion.div key="s2" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-white tracking-wide uppercase">Quantum Collision Results</h3>
                  <p className="text-fuchsia-400 font-mono text-sm opacity-80">DuckDB EXCEPT / INTERSECT Analyzer</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-emerald-950/20 border border-emerald-500/20 p-6 rounded-2xl flex flex-col items-center text-center">
                     <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">Inclusion (New Rows)</span>
                     <span className="text-5xl font-black text-emerald-400 font-mono">+{diffData?.newRows.toLocaleString()}</span>
                   </div>
                   <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-2xl flex flex-col items-center text-center">
                     <span className="text-red-400 text-xs font-bold uppercase tracking-widest mb-4">Friction (Missing/Deleted)</span>
                     <span className="text-5xl font-black text-red-400 font-mono">-{diffData?.missingRows.toLocaleString()}</span>
                   </div>
                   <div className="bg-blue-950/20 border border-blue-500/20 p-6 rounded-2xl flex flex-col items-center text-center">
                     <span className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Stagnant (Unchanged)</span>
                     <span className="text-5xl font-black text-blue-400 font-mono">{diffData?.unchangedRows.toLocaleString()}</span>
                   </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: REPORT BUILDER */}
            {currentStep === 3 && (
              <motion.div key="s3" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}>
                <div className="mb-6"><h3 className="text-xl font-bold text-white mb-2">Smart Report Synthesis</h3><p className="text-amber-400/80 text-sm">Select official template to auto-populate metrics.</p></div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <button className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-xl text-left hover:bg-amber-900/40 transition">
                    <span className="font-bold text-amber-400 block mb-1">Executive Summary</span>
                    <span className="text-xs text-zinc-400">High-level demographic shifts.</span>
                  </button>
                  <button className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-left hover:border-zinc-600 transition">
                    <span className="font-bold text-white block mb-1">Technical Diff Audit</span>
                  </button>
                  <button className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl text-left hover:border-zinc-600 transition">
                    <span className="font-bold text-white block mb-1">Anomaly Log Sheet</span>
                  </button>
                </div>
                <div className="bg-[#0a0a0c] border border-zinc-800 p-6 rounded-xl font-mono text-sm text-zinc-300 leading-relaxed">
                  <span className="text-amber-400"># REPORT: EXECUTIVE DEMOGRAPHY SHIFT Q2</span><br/><br/>
                  Based on the collision engine results, the system detected a massive inclusion of <strong className="text-emerald-400">+{diffData?.newRows.toLocaleString()}</strong> new identities into the region. 
                  Simultaneously, <strong className="text-red-400">{diffData?.missingRows.toLocaleString()}</strong> records were purged through natural friction rules...
                </div>
              </motion.div>
            )}

            {/* STEP 4: EXPORT */}
            {currentStep === 4 && (
              <motion.div key="s4" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }} className="text-center">
                 <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                 <h3 className="text-3xl font-black text-white tracking-widest uppercase mb-4">Pipeline Completed</h3>
                 <p className="text-zinc-400 mb-8 max-w-xl mx-auto">The quarterly data has been forged, verified, and formulated. Select the export protocol to distribute the payload.</p>
                 
                 <div className="flex justify-center gap-4">
                   <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition"><Download className="w-4 h-4"/> Extract Parquet Core</button>
                   <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm flex items-center gap-2 transition"><FileText className="w-4 h-4"/> Print PDF Report</button>
                 </div>
              </motion.div>
            )}

         </AnimatePresence>
      </div>

      {/* CONTINUATION TUBE (Next Button) */}
      {currentStep < 4 && (
        <div className="flex justify-end pt-4">
          <button 
            disabled={isProcessing}
            onClick={handleNextStep}
            className="group bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            {isProcessing ? 'Executing...' : `Continue to Phase ${currentStep + 1}`}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
