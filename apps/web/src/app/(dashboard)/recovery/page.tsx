"use client";

import { useEffect, useState } from "react";
import { getTimelineHologram, attachMemoryNote, executeQuantumRollback } from "@/app/actions/time-machine";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ShieldAlert, Download, UploadCloud, RotateCcw, AlertTriangle, Save, Loader2, X } from "lucide-react";

export default function NexusRecoveryPage() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States Resolusi Berbahaya
  const [rollbackTarget, setRollbackTarget] = useState<string | null>(null);
  const [rollbackConfirm, setRollbackConfirm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // States Upload External
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    setLoading(true);
    const res = await getTimelineHologram();
    if (res.success) {
      setTimeline(res.payload || []);
    }
    setLoading(false);
  };

  const handleSaveNote = async (hash: string) => {
    setIsProcessing(true);
    await attachMemoryNote(hash, noteDraft);
    setEditingNoteId(null);
    setNoteDraft("");
    await loadTimeline();
    setIsProcessing(false);
  };

  const handleRollback = async () => {
    if (rollbackConfirm !== "SAYA YAKIN") return;
    setIsProcessing(true);
    const res = await executeQuantumRollback(rollbackTarget!);
    if (res.success) {
      alert("Quantum Leap Successful! The machine has been aligned with the past.");
      setRollbackTarget(null);
      setRollbackConfirm("");
      await loadTimeline();
    } else {
      alert("Failed to Switch Dimensions: " + res.error);
    }
    setIsProcessing(false);
  };

  const triggerDownload = (hash: string) => {
    // Navigasi langsung ke raw download API Route
    window.location.href = `/api/nexus-snapshot/${hash}`;
  };

  const handleUploadBackup = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    try {
      const resp = await fetch("/api/nexus-snapshot/upload", {
        method: "POST",
        body: formData,
      });
      if (resp.ok) {
        alert("External Quantum Restoration Complete! The machine has been restored using your External File.");
        setUploadOpen(false);
        setSelectedFile(null);
        await loadTimeline();
      } else {
        alert("An error occurred while attempting to extract the External ZIP file.");
      }
    } catch(e) {
      alert("Failed to contact restoration base.");
    }
    setIsProcessing(false);
  };

  if (loading) {
     return <div className="p-10 flex text-emerald-500 justify-center flex-col items-center gap-4"><Loader2 className="w-10 h-10 animate-spin" /><span className="font-mono tracking-widest text-sm uppercase">Connecting Timeline...</span></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Utama Keamanan Tingkat Tinggi */}
      <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 md:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Clock className="w-48 h-48 text-emerald-500 animate-[spin_60s_linear_infinite]" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-emerald-500 text-black rounded-lg">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-emerald-400 tracking-widest uppercase">Nexus Time-Machine</h1>
            </div>
            <p className="text-gray-400 font-mono tracking-wider text-sm max-w-xl">
              Non-Destructive Time Travel Navigation Facility. Rollback to any history point without losing the main timeline. All actions are completely reversible.
            </p>
          </div>

          <button 
            onClick={() => setUploadOpen(true)}
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest text-sm rounded-xl transition shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]"
          >
             <UploadCloud className="w-5 h-5" /> Upload Custom Snapshot
          </button>
        </div>
      </div>

      {/* Garis Waktu Vertikal */}
      <div className="relative border-l-2 border-emerald-900/40 ml-4 md:ml-8 pl-8 py-4 space-y-12">
         {timeline.map((point, index) => {
           const isLatest = index === 0;
           return (
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.05 }}
               key={point.hash} 
               className="relative"
             >
               {/* Titik Garis Waktu */}
               <div className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-black ${isLatest ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]' : 'bg-gray-600'}`}></div>

               <div className={`p-5 rounded-2xl border transition-all ${isLatest ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-gray-900/40 border-gray-800/50 hover:bg-gray-800/60'}`}>
                 <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                       <div className="flex items-center gap-3">
                         <span className="font-mono text-xs px-2 py-1 bg-black rounded text-gray-400">{point.hash.substring(0, 7)}</span>
                         <span className="text-xs text-gray-500 font-mono tracking-widest">{new Date(point.date).toLocaleString()}</span>
                         {isLatest && <span className="px-2 py-0.5 text-[10px] font-black uppercase text-black bg-emerald-500 rounded tracking-widest">CURRENT STATE (HEAD)</span>}
                       </div>
                       
                       <h3 className="font-medium text-lg leading-snug">{point.message}</h3>

                       {/* Area Memory Notes (Sticky Note) */}
                       {point.note ? (
                         <div className="mt-4 p-4 bg-yellow-950/20 border border-yellow-900/50 rounded-lg">
                           <div className="flex items-center justify-between mb-2">
                             <span className="text-[10px] font-black tracking-widest text-yellow-600 uppercase">Immortal Note</span>
                             <button onClick={() => { setEditingNoteId(point.hash); setNoteDraft(point.note); }} className="text-[10px] text-yellow-600 hover:text-yellow-400 tracking-widest uppercase underline">Edit</button>
                           </div>
                           <p className="text-sm text-yellow-200/80 font-mono leading-relaxed">{point.note}</p>
                         </div>
                       ) : (
                         editingNoteId !== point.hash && (
                           <button onClick={() => setEditingNoteId(point.hash)} className="mt-2 text-xs font-mono tracking-widest uppercase text-emerald-600 hover:text-emerald-400">+ Attach Memory Note</button>
                         )
                       )}

                       {/* Input Form Note */}
                       {editingNoteId === point.hash && (
                         <div className="mt-4 flex gap-2">
                           <textarea 
                             value={noteDraft}
                             onChange={(e) => setNoteDraft(e.target.value)}
                             placeholder="Example: This is a highly stable version before Module 3 installation..."
                             className="w-full h-20 bg-black/50 border border-emerald-900/50 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
                           ></textarea>
                           <div className="flex flex-col gap-2">
                             <button disabled={isProcessing} onClick={() => handleSaveNote(point.hash)} className="p-3 bg-emerald-600 hover:bg-emerald-500 text-black rounded-lg transition disabled:opacity-50"><Save className="w-4 h-4"/></button>
                             <button onClick={() => { setEditingNoteId(null); setNoteDraft(""); }} className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"><X className="w-4 h-4"/></button>
                           </div>
                         </div>
                       )}
                    </div>

                    {/* Tombol Resolusi Ekstrem */}
                    <div className="flex sm:flex-col gap-2 shrink-0 border-t border-gray-800 pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-4">
                       <button onClick={() => triggerDownload(point.hash)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-black uppercase tracking-widest rounded-lg transition border border-gray-700">
                         <Download className="w-4 h-4" /> WRAP (.ZIP)
                       </button>
                       {!isLatest && (
                         <button onClick={() => setRollbackTarget(point.hash)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-950/30 hover:bg-red-900 border border-red-900/50 text-red-500 hover:text-red-300 text-xs font-black uppercase tracking-widest rounded-lg transition">
                           <ShieldAlert className="w-4 h-4" /> ROLLBACK TO HERE
                         </button>
                       )}
                    </div>
                 </div>
               </div>
             </motion.div>
           );
         })}
      </div>

      {/* MODAL: KONFIRMASI ROLLBACK QUANTUM */}
      <AnimatePresence>
        {rollbackTarget && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
             <motion.div initial={{scale: 0.9}} animate={{scale: 1}} exit={{scale: 0.9}} className="bg-zinc-950 border border-red-900/50 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_-10px_rgba(220,38,38,0.2)]">
               <div className="flex items-center gap-3 text-red-500 mb-4">
                 <AlertTriangle className="w-8 h-8"/>
                 <h2 className="text-xl font-black uppercase tracking-widest">CODE DEATH PENALTY AUTHORIZATION</h2>
               </div>
               <p className="text-gray-400 text-sm leading-relaxed mb-6">
                 You are about to alter the space-time continuum of the Server. All configurations will revert exactly to Hash <span className="font-mono text-emerald-500">{rollbackTarget.substring(0,7)}</span>. Type <span className="font-bold text-red-500 select-all">I AM SURE</span> in the matrix below to proceed.
               </p>
               <input 
                 type="text" 
                 placeholder="Type your confirmation..." 
                 value={rollbackConfirm}
                 onChange={e => setRollbackConfirm(e.target.value)}
                 className="w-full bg-black border border-red-900/50 rounded-xl p-4 text-center font-black tracking-widest text-red-500 focus:outline-none focus:border-red-500 mb-4 uppercase placeholder:text-gray-800"
               />
               <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                 <button disabled={isProcessing} onClick={() => {setRollbackTarget(null); setRollbackConfirm("")}} className="px-6 py-3 font-bold text-sm tracking-widest uppercase text-gray-500 hover:text-white transition">Tremble (Cancel)</button>
                 <button disabled={rollbackConfirm !== "I AM SURE" || isProcessing} onClick={handleRollback} className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm tracking-widest uppercase transition disabled:opacity-20 shadow-[0_0_20px_-5px_rgba(220,38,38,0.6)]">
                   {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                   QUANTUM EXECUTION
                 </button>
               </div>
             </motion.div>
          </motion.div>
        )}

        {/* MODAL: UPLOAD EKSTERNAL SNAPSHOT */}
        {uploadOpen && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
             <motion.div initial={{y: 20}} animate={{y: 0}} exit={{y: 20}} className="bg-zinc-950 border border-amber-900/50 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_-10px_rgba(245,158,11,0.2)]">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black uppercase tracking-widest text-amber-500 flex items-center gap-2"><UploadCloud className="w-6 h-6"/> Manual Synchronization</h2>
                 <button onClick={() => setUploadOpen(false)} className="text-gray-500 hover:text-white"><AlertTriangle className="w-5 h-5 text-transparent"/></button>
               </div>
               
               <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                 God-tier feature. Select a bundle archive (.ZIP) previously downloaded from this system. The VPS will be entirely overwritten and resurrected with the contents of this ZIP.
               </p>

               <div className="border-2 border-dashed border-amber-900/50 rounded-xl p-8 mb-6 flex flex-col items-center justify-center gap-4 hover:bg-amber-950/10 transition cursor-pointer" onClick={() => document.getElementById('snapshot-upload')?.click()}>
                 <div className="p-4 bg-amber-950/40 rounded-full text-amber-500"><Download className="w-8 h-8 rotate-180" /></div>
                 <div className="text-center">
                   <p className="font-bold text-gray-300">Select Backup Crown (.ZIP)</p>
                   <p className="text-xs text-gray-600 mt-1">{selectedFile?.name || 'Maximum size determined by Server RAM'}</p>
                 </div>
                 <input type="file" id="snapshot-upload" className="hidden" accept=".zip" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
               </div>

               <div className="flex justify-end gap-3 border-t border-gray-800 pt-6">
                 <button disabled={isProcessing} onClick={() => setUploadOpen(false)} className="px-6 py-3 font-bold text-sm tracking-widest uppercase text-gray-500 hover:text-white transition">Cancel Broadcast</button>
                 <button disabled={!selectedFile || isProcessing} onClick={handleUploadBackup} className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black tracking-widest uppercase transition disabled:opacity-50">
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "DETONATE ZIP FILE"}
                 </button>
               </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
