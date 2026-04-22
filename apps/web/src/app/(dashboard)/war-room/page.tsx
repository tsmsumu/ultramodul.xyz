"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp, ShieldCheck, Zap, SlidersHorizontal, Mic, Search, Activity, Crosshair, Wrench, Plus, Trash2, Edit2, Save, X, FolderOpen, ArrowLeft, MoreVertical, LayoutGrid, HeartPulse, Briefcase, GraduationCap, Plane, FileText, ChevronRight } from "lucide-react";
import ReactECharts from 'echarts-for-react';
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES FOR LEGO ARCHITECT ---
interface LegoSlider {
  id: string;
  label: string;
  unit: string;
  state: number;
  step: number;
  max: number;
  color: string;
  weightY1: number;
  weightY2: number;
}

interface LegoReport {
  id: string;
  title: string;
  desc: string;
  color: string;
}

interface LegoChart {
  y1Label: string;
  y2Label: string;
  y1Base: number[];
  y2Base: number[];
}

interface WarRoomConfig {
  folderId: string;
  folderName: string;
  folderColor: string; // red, emerald, blue, amber, purple, etc
  folderIcon: string;
  reports: LegoReport[];
  sliders: LegoSlider[];
  chart: LegoChart;
}

// Default Icons Mapping
const ICONS: Record<string, any> = {
  Briefcase, HeartPulse, GraduationCap, Plane, Activity, ShieldCheck, Zap, AlertTriangle
};

const COLORS = ["amber", "emerald", "blue", "red", "purple", "indigo", "rose", "cyan"];

