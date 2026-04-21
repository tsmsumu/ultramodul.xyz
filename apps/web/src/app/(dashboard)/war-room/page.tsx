"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp, ShieldCheck, Zap, SlidersHorizontal, Mic, Search, ChevronRight, Activity, Crosshair } from "lucide-react";
import ReactECharts from 'echarts-for-react';

export default function WarRoomPage() {
  const [isTyping, setIsTyping] = useState(false);
  const [oracleQuery, setOracleQuery] = useState("");
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);

  // Policy Sandbox Sliders
  const [budgetBansos, setBudgetBansos] = useState(0); // -50 to +50 %
  const [taxRate, setTaxRate] = useState(0); // -20 to +20 %
  const [infraInvestment, setInfraInvestment] = useState(0); // -50 to +50 %

  // Simulated Projections Data Based on Sliders
  const basePovertyData = [15.2, 14.8, 14.5, 14.1, 13.9, 13.5];
  const baseGrowthData = [4.5, 4.7, 4.9, 5.0, 5.2, 5.5];
  
  // Calculate dynamic projection
  const projectedPovertyData = basePovertyData.map((val, idx) => {
    // Kemiskinan turun jika bansos naik, tapi jika pajak terlalu tinggi kemiskinan naik dikit
    const bansosEffect = (budgetBansos / 100) * 2; // up to 2% drop
    const taxEffect = (taxRate / 100) * 0.5;
    // Semakin jauh ke masa depan (idx besar), efeknya makin terasa
    return (val - (bansosEffect * (idx/5)) + (taxEffect * (idx/5))).toFixed(2);
  });

  const projectedGrowthData = baseGrowthData.map((val, idx) => {
    // Pertumbuhan naik jika infra naik, turun jika pajak naik
    const infraEffect = (infraInvestment / 100) * 1.5;
    const taxEffect = (taxRate / 100) * 1.0;
    return (val + (infraEffect * (idx/5)) - (taxEffect * (idx/5))).toFixed(2);
  });

  const handleOracleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleQuery.trim()) return;
    setIsTyping(true);
    setOracleResponse(null);
    
    // Simulate AI thinking delay
    setTimeout(() => {
      setOracleResponse(`Berdasarkan analisis silang 14.7 juta baris data kependudukan dan anggaran, kami menemukan bahwa kondisi jalan rusak terburuk berada di wilayah Kab. Bogor (3201) dengan defisit perbaikan mencapai Rp 124 Miliar. Jika Bapak memberikan suntikan anggaran infrastruktur sebesar 15%, diproyeksikan pertumbuhan ekonomi lokal akan naik sebesar 0.8% dalam 12 bulan ke depan.`);
      setIsTyping(false);
    }, 2500);
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col gap-8 pb-10 font-sans">
      
      {/* HEADER VVIP */}
      <div className="flex justify-between items-center bg-black/80 border border-amber-900/30 p-6 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.05)] relative overflow-hidden shrink-0">
         <div className="absolute -right-20 -top-20 bg-amber-500/10 w-64 h-64 rounded-full blur-[60px]" />
         <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-900/40 to-black border border-amber-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Crosshair className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Nexus War Room</h1>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest border border-amber-500/30 px-2 py-0.5 rounded bg-amber-950/30">
                   Level 5 Clearance (VVIP)
                 </span>
                 <span className="text-xs text-zinc-500 font-mono">Executive Summary & Policy Sandbox</span>
              </div>
            </div>
         </div>
         <div className="hidden lg:flex items-center gap-3 relative z-10">
            <div className="text-right">
              <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Sistem Pendukung Keputusan</div>
              <div className="text-sm text-emerald-400 font-mono flex items-center gap-2 justify-end mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> AI OMNI-ORACLE AKTIF
              </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* KIRI: EXECUTIVE BRIEF & OMNI-ORACLE */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-8">
           
           {/* EXECUTIVE BRIEFING (ZERO CLICK) */}
           <div className="bg-zinc-950/60 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col shrink-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                 <Zap className="w-5 h-5 text-amber-500" /> Laporan Intelijen Terkini
              </h2>
              <div className="space-y-4">
                 <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-2xl flex gap-4 items-start group hover:bg-red-950/40 transition">
                    <div className="mt-1"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
                    <div>
                      <h4 className="text-sm font-bold text-red-400 mb-1">Anomali Defisit Anggaran Infrastruktur</h4>
                      <p className="text-xs text-red-200/70 leading-relaxed">Terdeteksi kekurangan alokasi sebesar Rp 1.2 Triliun pada sektor perbaikan jalan provinsi yang berpotensi menurunkan mobilitas ekonomi wilayah Selatan.</p>
                    </div>
                 </div>
                 <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-2xl flex gap-4 items-start group hover:bg-emerald-950/40 transition">
                    <div className="mt-1"><TrendingUp className="w-5 h-5 text-emerald-500" /></div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400 mb-1">Peluang Ekspansi Bansos</h4>
                      <p className="text-xs text-emerald-200/70 leading-relaxed">Terdapat sisa silpa berjalan yang dapat di-reklasifikasi untuk menambah cakupan bantuan sosial sebesar 400.000 Kepala Keluarga bulan ini.</p>
                    </div>
                 </div>
                 <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-2xl flex gap-4 items-start group hover:bg-blue-950/40 transition">
                    <div className="mt-1"><ShieldCheck className="w-5 h-5 text-blue-500" /></div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-400 mb-1">Kestabilan Sektor Pangan</h4>
                      <p className="text-xs text-blue-200/70 leading-relaxed">Stok cadangan beras dan komoditas utama terpantau aman hingga 6 bulan ke depan tanpa memerlukan intervensi pasar mendesak.</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* OMNI-ORACLE CHAT */}
           <div className="bg-black border border-white/10 rounded-3xl p-8 shadow-2xl flex-1 flex flex-col min-h-[300px]">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6 shrink-0">
                 <Mic className="w-5 h-5 text-blue-400" /> Omni-Oracle AI
              </h2>
              
              <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar pr-2 flex flex-col justify-end">
                 {!oracleResponse && !isTyping ? (
                    <div className="text-center text-zinc-600 font-light text-lg mb-8">
                      "Selamat datang, Pimpinan. Adakah data spesifik yang ingin Bapak ketahui hari ini?"
                    </div>
                 ) : isTyping ? (
                    <div className="flex items-center gap-3 text-blue-400">
                       <Activity className="w-5 h-5 animate-spin" /> 
                       <span className="font-mono text-xs uppercase tracking-widest">Menganalisis jutaan matriks...</span>
                    </div>
                 ) : (
                    <div className="bg-blue-950/20 border border-blue-900/50 p-6 rounded-2xl">
                       <p className="text-sm text-blue-100 leading-relaxed">{oracleResponse}</p>
                    </div>
                 )}
              </div>

              <form onSubmit={handleOracleSubmit} className="relative shrink-0">
                 <input 
                   type="text" 
                   value={oracleQuery}
                   onChange={(e) => setOracleQuery(e.target.value)}
                   placeholder="Ketik instruksi bahasa alami Anda di sini..."
                   className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-zinc-600 font-light"
                 />
                 <button type="submit" disabled={isTyping || !oracleQuery.trim()} className="absolute right-3 top-3 bottom-3 w-10 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors">
                    <Search className="w-4 h-4" />
                 </button>
              </form>
           </div>

        </div>

        {/* KANAN: POLICY SANDBOX (MESIN WAKTU) */}
        <div className="col-span-1 lg:col-span-7 bg-zinc-950/80 border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
           {/* Background Grid Pattern */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
           
           <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-8 shrink-0">
                 <div>
                   <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 mb-1">
                      <SlidersHorizontal className="w-6 h-6 text-amber-500" /> Policy Sandbox
                   </h2>
                   <p className="text-xs text-zinc-500 font-mono">Real-Time What-If Scenario Projection Engine</p>
                 </div>
              </div>

              {/* SLIDERS (TUAS KEBIJAKAN) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
                 {/* BANSOS */}
                 <div className="bg-black/50 border border-white/10 p-5 rounded-2xl flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Suntikan Bansos</span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${budgetBansos > 0 ? 'bg-emerald-900/50 text-emerald-400' : budgetBansos < 0 ? 'bg-red-900/50 text-red-400' : 'bg-zinc-800 text-zinc-300'}`}>
                        {budgetBansos > 0 ? '+' : ''}{budgetBansos}%
                      </span>
                    </div>
                    <input 
                      type="range" min="-50" max="50" step="5" value={budgetBansos} onChange={(e) => setBudgetBansos(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                 </div>

                 {/* PAJAK */}
                 <div className="bg-black/50 border border-white/10 p-5 rounded-2xl flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Kenaikan Pajak</span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${taxRate > 0 ? 'bg-red-900/50 text-red-400' : taxRate < 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-800 text-zinc-300'}`}>
                        {taxRate > 0 ? '+' : ''}{taxRate}%
                      </span>
                    </div>
                    <input 
                      type="range" min="-20" max="20" step="2" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                 </div>

                 {/* INFRASTRUKTUR */}
                 <div className="bg-black/50 border border-white/10 p-5 rounded-2xl flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Investasi Infra</span>
                      <span className={`text-xs font-black px-2 py-0.5 rounded ${infraInvestment > 0 ? 'bg-blue-900/50 text-blue-400' : infraInvestment < 0 ? 'bg-red-900/50 text-red-400' : 'bg-zinc-800 text-zinc-300'}`}>
                        {infraInvestment > 0 ? '+' : ''}{infraInvestment}%
                      </span>
                    </div>
                    <input 
                      type="range" min="-50" max="50" step="5" value={infraInvestment} onChange={(e) => setInfraInvestment(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                 </div>
              </div>

              {/* REAL-TIME PROJECTION CHART */}
              <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="text-sm font-bold text-white">Proyeksi Kinerja 5 Tahun Kedepan</h3>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm" /> <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">% Kemiskinan</span></div>
                       <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm" /> <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">% Pertumbuhan PDB</span></div>
                    </div>
                 </div>
                 <div className="flex-1 w-full min-h-[300px]">
                    <ReactECharts 
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
                          min: 0, max: 20
                        },
                        series: [
                          {
                            name: '% Kemiskinan',
                            type: 'line',
                            smooth: true,
                            data: projectedPovertyData,
                            itemStyle: { color: '#ef4444' }, // Red
                            areaStyle: {
                              color: {
                                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                colorStops: [{ offset: 0, color: 'rgba(239,68,68,0.3)' }, { offset: 1, color: 'rgba(239,68,68,0.01)' }]
                              }
                            },
                            lineStyle: { width: 4 },
                            animationDuration: 1000,
                            animationEasing: 'cubicOut'
                          },
                          {
                            name: '% Pertumbuhan PDB',
                            type: 'line',
                            smooth: true,
                            data: projectedGrowthData,
                            itemStyle: { color: '#10b981' }, // Emerald
                            areaStyle: {
                              color: {
                                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.3)' }, { offset: 1, color: 'rgba(16,185,129,0.01)' }]
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
