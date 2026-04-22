"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp, ShieldCheck, Zap, SlidersHorizontal, Mic, Search, Activity, Crosshair, Wrench, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import ReactECharts from 'echarts-for-react';
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES FOR LEGO ARCHITECT ---
interface LegoSlider {
  id: string;
  label: string;
  unit: string;
  state: number; // current value
  step: number;
  max: number;
  color: string;
  weightY1: number; // Multiplier for Y1
  weightY2: number; // Multiplier for Y2
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
  domainName: string;
  reports: LegoReport[];
  sliders: LegoSlider[];
  chart: LegoChart;
}

const DEFAULT_CONFIG: WarRoomConfig = {
  domainName: "Ekonomi & Kesejahteraan (Custom)",
  reports: [
    { id: "r1", color: "red", title: "Anomali Defisit Anggaran", desc: "Terdeteksi kekurangan alokasi pada sektor infrastruktur yang berpotensi menurunkan mobilitas." },
    { id: "r2", color: "emerald", title: "Peluang Ekspansi Bansos", desc: "Terdapat sisa silpa berjalan yang dapat direklasifikasi untuk menambah cakupan bantuan sosial." },
    { id: "r3", color: "blue", title: "Kestabilan Sektor Pangan", desc: "Stok cadangan beras dan komoditas utama terpantau aman hingga 6 bulan ke depan." }
  ],
  sliders: [
    { id: "s1", label: "Suntikan Bansos", unit: "%", state: 0, step: 5, max: 50, color: "emerald", weightY1: -2, weightY2: 0.5 },
    { id: "s2", label: "Kenaikan Pajak", unit: "%", state: 0, step: 2, max: 20, color: "red", weightY1: 0.5, weightY2: -1 },
  ],
  chart: {
    y1Label: "% Kemiskinan",
    y2Label: "% Pertumbuhan PDB",
    y1Base: [15.2, 14.8, 14.5, 14.1, 13.9, 13.5],
    y2Base: [4.5, 4.7, 4.9, 5.0, 5.2, 5.5],
  }
};