export default function WarRoomVaultPage() {
  const [isClient, setIsClient] = useState(false);
  const [vault, setVault] = useState<WarRoomConfig[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  
  // Simulated IAM Role Toggle (For Demo Purposes)
  const [isAdminRole, setIsAdminRole] = useState(true); 

  // Oracle States
  const [isTyping, setIsTyping] = useState(false);
  const [oracleQuery, setOracleQuery] = useState("");
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);

  // LOAD FROM LOCAL STORAGE
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('warRoomVault_v2');
    if (saved) {
      try {
        setVault(JSON.parse(saved));
      } catch (e) {
        setVault([]);
      }
    } else {
      // Empty Vault by default (Universal Blank Canvas)
      setVault([]);
    }
  }, []);

  // SAVE TO LOCAL STORAGE
  const saveVault = (newVault: WarRoomConfig[]) => {
    setVault(newVault);
    localStorage.setItem('warRoomVault_v2', JSON.stringify(newVault));
  };

  // --- VAULT / LOBBY ACTIONS ---
  const createNewFolder = () => {
    const newFolder: WarRoomConfig = {
      folderId: `f_${Date.now()}`,
      folderName: "Map Kebijakan Baru",
      folderColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      folderIcon: "Briefcase",
      reports: [
        { id: "r1", color: "blue", title: "Laporan 1", desc: "Ketuk mode obeng untuk mengedit..." },
        { id: "r2", color: "blue", title: "Laporan 2", desc: "Ketuk mode obeng untuk mengedit..." },
        { id: "r3", color: "blue", title: "Laporan 3", desc: "Ketuk mode obeng untuk mengedit..." }
      ],
      sliders: [],
      chart: {
        y1Label: "Sumbu Y1", y2Label: "Sumbu Y2",
        y1Base: [10, 10, 10, 10, 10, 10], y2Base: [5, 5, 5, 5, 5, 5]
      }
    };
    saveVault([...vault, newFolder]);
    setActiveFolderId(newFolder.folderId);
    setIsBuilderMode(true); // Auto enter builder
  };

  const deleteFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("Hancurkan Map ini beserta seluruh data di dalamnya?")) {
      saveVault(vault.filter(f => f.folderId !== id));
      if (activeFolderId === id) setActiveFolderId(null);
    }
  };

  // --- ACTIVE FOLDER HELPERS ---
  const activeConfig = vault.find(f => f.folderId === activeFolderId);

  const saveActiveConfig = (updatedConfig: WarRoomConfig) => {
    const newVault = vault.map(f => f.folderId === updatedConfig.folderId ? updatedConfig : f);
    saveVault(newVault);
  };

  // --- DYNAMIC CALCULATION ---
  const calculateProjections = (cfg: WarRoomConfig) => {
    const y1Result = cfg.chart.y1Base.map((base, i) => {
      let mod = 0;
      cfg.sliders.forEach(s => {
        mod += (s.state / 100) * s.weightY1 * (i / 5);
      });
      return (base + mod).toFixed(2);
    });

    const y2Result = cfg.chart.y2Base.map((base, i) => {
      let mod = 0;
      cfg.sliders.forEach(s => {
        mod += (s.state / 100) * s.weightY2 * (i / 5);
      });
      return (base + mod).toFixed(2);
    });

    return { y1Result, y2Result };
  };

  // --- LEGO ARCHITECT ACTIONS ---
  const handleSliderChange = (id: string, newVal: number) => {
    if (isBuilderMode || !activeConfig) return;
    const newSliders = activeConfig.sliders.map(s => s.id === id ? { ...s, state: newVal } : s);
    saveActiveConfig({ ...activeConfig, sliders: newSliders });
  };

  const addSlider = () => {
    if(!activeConfig) return;
    const newSlider: LegoSlider = {
      id: `s_${Date.now()}`, label: "Tuas Baru", unit: "%", state: 0, step: 5, max: 50, color: "blue", weightY1: 0, weightY2: 0
    };
    saveActiveConfig({ ...activeConfig, sliders: [...activeConfig.sliders, newSlider] });
  };

  const removeSlider = (id: string) => {
    if(!activeConfig) return;
    saveActiveConfig({ ...activeConfig, sliders: activeConfig.sliders.filter(s => s.id !== id) });
  };

  const updateSliderProp = (id: string, prop: keyof LegoSlider, val: any) => {
    if(!activeConfig) return;
    const newSliders = activeConfig.sliders.map(s => s.id === id ? { ...s, [prop]: val } : s);
    saveActiveConfig({ ...activeConfig, sliders: newSliders });
  };

  const updateReport = (id: string, prop: keyof LegoReport, val: any) => {
    if(!activeConfig) return;
    const newReports = activeConfig.reports.map(r => r.id === id ? { ...r, [prop]: val } : r);
    saveActiveConfig({ ...activeConfig, reports: newReports });
  };

  const updateChartLabel = (prop: 'y1Label' | 'y2Label', val: string) => {
    if(!activeConfig) return;
    saveActiveConfig({ ...activeConfig, chart: { ...activeConfig.chart, [prop]: val } });
  };

  const updateFolderMeta = (prop: 'folderName' | 'folderColor' | 'folderIcon', val: string) => {
    if(!activeConfig) return;
    saveActiveConfig({ ...activeConfig, [prop]: val });
  };

  const handleOracleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleQuery.trim() || !activeConfig) return;
    setIsTyping(true);
    setOracleResponse(null);
    setTimeout(() => {
      setOracleResponse(`Berdasarkan pengaturan matriks di dalam Map ${activeConfig.folderName}, tren menunjukkan korelasi kuat sesuai rumusan yang dirakit.`);
      setIsTyping(false);
    }, 2500);
  };

  if (!isClient) return null;

  // ==========================================
  // VIEW 1: LOBBY ARSIP (NEXUS VAULT)
  // ==========================================
  if (!activeFolderId) {
    return (
      <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col font-sans pb-10">
         {/* VAULT HEADER */}
         <div className="flex justify-between items-center bg-black/80 border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden shrink-0 mb-10">
           <div className="absolute -left-20 -top-20 w-96 h-96 bg-zinc-800/50 rounded-full blur-[100px]" />
           
           <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-zinc-900/80 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                <FolderOpen className="w-10 h-10 text-zinc-300" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-1">Nexus Vault</h1>
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-bold uppercase tracking-widest border border-zinc-700/50 text-zinc-400 bg-zinc-900/50 px-2 py-0.5 rounded">
                     Filing Cabinet & Archive Room
                   </span>
                   <span className="text-xs text-zinc-500 font-mono">PUM Universal Storage</span>
                </div>
              </div>
           </div>

           <div className="flex flex-col items-end gap-4 relative z-10">
              {/* MOCK IAM TOGGLE */}
              <button 
                onClick={() => setIsAdminRole(!isAdminRole)}
                className={`px-3 py-1 rounded border text-[9px] uppercase font-bold tracking-widest transition-colors ${isAdminRole ? 'border-indigo-500/50 text-indigo-400 bg-indigo-950/30' : 'border-zinc-700 text-zinc-500 bg-zinc-900'}`}
              >
                Mock IAM: {isAdminRole ? '[CREATE/EDIT]' : '[VIEW ONLY]'}
              </button>

              {isAdminRole && (
                <button onClick={createNewFolder} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-105">
                   <Plus className="w-5 h-5" /> Buat Map Baru
                </button>
              )}
           </div>
         </div>

         {/* FOLDERS GRID (KERTAS MAP) */}
         {vault.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950/50 border border-dashed border-zinc-800 rounded-3xl p-10 text-center">
               <FileText className="w-24 h-24 text-zinc-800 mb-6" />
               <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-widest mb-2">Laci Kabinet Kosong</h3>
               <p className="text-sm text-zinc-600 max-w-md">Belum ada Map Kebijakan yang dibuat. PUM bersifat Blank Canvas. Silakan buat Map baru untuk mensimulasikan skenario tertentu.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               <AnimatePresence>
                 {vault.map((folder, i) => {
                    const FIcon = ICONS[folder.folderIcon] || FolderOpen;
                    return (
                      <motion.div 
                        key={folder.folderId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setActiveFolderId(folder.folderId)}
                        className={`relative cursor-pointer group`}
                      >
                         {/* MANILA FOLDER DESIGN (TAB) */}
                         <div className={`w-1/2 h-8 bg-${folder.folderColor}-900/80 rounded-t-2xl border-t border-l border-r border-${folder.folderColor}-500/30 relative z-0 ml-4 group-hover:-translate-y-2 transition-transform duration-300 flex items-center px-4`}>
                           <span className={`text-[9px] font-bold uppercase tracking-widest text-${folder.folderColor}-300`}>NEXUS MAP</span>
                         </div>
                         
                         {/* MANILA FOLDER DESIGN (BODY) */}
                         <div className={`bg-zinc-900 border border-${folder.folderColor}-500/30 rounded-3xl rounded-tl-none p-6 relative z-10 shadow-2xl group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden`}>
                            {/* Glass Reflection */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="flex justify-between items-start mb-6">
                               <div className={`w-12 h-12 bg-${folder.folderColor}-950 border border-${folder.folderColor}-500/50 rounded-xl flex items-center justify-center shadow-inner`}>
                                 <FIcon className={`w-6 h-6 text-${folder.folderColor}-400`} />
                               </div>
                               {isAdminRole && (
                                 <button onClick={(e) => deleteFolder(folder.folderId, e)} className="w-8 h-8 bg-black/50 hover:bg-red-900/80 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors">
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                               )}
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{folder.folderName}</h3>
                            
                            <div className="flex gap-4 mt-6 border-t border-white/5 pt-4">
                               <div className="flex items-center gap-2">
                                 <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
                                 <span className="text-[10px] text-zinc-400 font-mono">{folder.sliders.length} Tuas</span>
                               </div>
                               <div className="flex items-center gap-2">
                                 <LayoutGrid className="w-3 h-3 text-zinc-500" />
                                 <span className="text-[10px] text-zinc-400 font-mono">Arsip Tersimpan</span>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )
                 })}
               </AnimatePresence>
            </div>
         )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: WAR ROOM DASHBOARD (INSIDE FOLDER)
  // ==========================================
  if (!activeConfig) return null; // Safety
  const { y1Result, y2Result } = calculateProjections(activeConfig);
  const CIcon = ICONS[activeConfig.folderIcon] || FolderOpen;

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col gap-6 pb-10 font-sans">
      
      {/* HEADER VVIP & LEGO BUILDER TOGGLE */}
      <div className={`flex justify-between items-center bg-black/80 border p-6 rounded-3xl shadow-2xl relative overflow-hidden shrink-0 transition-colors duration-500 ${isBuilderMode ? 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)]' : `border-${activeConfig.folderColor}-500/20`}`}>
         <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[60px] bg-${activeConfig.folderColor}-500/10`} />
         
         <div className="flex items-center gap-6 relative z-10">
            <button 
              onClick={() => {
                setActiveFolderId(null); 
                setIsBuilderMode(false);
                setOracleResponse(null);
                setOracleQuery("");
              }}
              className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
              title="Kembali ke Brankas"
            >
               <ArrowLeft className="w-5 h-5" />
            </button>

            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${isBuilderMode ? 'bg-indigo-900/80 border-indigo-500 text-indigo-400' : `bg-${activeConfig.folderColor}-900/80 border-${activeConfig.folderColor}-500/30 text-${activeConfig.folderColor}-400`}`}>
              {isBuilderMode ? <Wrench className="w-8 h-8" /> : <CIcon className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-3xl font-black text-white tracking-widest uppercase">Nexus War Room</h1>
                 {isBuilderMode && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest animate-pulse">Lego Architect Active</span>}
              </div>
              <div className="flex items-center gap-3">
                 <span className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded border-${activeConfig.folderColor}-500/30 text-${activeConfig.folderColor}-400 bg-${activeConfig.folderColor}-950/30`}>
                   Map Terbuka: {activeConfig.folderName}
                 </span>
                 
                 {isBuilderMode && (
                    <div className="flex items-center gap-2">
                       <input 
                         value={activeConfig.folderName} 
                         onChange={(e) => updateFolderMeta('folderName', e.target.value)}
                         className="bg-zinc-900 text-indigo-300 text-xs font-bold border border-indigo-500/50 rounded px-2 py-1 outline-none w-48"
                       />
                       <select 
                         value={activeConfig.folderColor} 
                         onChange={(e) => updateFolderMeta('folderColor', e.target.value)}
                         className="bg-zinc-900 text-indigo-300 text-xs border border-indigo-500/50 rounded px-2 py-1 outline-none"
                       >
                         {COLORS.map(c => <option key={c} value={c}>Warna {c}</option>)}
                       </select>
                       <select 
                         value={activeConfig.folderIcon} 
                         onChange={(e) => updateFolderMeta('folderIcon', e.target.value)}
                         className="bg-zinc-900 text-indigo-300 text-xs border border-indigo-500/50 rounded px-2 py-1 outline-none"
                       >
                         {Object.keys(ICONS).map(k => <option key={k} value={k}>Ikon {k}</option>)}
                       </select>
                    </div>
                 )}
              </div>
            </div>
         </div>
         
         <div className="flex items-center gap-4 relative z-10">
            {isAdminRole && (
              <button 
                onClick={() => setIsBuilderMode(!isBuilderMode)}
                className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${isBuilderMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-white/10'}`}
              >
                {isBuilderMode ? <><Save className="w-4 h-4"/> Selesai Merakit</> : <><Wrench className="w-4 h-4"/> Mode Architect</>}
              </button>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* KIRI: EXECUTIVE BRIEF & OMNI-ORACLE */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
           
           {/* EXECUTIVE BRIEFING */}
           <div className={`bg-zinc-950/60 border rounded-3xl p-8 shadow-2xl relative flex flex-col shrink-0 ${isBuilderMode ? 'border-indigo-500/50 border-dashed' : 'border-white/5'}`}>
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                 <Zap className={`w-5 h-5 text-${activeConfig.folderColor}-500`} /> Laporan Intelijen Terkini
              </h2>
              
              <div className="space-y-4">
                 {activeConfig.reports.map((report) => (
                    <div key={report.id} className={`bg-black/40 border border-white/10 p-4 rounded-2xl flex gap-4 items-start relative ${isBuilderMode ? 'hover:border-indigo-500/50' : ''}`}>
                       <div className="mt-1"><AlertTriangle className={`w-5 h-5 text-${report.color}-500`} /></div>
                       <div className="flex-1">
                         {isBuilderMode ? (
                           <div className="space-y-2">
                             <input 
                               value={report.title} 
                               onChange={(e) => updateReport(report.id, 'title', e.target.value)}
                               className="w-full bg-zinc-900 border border-indigo-500/30 text-indigo-300 text-sm font-bold px-2 py-1 rounded outline-none"
                             />
                             <textarea 
                               value={report.desc} 
                               onChange={(e) => updateReport(report.id, 'desc', e.target.value)}
                               className="w-full bg-zinc-900 border border-indigo-500/30 text-zinc-300 text-xs px-2 py-1 rounded outline-none resize-none h-16"
                             />
                             <div className="flex gap-2 items-center pt-1">
                               <span className="text-[9px] text-zinc-500 uppercase">Warna Ikon:</span>
                               <select value={report.color} onChange={(e) => updateReport(report.id, 'color', e.target.value)} className="bg-zinc-900 text-xs text-white border border-white/20 rounded outline-none">
                                 <option value="red">Merah</option><option value="emerald">Hijau</option><option value="blue">Biru</option><option value="amber">Kuning</option>
                               </select>
                             </div>
                           </div>
                         ) : (
                           <>
                             <h4 className={`text-sm font-bold text-${report.color}-400 mb-1`}>{report.title}</h4>
                             <p className="text-xs text-zinc-400 leading-relaxed">{report.desc}</p>
                           </>
                         )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* OMNI-ORACLE CHAT */}
           <div className={`bg-black border rounded-3xl p-8 shadow-2xl flex-1 flex flex-col min-h-[300px] ${isBuilderMode ? 'opacity-50 pointer-events-none border-dashed border-white/10' : 'border-white/10'}`}>
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6 shrink-0">
                 <Mic className={`w-5 h-5 text-${activeConfig.folderColor}-500`} /> Omni-Oracle AI
              </h2>
              
              <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar pr-2 flex flex-col justify-end">
                 {!oracleResponse && !isTyping ? (
                    <div className="text-center text-zinc-600 font-light text-lg mb-8">
                      "Sistem Oracle aktif. Saya menganalisis map <strong className="text-white">{activeConfig.folderName}</strong>. Berikan instruksi Anda."
                    </div>
                 ) : isTyping ? (
                    <div className={`flex items-center gap-3 text-${activeConfig.folderColor}-500`}>
                       <Activity className="w-5 h-5 animate-spin" /> 
                       <span className="font-mono text-xs uppercase tracking-widest">Menganalisis matriks...</span>
                    </div>
                 ) : (
                    <div className={`bg-${activeConfig.folderColor}-950/20 border border-${activeConfig.folderColor}-900/50 p-6 rounded-2xl`}>
                       <p className={`text-sm leading-relaxed text-${activeConfig.folderColor}-100`}>{oracleResponse}</p>
                    </div>
                 )}
              </div>

              <form onSubmit={handleOracleSubmit} className="relative shrink-0">
                 <input 
                   type="text" 
                   value={oracleQuery}
                   onChange={(e) => setOracleQuery(e.target.value)}
                   placeholder="Ketik instruksi di sini..."
                   className={`w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-${activeConfig.folderColor}-500/50 transition-colors placeholder:text-zinc-600 font-light`}
                 />
                 <button type="submit" disabled={isTyping || !oracleQuery.trim()} className={`absolute right-3 top-3 bottom-3 w-10 bg-${activeConfig.folderColor}-600 hover:bg-${activeConfig.folderColor}-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors`}>
                    <Search className="w-4 h-4" />
                 </button>
              </form>
           </div>
        </div>

        {/* KANAN: POLICY SANDBOX (MESIN WAKTU) */}
        <div className={`col-span-1 lg:col-span-7 bg-zinc-950/80 border rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden ${isBuilderMode ? 'border-indigo-500/50 border-dashed' : 'border-white/5'}`}>
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-8 shrink-0">
                 <div>
                   <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 mb-1">
                      <SlidersHorizontal className="w-6 h-6 text-white" /> Policy Sandbox
                   </h2>
                   <p className="text-xs text-zinc-500 font-mono">Real-Time What-If Scenario Projection Engine</p>
                 </div>
                 {isBuilderMode && (
                   <button onClick={addSlider} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                     <Plus className="w-4 h-4" /> Tambah Tuas
                   </button>
                 )}
              </div>

              {/* SLIDERS (TUAS KEBIJAKAN) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 shrink-0">
                 <AnimatePresence>
                   {activeConfig.sliders.map((slider) => (
                      <motion.div layout key={slider.id} initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className={`bg-black/50 border p-5 rounded-2xl flex flex-col justify-center relative ${isBuilderMode ? 'border-indigo-500/50' : 'border-white/10'}`}>
                        {isBuilderMode && (
                          <button onClick={() => removeSlider(slider.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition z-10">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        
                        <div className="flex justify-between items-center mb-4">
                          {isBuilderMode ? (
                            <input 
                              value={slider.label} 
                              onChange={(e) => updateSliderProp(slider.id, 'label', e.target.value)}
                              className="bg-zinc-900 border border-indigo-500/50 text-indigo-300 text-xs font-bold uppercase tracking-widest w-24 px-1 outline-none rounded"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{slider.label}</span>
                          )}
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${slider.state !== 0 ? `bg-${slider.color}-900/50 text-${slider.color}-400` : 'bg-zinc-800 text-zinc-300'}`}>
                            {slider.state > 0 ? '+' : ''}{slider.state}{slider.unit}
                          </span>
                        </div>

                        <input 
                          type="range" min={-slider.max} max={slider.max} step={slider.step} 
                          value={slider.state} onChange={(e) => handleSliderChange(slider.id, Number(e.target.value))}
                          disabled={isBuilderMode}
                          className={`w-full ${!isBuilderMode ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'} accent-${slider.color}-500`}
                        />

                        {isBuilderMode && (
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                             <div className="text-[9px] text-zinc-500 uppercase font-bold text-center mb-2">Rumus Dampak Grafik</div>
                             <div className="flex items-center justify-between text-[10px]">
                               <span className="text-zinc-400">Efek ke Y1:</span>
                               <input type="number" step="0.1" value={slider.weightY1} onChange={e => updateSliderProp(slider.id, 'weightY1', Number(e.target.value))} className="w-12 bg-zinc-900 border border-zinc-700 rounded px-1 text-white text-center" />
                             </div>
                             <div className="flex items-center justify-between text-[10px]">
                               <span className="text-zinc-400">Efek ke Y2:</span>
                               <input type="number" step="0.1" value={slider.weightY2} onChange={e => updateSliderProp(slider.id, 'weightY2', Number(e.target.value))} className="w-12 bg-zinc-900 border border-zinc-700 rounded px-1 text-white text-center" />
                             </div>
                             <div className="flex items-center justify-between text-[10px] pt-1">
                               <span className="text-zinc-400">Warna Tuas:</span>
                               <select value={slider.color} onChange={(e) => updateSliderProp(slider.id, 'color', e.target.value)} className="bg-zinc-900 text-white border border-zinc-700 rounded px-1">
                                  {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                               </select>
                             </div>
                          </div>
                        )}
                      </motion.div>
                   ))}
                 </AnimatePresence>
                 {activeConfig.sliders.length === 0 && <div className="text-zinc-600 text-xs flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-5">Kosong. Tambah tuas.</div>}
              </div>

              {/* REAL-TIME PROJECTION CHART */}
              <div className={`flex-1 bg-black/40 border rounded-3xl p-6 flex flex-col ${isBuilderMode ? 'border-indigo-500/50' : 'border-white/5'}`}>
                 <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="text-sm font-bold text-white">Proyeksi Kinerja 5 Tahun Kedepan</h3>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-sm bg-red-500" /> 
                         {isBuilderMode ? (
                           <input value={activeConfig.chart.y1Label} onChange={e => updateChartLabel('y1Label', e.target.value)} className="bg-zinc-900 text-red-400 text-[10px] font-bold uppercase border border-red-500/50 rounded outline-none px-1 w-24" />
                         ) : (
                           <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">{activeConfig.chart.y1Label}</span>
                         )}
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-sm bg-emerald-500" /> 
                         {isBuilderMode ? (
                           <input value={activeConfig.chart.y2Label} onChange={e => updateChartLabel('y2Label', e.target.value)} className="bg-zinc-900 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/50 rounded outline-none px-1 w-24" />
                         ) : (
                           <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">{activeConfig.chart.y2Label}</span>
                         )}
                       </div>
                    </div>
                 </div>
                 <div className="flex-1 w-full min-h-[300px]">
                    <ReactECharts 
                      key={isBuilderMode ? "builder" : "exec"}
                      option={{
                        backgroundColor: 'transparent',
                        tooltip: { trigger: 'axis' },
                        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                        xAxis: { 
                          type: 'category', 
                          boundaryGap: false,
                          data: ['2026', '2027', '2028', '2029', '2030', '2031'],
                          axisLabel: { color: '#71717a', fontSize: 11, fontWeight: 'bold' }
                        },
                        yAxis: { 
                          type: 'value',
                          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                          axisLabel: { color: '#71717a' },
                          scale: true
                        },
                        series: [
                          {
                            name: activeConfig.chart.y1Label,
                            type: 'line',
                            smooth: true,
                            data: y1Result,
                            itemStyle: { color: '#ef4444' },
                            areaStyle: {
                              color: {
                                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                colorStops: [{ offset: 0, color: '#ef444450' }, { offset: 1, color: '#ef444405' }]
                              }
                            },
                            lineStyle: { width: 4 },
                            animationDuration: 1000,
                            animationEasing: 'cubicOut'
                          },
                          {
                            name: activeConfig.chart.y2Label,
                            type: 'line',
                            smooth: true,
                            data: y2Result,
                            itemStyle: { color: '#10b981' },
                            areaStyle: {
                              color: {
                                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                colorStops: [{ offset: 0, color: '#10b98150' }, { offset: 1, color: '#10b98105' }]
                              }
                            },
                            lineStyle: { width: 4 },
                            animationDuration: 1000,
                            animationEasing: 'cubicOut'
                          }
                        ]
                      }} 
                      style={{ height: '100%', width: '100%' }} 
                    />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
