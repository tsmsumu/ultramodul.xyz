"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquareWarning, Send, AlertTriangle, ShieldCheck, CheckCircle2, Zap, Radio, LocateFixed, Activity, Crosshair, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

type Urgency = "Kritis" | "Sedang" | "Rendah";

interface ComplaintData {
  id: string;
  originalText: string;
  category: string;
  urgency: Urgency;
  location: string;
  timestamp: string;
  isResolved: boolean;
}

export default function NexusVoicePage() {
  const t = useTranslations("complaints");
  const [citizenInput, setCitizenInput] = useState("");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  
  const endOfChatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat/radar
  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [complaints]);

  // Universal NLP Engine (Blank Canvas)
  const analyzeComplaint = (text: string): Omit<ComplaintData, "id" | "timestamp" | "originalText" | "isResolved"> => {
    const lowerText = text.toLowerCase();
    
    // Default fallback
    let category = "Umum/Lainnya";
    let urgency: Urgency = "Rendah";
    let location = "Tidak Terdeteksi";

    // 1. Sentiment & Urgency Analysis (Basic Universal Tone)
    if (lowerText.match(/(bahaya|parah|mati|kecelakaan|darurat|tolong|hancur|kritis|marah)/)) urgency = "Kritis";
    else if (lowerText.match(/(buruk|jelek|rusak|lubang|bolong|macet|kotor|bau)/)) urgency = "Sedang";
    else urgency = "Rendah";

    // 2. Dynamic Category NLP Tagging (Mock Universal)
    // Dalam skenario Universal sungguhan, kamus ini di-load dari localStorage milik Admin.
    // Untuk sekarang, kita ganti ke tag generik.
    if (lowerText.match(/(sistem|aplikasi|error|bug|login|password|akses)/)) category = "Teknis/Sistem";
    else if (lowerText.match(/(uang|gaji|pembayaran|tagihan|dana|anggaran)/)) category = "Keuangan";
    else if (lowerText.match(/(sdm|personel|pegawai|staff|admin|orang)/)) category = "SDM/Personalia";
    else if (lowerText.match(/(fasilitas|gedung|ruangan|barang|aset)/)) category = "Aset Fisik";

    // 3. Location Extraction
    // Menangkap entitas lokasi menggunakan Regex sederhana (kata setelah "di")
    const locMatch = lowerText.match(/di\s+([a-zA-Z0-9_-]+)/i);
    if (locMatch && locMatch[1]) {
       location = locMatch[1].charAt(0).toUpperCase() + locMatch[1].slice(1);
    }

    return { category, urgency, location };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenInput.trim()) return;

    setIsTransmitting(true);
    
    // Simulate network and AI processing delay
    setTimeout(() => {
      const analysis = analyzeComplaint(citizenInput);
      const newComplaint: ComplaintData = {
        id: `NX-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        originalText: citizenInput,
        timestamp: new Date().toLocaleTimeString(),
        isResolved: false,
        ...analysis
      };

      setComplaints(prev => [newComplaint, ...prev]);
      setCitizenInput("");
      setIsTransmitting(false);
    }, 1500);
  };

  const resolveComplaint = (id: string) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, isResolved: true } : c));
  };

  // KANBAN GROUPING
  const criticals = complaints.filter(c => c.urgency === "Kritis" && !c.isResolved);
  const moderates = complaints.filter(c => (c.urgency === "Sedang" || c.urgency === "Rendah") && !c.isResolved);
  const resolved = complaints.filter(c => c.isResolved);

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col font-sans pb-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-black/80 border border-white/5 p-6 rounded-3xl shadow-2xl relative overflow-hidden mb-6 shrink-0">
         <div className="absolute -left-20 -top-20 bg-indigo-500/10 w-64 h-64 rounded-full blur-[60px]" />
         <div className="absolute -right-20 -bottom-20 bg-emerald-500/10 w-64 h-64 rounded-full blur-[60px]" />
         
         <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-linear-to-br from-indigo-900/40 to-black border border-indigo-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <Radio className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Nexus Voice</h1>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest border border-indigo-500/30 px-2 py-0.5 rounded bg-indigo-950/30">
                   Smart Triage Center
                 </span>
                 <span className="text-xs text-zinc-500 font-mono">Real-Time NLP Complaint Radar</span>
              </div>
            </div>
         </div>
         
         <div className="hidden lg:flex items-center gap-6 relative z-10">
            <div className="text-right">
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Total Sinyal Aktif</div>
              <div className="text-2xl font-black text-white">{criticals.length + moderates.length}</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-right">
              <div className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest">Telah Diselesaikan</div>
              <div className="text-2xl font-black text-emerald-400">{resolved.length}</div>
            </div>
         </div>
      </div>

      {/* DUAL SCREEN SPLIT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
         
         {/* ======================================================== */}
         {/* LEFT SCREEN: CITIZEN SIMULATOR (INPUT)                   */}
         {/* ======================================================== */}
         <div className="col-span-1 lg:col-span-4 bg-zinc-950/60 border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
            {/* Background Map Pattern to imply "Citizen Location" */}
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
               <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquareWarning className="w-5 h-5 text-indigo-400" /> Simulator Warga
               </h2>
               <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2 py-1 rounded font-mono">{t("citizenApp")}</span>
            </div>

            <div className="flex-1 flex flex-col justify-end relative z-10 mb-6 bg-black/40 border border-white/5 rounded-2xl p-4 overflow-y-auto custom-scrollbar">
               <div className="text-center text-xs text-zinc-600 font-mono mb-4">{t("sessionStart")}</div>
               <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-2xl rounded-tl-sm p-4 text-sm text-indigo-200/80 mb-4 max-w-[90%]">
                  {t("welcomeMsg")}
               </div>

               {/* Mock Chat History based on complaints */}
               {[...complaints].reverse().map(c => (
                 <div key={c.id} className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl rounded-tr-sm p-4 text-sm text-zinc-300 mb-4 self-end max-w-[90%]">
                    {c.originalText}
                    <div className="text-[9px] text-zinc-500 font-mono mt-2 text-right">{c.timestamp} • {t("sent")}</div>
                 </div>
               ))}
               
               {isTransmitting && (
                 <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl rounded-tr-sm p-4 text-sm text-zinc-300 mb-4 self-end max-w-[90%] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400 animate-spin" /> <span className="text-xs text-zinc-500 font-mono">{t("sending")}</span>
                 </div>
               )}
               <div ref={endOfChatRef} />
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 shrink-0">
               <textarea 
                 value={citizenInput}
                 onChange={(e) => setCitizenInput(e.target.value)}
                 disabled={isTransmitting}
                 placeholder={t("placeholder")}
                 className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 pr-14 text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600 font-light resize-none h-24"
               />
               <button 
                 type="submit" 
                 title={t('sent')}
                 disabled={isTransmitting || !citizenInput.trim()} 
                 className="absolute right-3 bottom-3 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg"
               >
                  <Send className="w-4 h-4" />
               </button>
            </form>
         </div>

         {/* ======================================================== */}
         {/* RIGHT SCREEN: ADMIN RADAR & TRIAGE (OUTPUT)              */}
         {/* ======================================================== */}
         <div className="col-span-1 lg:col-span-8 bg-zinc-950/80 border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
            {/* Grid background for Radar vibe */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[30px_30px]" />
            
            <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
               <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-red-500" /> Live AI Radar & Triage
               </h2>
               <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-900/50 rounded-full">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">NLP Engine: Online</span>
               </div>
            </div>

            {/* TRIAGE BOARD (KANBAN) */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 min-h-0">
               
               {/* KOLOM KRITIS */}
               <div className="bg-black/60 border border-red-900/30 rounded-2xl flex flex-col overflow-hidden">
                  <div className="bg-red-950/40 p-3 border-b border-red-900/50 flex justify-between items-center shrink-0">
                     <span className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Sinyal Kritis</span>
                     <span className="text-xs font-black bg-red-900/50 text-red-200 px-2 py-0.5 rounded-full">{criticals.length}</span>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                     <AnimatePresence>
                        {criticals.map(c => (
                          <motion.div key={c.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }} className="bg-zinc-900/80 border border-red-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(239,68,68,0.05)]">
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-zinc-500">{c.id}</span>
                                <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase border border-red-900/50">URGENT</span>
                             </div>
                             <p className="text-sm text-white mb-4 line-clamp-3">&quot;{c.originalText}&quot;</p>
                             
                             <div className="flex flex-wrap gap-2 mb-4">
                                <span className="text-[9px] bg-blue-950/50 text-blue-300 px-2 py-1 rounded flex items-center gap-1 border border-blue-900/50"><ShieldCheck className="w-3 h-3"/> {c.category}</span>
                                <span className="text-[9px] bg-amber-950/50 text-amber-300 px-2 py-1 rounded flex items-center gap-1 border border-amber-900/50"><LocateFixed className="w-3 h-3"/> {c.location}</span>
                             </div>

                             <button onClick={() => resolveComplaint(c.id)} className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-1">
                               Teruskan & Selesaikan <ChevronRight className="w-3 h-3"/>
                             </button>
                          </motion.div>
                        ))}
                     </AnimatePresence>
                     {criticals.length === 0 && <div className="text-center text-xs text-zinc-600 mt-10 font-mono">Radar bersih dari sinyal kritis.</div>}
                  </div>
               </div>

               {/* KOLOM SEDANG/RENDAH */}
               <div className="bg-black/60 border border-amber-900/30 rounded-2xl flex flex-col overflow-hidden">
                  <div className="bg-amber-950/40 p-3 border-b border-amber-900/50 flex justify-between items-center shrink-0">
                     <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2"><Zap className="w-4 h-4"/> Sinyal Normal</span>
                     <span className="text-xs font-black bg-amber-900/50 text-amber-200 px-2 py-0.5 rounded-full">{moderates.length}</span>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                     <AnimatePresence>
                        {moderates.map(c => (
                          <motion.div key={c.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.9 }} className="bg-zinc-900/80 border border-amber-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
                             <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-zinc-500">{c.id}</span>
                                <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase border border-amber-900/50">NORMAL</span>
                             </div>
                             <p className="text-sm text-zinc-300 mb-4 line-clamp-3">&quot;{c.originalText}&quot;</p>
                             
                             <div className="flex flex-wrap gap-2 mb-4">
                                <span className="text-[9px] bg-blue-950/50 text-blue-300 px-2 py-1 rounded flex items-center gap-1 border border-blue-900/50"><ShieldCheck className="w-3 h-3"/> {c.category}</span>
                                <span className="text-[9px] bg-amber-950/50 text-amber-300 px-2 py-1 rounded flex items-center gap-1 border border-amber-900/50"><LocateFixed className="w-3 h-3"/> {c.location}</span>
                             </div>

                             <button onClick={() => resolveComplaint(c.id)} className="w-full py-2 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-1">
                               Proses Laporan <ChevronRight className="w-3 h-3"/>
                             </button>
                          </motion.div>
                        ))}
                     </AnimatePresence>
                     {moderates.length === 0 && <div className="text-center text-xs text-zinc-600 mt-10 font-mono">Radar bersih dari sinyal normal.</div>}
                  </div>
               </div>

               {/* KOLOM SELESAI */}
               <div className="bg-black/60 border border-emerald-900/30 rounded-2xl flex flex-col overflow-hidden">
                  <div className="bg-emerald-950/40 p-3 border-b border-emerald-900/50 flex justify-between items-center shrink-0">
                     <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Terdisposisi</span>
                     <span className="text-xs font-black bg-emerald-900/50 text-emerald-200 px-2 py-0.5 rounded-full">{resolved.length}</span>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3">
                     <AnimatePresence>
                        {resolved.map(c => (
                          <motion.div key={c.id} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-4 opacity-70">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-mono text-zinc-500">{c.id}</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                             </div>
                             <p className="text-xs text-zinc-500 line-clamp-1 italic">&quot;{c.originalText}&quot;</p>
                             <div className="mt-2 text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Terkirim ke Dinas {c.category}</div>
                          </motion.div>
                        ))}
                     </AnimatePresence>
                     {resolved.length === 0 && <div className="text-center text-xs text-zinc-600 mt-10 font-mono">Belum ada laporan diselesaikan.</div>}
                  </div>
               </div>

            </div>
         </div>

      </div>
    </div>
  );
}