export default function WarRoomLegoPage() {
  const [isClient, setIsClient] = useState(false);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [config, setConfig] = useState<WarRoomConfig>(DEFAULT_CONFIG);
  
  const [isTyping, setIsTyping] = useState(false);
  const [oracleQuery, setOracleQuery] = useState("");
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);

  // LOAD FROM LOCAL STORAGE
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('warRoomConfig_v1');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse War Room config");
      }
    }
  }, []);

  // SAVE TO LOCAL STORAGE
  const saveConfig = (newConfig: WarRoomConfig) => {
    setConfig(newConfig);
    localStorage.setItem('warRoomConfig_v1', JSON.stringify(newConfig));
  };

  // --- DYNAMIC CALCULATION ---
  // The magic happens here: we calculate Y1 and Y2 projections based on the active sliders and their weights.
  const calculateProjections = () => {
    const y1Result = config.chart.y1Base.map((base, i) => {
      let mod = 0;
      config.sliders.forEach(s => {
        // e.g. state=10, weight=-2. Effect grows over time (i/5).
        mod += (s.state / 100) * s.weightY1 * (i / 5);
      });
      return (base + mod).toFixed(2);
    });

    const y2Result = config.chart.y2Base.map((base, i) => {
      let mod = 0;
      config.sliders.forEach(s => {
        mod += (s.state / 100) * s.weightY2 * (i / 5);
      });
      return (base + mod).toFixed(2);
    });

    return { y1Result, y2Result };
  };

  const { y1Result, y2Result } = calculateProjections();

  // --- EVENT HANDLERS ---
  const handleSliderChange = (id: string, newVal: number) => {
    if (isBuilderMode) return; // Don't move sliders in builder mode
    const newSliders = config.sliders.map(s => s.id === id ? { ...s, state: newVal } : s);
    saveConfig({ ...config, sliders: newSliders });
  };

  const addSlider = () => {
    const newSlider: LegoSlider = {
      id: `s_${Date.now()}`, label: "Tuas Baru", unit: "%", state: 0, step: 5, max: 50, color: "blue", weightY1: 0, weightY2: 0
    };
    saveConfig({ ...config, sliders: [...config.sliders, newSlider] });
  };

  const removeSlider = (id: string) => {
    saveConfig({ ...config, sliders: config.sliders.filter(s => s.id !== id) });
  };

  const updateSliderProp = (id: string, prop: keyof LegoSlider, val: any) => {
    const newSliders = config.sliders.map(s => s.id === id ? { ...s, [prop]: val } : s);
    saveConfig({ ...config, sliders: newSliders });
  };

  const updateReport = (id: string, prop: keyof LegoReport, val: any) => {
    const newReports = config.reports.map(r => r.id === id ? { ...r, [prop]: val } : r);
    saveConfig({ ...config, reports: newReports });
  };

  const updateChartLabel = (prop: 'y1Label' | 'y2Label', val: string) => {
    saveConfig({ ...config, chart: { ...config.chart, [prop]: val } });
  };

  const handleOracleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleQuery.trim()) return;
    setIsTyping(true);
    setOracleResponse(null);
    setTimeout(() => {
      setOracleResponse(`Berdasarkan pengaturan matriks saat ini di domain ${config.domainName}, proyeksi data menunjukkan tren yang sangat berkorelasi dengan pergerakan tuas yang telah Anda tentukan.`);
      setIsTyping(false);
    }, 2500);
  };

  if (!isClient) return null;

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col gap-8 pb-10 font-sans">
      
      {/* HEADER VVIP & LEGO BUILDER TOGGLE */}
      <div className={`flex justify-between items-center bg-black/80 border p-6 rounded-3xl shadow-2xl relative overflow-hidden shrink-0 transition-colors duration-500 ${isBuilderMode ? 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)]' : 'border-white/5'}`}>
         <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[60px] bg-white/5" />
         
         <div className="flex items-center gap-6 relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${isBuilderMode ? 'bg-indigo-900/80 border-indigo-500 text-indigo-400' : 'bg-zinc-900/80 border-white/10 text-white'}`}>
              {isBuilderMode ? <Wrench className="w-8 h-8" /> : <Crosshair className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-3xl font-black text-white tracking-widest uppercase">Nexus War Room</h1>
                 {isBuilderMode && <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest animate-pulse">Lego Architect Active</span>}
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded border-white/20 text-zinc-400 bg-white/5">
                   Level 5 Clearance (VVIP)
                 </span>
                 {isBuilderMode ? (
                    <input 
                      value={config.domainName} 
                      onChange={(e) => saveConfig({...config, domainName: e.target.value})}
                      className="bg-zinc-900 text-indigo-300 text-xs font-mono border border-indigo-500/50 rounded px-2 py-1 outline-none w-64"
                    />
                 ) : (
                    <span className="text-xs text-zinc-500 font-mono">Domain: {config.domainName}</span>
                 )}
              </div>
            </div>
         </div>
         
         <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={() => {
                setIsBuilderMode(!isBuilderMode);
                // Reset sliders to 0 when exiting builder mode to prevent confusion
                if (isBuilderMode) {
                  const resetSliders = config.sliders.map(s => ({...s, state: 0}));
                  saveConfig({...config, sliders: resetSliders});
                }
              }}
              className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${isBuilderMode ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-white/10'}`}
            >
              {isBuilderMode ? <><Save className="w-4 h-4"/> Selesai Merakit</> : <><Wrench className="w-4 h-4"/> Mode Architect</>}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* KIRI: EXECUTIVE BRIEF & OMNI-ORACLE */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-8">
           
           {/* EXECUTIVE BRIEFING */}
           <div className={`bg-zinc-950/60 border rounded-3xl p-8 shadow-2xl relative flex flex-col shrink-0 ${isBuilderMode ? 'border-indigo-500/50 border-dashed' : 'border-white/5'}`}>
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                 <Zap className="w-5 h-5 text-amber-500" /> Laporan Intelijen Terkini
              </h2>
              
              <div className="space-y-4">
                 {config.reports.map((report) => (
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
                 <Mic className="w-5 h-5 text-indigo-500" /> Omni-Oracle AI
              </h2>
              
              <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar pr-2 flex flex-col justify-end">
                 {!oracleResponse && !isTyping ? (
                    <div className="text-center text-zinc-600 font-light text-lg mb-8">
                      "Sistem siap, Pimpinan. Berikan instruksi analitik bahasa alami."
                    </div>
                 ) : isTyping ? (
                    <div className="flex items-center gap-3 text-indigo-500">
                       <Activity className="w-5 h-5 animate-spin" /> 
                       <span className="font-mono text-xs uppercase tracking-widest">Menganalisis matriks...</span>
                    </div>
                 ) : (
                    <div className="bg-indigo-950/20 border border-indigo-900/50 p-6 rounded-2xl">
                       <p className="text-sm leading-relaxed text-indigo-100">{oracleResponse}</p>
                    </div>
                 )}
              </div>

              <form onSubmit={handleOracleSubmit} className="relative shrink-0">
                 <input 
                   type="text" 
                   value={oracleQuery}
                   onChange={(e) => setOracleQuery(e.target.value)}
                   placeholder="Ketik instruksi di sini..."
                   className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-zinc-600 font-light"
                 />
                 <button type="submit" disabled={isTyping || !oracleQuery.trim()} className="absolute right-3 top-3 bottom-3 w-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors">
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
                   {config.sliders.map((slider) => (
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
                               <span className="text-zinc-400">Max / Step:</span>
                               <div className="flex gap-1">
                                  <input type="number" value={slider.max} onChange={e => updateSliderProp(slider.id, 'max', Number(e.target.value))} className="w-10 bg-zinc-900 border border-zinc-700 rounded px-1 text-white text-center" />
                                  <input type="number" value={slider.step} onChange={e => updateSliderProp(slider.id, 'step', Number(e.target.value))} className="w-10 bg-zinc-900 border border-zinc-700 rounded px-1 text-white text-center" />
                               </div>
                             </div>
                          </div>
                        )}
                      </motion.div>
                   ))}
                 </AnimatePresence>
                 {config.sliders.length === 0 && <div className="text-zinc-600 text-xs flex items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-5">Kosong. Tambah tuas.</div>}
              </div>

              {/* REAL-TIME PROJECTION CHART */}
              <div className={`flex-1 bg-black/40 border rounded-3xl p-6 flex flex-col ${isBuilderMode ? 'border-indigo-500/50' : 'border-white/5'}`}>
                 <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="text-sm font-bold text-white">Proyeksi Kinerja 5 Tahun Kedepan</h3>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-sm bg-red-500" /> 
                         {isBuilderMode ? (
                           <input value={config.chart.y1Label} onChange={e => updateChartLabel('y1Label', e.target.value)} className="bg-zinc-900 text-red-400 text-[10px] font-bold uppercase border border-red-500/50 rounded outline-none px-1" />
                         ) : (
                           <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">{config.chart.y1Label}</span>
                         )}
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-sm bg-emerald-500" /> 
                         {isBuilderMode ? (
                           <input value={config.chart.y2Label} onChange={e => updateChartLabel('y2Label', e.target.value)} className="bg-zinc-900 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/50 rounded outline-none px-1" />
                         ) : (
                           <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">{config.chart.y2Label}</span>
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
                            name: config.chart.y1Label,
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
                            name: config.chart.y2Label,
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
