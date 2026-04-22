"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp, ShieldCheck, Zap, SlidersHorizontal, Mic, Search, ChevronRight, Activity, Crosshair, Briefcase, HeartPulse, GraduationCap } from "lucide-react";
import ReactECharts from 'echarts-for-react';
import { motion, AnimatePresence } from "framer-motion";

type Domain = 'ekonomi' | 'kesehatan' | 'pendidikan';

export default function WarRoomPage() {
  const [activeDomain, setActiveDomain] = useState<Domain>('ekonomi');

  const [isTyping, setIsTyping] = useState(false);
  const [oracleQuery, setOracleQuery] = useState("");
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);

  // Policy Sandbox Sliders (Generic State)
  const [slider1, setSlider1] = useState(0); // -50 to +50
  const [slider2, setSlider2] = useState(0); // -50 to +50
  const [slider3, setSlider3] = useState(0); // -50 to +50

  // Reset sliders when domain changes
  useEffect(() => {
    setSlider1(0); setSlider2(0); setSlider3(0);
    setOracleResponse(null); setOracleQuery("");
  }, [activeDomain]);

  // ==========================================
  // UNIVERSAL DOMAIN DICTIONARY
  // ==========================================
  const domainConfig = {
    ekonomi: {
      name: "Ekonomi Makro & Kesejahteraan",
      icon: Briefcase,
      color: "amber",
      reports: [
        { icon: AlertTriangle, color: "red", title: "Anomali Defisit Anggaran Infrastruktur", desc: "Terdeteksi kekurangan alokasi sebesar Rp 1.2 Triliun pada sektor perbaikan jalan provinsi yang berpotensi menurunkan mobilitas ekonomi wilayah Selatan." },
        { icon: TrendingUp, color: "emerald", title: "Peluang Ekspansi Bansos", desc: "Terdapat sisa silpa berjalan yang dapat di-reklasifikasi untuk menambah cakupan bantuan sosial sebesar 400.000 Kepala Keluarga bulan ini." },
        { icon: ShieldCheck, color: "blue", title: "Kestabilan Sektor Pangan", desc: "Stok cadangan beras dan komoditas utama terpantau aman hingga 6 bulan ke depan tanpa memerlukan intervensi pasar mendesak." }
      ],
      sliders: [
        { label: "Suntikan Bansos", unit: "%", state: slider1, setState: setSlider1, step: 5, max: 50, color: "emerald", reverseEffect: false },
        { label: "Kenaikan Pajak", unit: "%", state: slider2, setState: setSlider2, step: 2, max: 20, color: "red", reverseEffect: true },
        { label: "Investasi Infra", unit: "%", state: slider3, setState: setSlider3, step: 5, max: 50, color: "blue", reverseEffect: false }
      ],
      chart: {
        y1Label: "% Kemiskinan", y1Color: "#ef4444", y1Base: [15.2, 14.8, 14.5, 14.1, 13.9, 13.5],
        y2Label: "% Pertumbuhan PDB", y2Color: "#10b981", y2Base: [4.5, 4.7, 4.9, 5.0, 5.2, 5.5],
        calcY1: (base: number, i: number) => base - ((slider1/100)*2*(i/5)) + ((slider2/100)*0.5*(i/5)),
        calcY2: (base: number, i: number) => base + ((slider3/100)*1.5*(i/5)) - ((slider2/100)*1*(i/5))
      },
      oracleReply: "Berdasarkan analisis silang 14.7 juta baris data kependudukan dan anggaran, kami menemukan bahwa defisit infrastruktur berdampak langsung pada biaya logistik di Selatan. Jika pajak diturunkan 5%, PDB berpotensi melesat 0.4%."
    },
    kesehatan: {
      name: "Kesehatan Masyarakat",
      icon: HeartPulse,
      color: "emerald",
      reports: [
        { icon: AlertTriangle, color: "red", title: "Status Darurat Wabah DBD", desc: "Lonjakan kasus demam berdarah sebesar 315% di tiga kabupaten dalam dua minggu terakhir. Kapasitas UGD hampir penuh." },
        { icon: TrendingUp, color: "emerald", title: "Surplus Distribusi Vitamin", desc: "Program pembagian vitamin gratis ke 2.000 Posyandu berjalan lebih cepat 15% dari target kuartal pertama." },
        { icon: ShieldCheck, color: "blue", title: "Kesiapan Oksigen Medis", desc: "Rantai pasok tabung oksigen untuk rumah sakit rujukan utama terverifikasi stabil dengan buffer stock 20 hari." }
      ],
      sliders: [
        { label: "Anggaran Faskes", unit: "%", state: slider1, setState: setSlider1, step: 5, max: 50, color: "blue", reverseEffect: false },
        { label: "Potongan BPJS", unit: "%", state: slider2, setState: setSlider2, step: 2, max: 20, color: "red", reverseEffect: true },
        { label: "Distribusi Vaksin", unit: "%", state: slider3, setState: setSlider3, step: 5, max: 50, color: "emerald", reverseEffect: false }
      ],
      chart: {
        y1Label: "% Angka Stunting", y1Color: "#f59e0b", y1Base: [21.5, 20.1, 18.5, 17.0, 15.2, 14.0],
        y2Label: "% Kesiapan RS", y2Color: "#3b82f6", y2Base: [65.0, 68.5, 75.0, 80.0, 85.0, 92.0],
        calcY1: (base: number, i: number) => base - ((slider1/100)*3*(i/5)) - ((slider3/100)*1*(i/5)),
        calcY2: (base: number, i: number) => base + ((slider1/100)*15*(i/5)) - ((slider2/100)*5*(i/5))
      },
      oracleReply: "Radar mendeteksi bahwa wilayah terparah terdampak DBD adalah daerah padat penduduk di Utara. Jika distribusi faskes ditingkatkan 20%, tingkat kesembuhan diproyeksikan akan stabil dalam waktu 14 hari."
    },
    pendidikan: {
      name: "Pendidikan & SDM Terapan",
      icon: GraduationCap,
      color: "blue",
      reports: [
        { icon: AlertTriangle, color: "red", title: "Kesenjangan Literasi Digital", desc: "Sekitar 42% sekolah dasar di area pelosok belum terhubung dengan jaringan internet yang stabil untuk ujian CBT." },
        { icon: TrendingUp, color: "emerald", title: "Serapan Lulusan Vokasi Naik", desc: "Angka lulusan SMK yang terserap industri dalam 6 bulan pertama meningkat pesat berkat program kemitraan swasta." },
        { icon: ShieldCheck, color: "blue", title: "Stabilitas Dana BOS", desc: "Penyaluran dana Bantuan Operasional Sekolah tahap II telah sukses tersalurkan 100% tanpa hambatan administrasi." }
      ],
      sliders: [
        { label: "Tunjangan Guru", unit: "%", state: slider1, setState: setSlider1, step: 5, max: 50, color: "blue", reverseEffect: false },
        { label: "Digitalisasi Kelas", unit: "%", state: slider2, setState: setSlider2, step: 5, max: 50, color: "emerald", reverseEffect: false },
        { label: "Pemotongan Biaya", unit: "%", state: slider3, setState: setSlider3, step: 2, max: 20, color: "red", reverseEffect: true }
      ],
      chart: {
        y1Label: "% Angka Putus Sekolah", y1Color: "#ef4444", y1Base: [5.2, 4.8, 4.5, 4.0, 3.5, 3.0],
        y2Label: "Indeks Prestasi SDM", y2Color: "#8b5cf6", y2Base: [6.8, 7.0, 7.2, 7.5, 7.8, 8.2],
        calcY1: (base: number, i: number) => base - ((slider1/100)*1*(i/5)) + ((slider3/100)*0.5*(i/5)),
        calcY2: (base: number, i: number) => base + ((slider2/100)*1*(i/5)) + ((slider1/100)*0.5*(i/5))
      },
      oracleReply: "Menanggapi query Anda: Kesenjangan literasi sangat dipengaruhi oleh kelengkapan gawai. Dengan meningkatkan anggaran digitalisasi kelas sebesar 25%, Indeks Prestasi SDM diproyeksikan melonjak menembus 8.0 pada 2028."
    }
  };

  const currentCfg = domainConfig[activeDomain];

  // Calculate Projections dynamically based on config
  const projectedY1 = currentCfg.chart.y1Base.map((val, idx) => currentCfg.chart.calcY1(val, idx).toFixed(2));
  const projectedY2 = currentCfg.chart.y2Base.map((val, idx) => currentCfg.chart.calcY2(val, idx).toFixed(2));

  const handleOracleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleQuery.trim()) return;
    setIsTyping(true);
    setOracleResponse(null);
    setTimeout(() => {
      setOracleResponse(currentCfg.oracleReply);
      setIsTyping(false);
    }, 2500);
  };

  // UI Theme Helpers
  const bgThemeMap = {
    ekonomi: "bg-amber-500/10",
    kesehatan: "bg-emerald-500/10",
    pendidikan: "bg-blue-500/10"
  };

  const textThemeMap = {
    ekonomi: "text-amber-500",
    kesehatan: "text-emerald-500",
    pendidikan: "text-blue-500"
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col gap-8 pb-10 font-sans">
      
      {/* DOMAIN SELECTOR MATRIX */}
      <div className="flex justify-center shrink-0">
         <div className="bg-black/50 p-1.5 rounded-2xl border border-white/10 flex gap-1 shadow-2xl backdrop-blur-md">
            {(Object.keys(domainConfig) as Domain[]).map(domain => {
               const cfg = domainConfig[domain];
               const Icon = cfg.icon;
               const isActive = activeDomain === domain;
               return (
                 <button 
                   key={domain}
                   onClick={() => setActiveDomain(domain)}
                   className={`px-6 py-3 rounded-xl text-xs font-bold tracking-widest flex items-center gap-3 transition-all duration-300 uppercase ${isActive ? `bg-${cfg.color}-600 text-white shadow-[0_0_20px_var(--tw-shadow-color)] shadow-${cfg.color}-600/40` : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                 >
                   <Icon className="w-4 h-4" /> {domain}
                 </button>
               );
            })}
         </div>
      </div>

      {/* HEADER VVIP */}
      <div className="flex justify-between items-center bg-black/80 border border-white/5 p-6 rounded-3xl shadow-2xl relative overflow-hidden shrink-0 transition-colors duration-500">
         <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[60px] transition-colors duration-1000 ${bgThemeMap[activeDomain]}`} />
         <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-zinc-900/80 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg">
              <Crosshair className={`w-8 h-8 transition-colors duration-500 ${textThemeMap[activeDomain]}`} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Nexus War Room</h1>
              <div className="flex items-center gap-3">
                 <span className={`text-[10px] font-bold uppercase tracking-widest border px-2 py-0.5 rounded transition-colors duration-500 border-${currentCfg.color}-500/30 text-${currentCfg.color}-400 bg-${currentCfg.color}-950/30`}>
                   Level 5 Clearance (VVIP)
                 </span>
                 <span className="text-xs text-zinc-500 font-mono">Domain: {currentCfg.name}</span>
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

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeDomain}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0"
        >
          {/* KIRI: EXECUTIVE BRIEF & OMNI-ORACLE */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-8">
             
             {/* EXECUTIVE BRIEFING (ZERO CLICK) */}
             <div className="bg-zinc-950/60 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col shrink-0">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${currentCfg.color}-500/50 to-transparent transition-colors duration-500`} />
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                   <Zap className={`w-5 h-5 transition-colors duration-500 ${textThemeMap[activeDomain]}`} /> Laporan Intelijen Terkini
                </h2>
                <div className="space-y-4">
                   {currentCfg.reports.map((report, idx) => {
                      const RIcon = report.icon;
                      return (
                        <div key={idx} className={`bg-${report.color}-950/20 border border-${report.color}-900/30 p-4 rounded-2xl flex gap-4 items-start group hover:bg-${report.color}-950/40 transition`}>
                           <div className="mt-1"><RIcon className={`w-5 h-5 text-${report.color}-500`} /></div>
                           <div>
                             <h4 className={`text-sm font-bold text-${report.color}-400 mb-1`}>{report.title}</h4>
                             <p className={`text-xs text-${report.color}-200/70 leading-relaxed`}>{report.desc}</p>
                           </div>
                        </div>
                      )
                   })}
                </div>
             </div>

             {/* OMNI-ORACLE CHAT */}
             <div className="bg-black border border-white/10 rounded-3xl p-8 shadow-2xl flex-1 flex flex-col min-h-[300px]">
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6 shrink-0">
                   <Mic className={`w-5 h-5 transition-colors duration-500 ${textThemeMap[activeDomain]}`} /> Omni-Oracle AI
                </h2>
                
                <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar pr-2 flex flex-col justify-end">
                   {!oracleResponse && !isTyping ? (
                      <div className="text-center text-zinc-600 font-light text-lg mb-8">
                        "Selamat datang, Pimpinan. Adakah data spesifik terkait <strong className="text-white">{currentCfg.name}</strong> yang ingin Bapak ketahui hari ini?"
                      </div>
                   ) : isTyping ? (
                      <div className={`flex items-center gap-3 transition-colors duration-500 ${textThemeMap[activeDomain]}`}>
                         <Activity className="w-5 h-5 animate-spin" /> 
                         <span className="font-mono text-xs uppercase tracking-widest">Menganalisis jutaan matriks sektoral...</span>
                      </div>
                   ) : (
                      <div className={`bg-${currentCfg.color}-950/20 border border-${currentCfg.color}-900/50 p-6 rounded-2xl transition-colors duration-500`}>
                         <p className={`text-sm leading-relaxed text-${currentCfg.color}-100`}>{oracleResponse}</p>
                      </div>
                   )}
                </div>

                <form onSubmit={handleOracleSubmit} className="relative shrink-0">
                   <input 
                     type="text" 
                     value={oracleQuery}
                     onChange={(e) => setOracleQuery(e.target.value)}
                     placeholder="Ketik instruksi bahasa alami Anda di sini..."
                     className={`w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-${currentCfg.color}-500/50 transition-colors placeholder:text-zinc-600 font-light`}
                   />
                   <button type="submit" disabled={isTyping || !oracleQuery.trim()} className={`absolute right-3 top-3 bottom-3 w-10 bg-${currentCfg.color}-600 hover:bg-${currentCfg.color}-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors`}>
                      <Search className="w-4 h-4" />
                   </button>
                </form>
             </div>
          </div>

          {/* KANAN: POLICY SANDBOX (MESIN WAKTU) */}
          <div className="col-span-1 lg:col-span-7 bg-zinc-950/80 border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
             
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 shrink-0">
                   <div>
                     <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3 mb-1">
                        <SlidersHorizontal className={`w-6 h-6 transition-colors duration-500 ${textThemeMap[activeDomain]}`} /> Policy Sandbox
                     </h2>
                     <p className="text-xs text-zinc-500 font-mono">Real-Time What-If Scenario Projection Engine</p>
                   </div>
                </div>

                {/* SLIDERS (TUAS KEBIJAKAN) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
                   {currentCfg.sliders.map((slider, idx) => (
                      <div key={idx} className="bg-black/50 border border-white/10 p-5 rounded-2xl flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{slider.label}</span>
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${slider.state > 0 ? (slider.reverseEffect ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/50 text-emerald-400') : slider.state < 0 ? (slider.reverseEffect ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400') : 'bg-zinc-800 text-zinc-300'}`}>
                            {slider.state > 0 ? '+' : ''}{slider.state}{slider.unit}
                          </span>
                        </div>
                        <input 
                          type="range" min={-slider.max} max={slider.max} step={slider.step} 
                          value={slider.state} onChange={(e) => slider.setState(Number(e.target.value))}
                          className={`w-full cursor-pointer accent-${slider.color}-500`}
                        />
                      </div>
                   ))}
                </div>

                {/* REAL-TIME PROJECTION CHART */}
                <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col">
                   <div className="flex justify-between items-center mb-4 shrink-0">
                      <h3 className="text-sm font-bold text-white">Proyeksi Kinerja 5 Tahun Kedepan</h3>
                      <div className="flex gap-4">
                         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{backgroundColor: currentCfg.chart.y1Color}} /> <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">{currentCfg.chart.y1Label}</span></div>
                         <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm" style={{backgroundColor: currentCfg.chart.y2Color}} /> <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">{currentCfg.chart.y2Label}</span></div>
                      </div>
                   </div>
                   <div className="flex-1 w-full min-h-[300px]">
                      <ReactECharts 
                        key={activeDomain} // force re-render chart structure on domain change
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
                              name: currentCfg.chart.y1Label,
                              type: 'line',
                              smooth: true,
                              data: projectedY1,
                              itemStyle: { color: currentCfg.chart.y1Color },
                              areaStyle: {
                                color: {
                                  type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                  colorStops: [{ offset: 0, color: currentCfg.chart.y1Color + '50' }, { offset: 1, color: currentCfg.chart.y1Color + '05' }]
                                }
                              },
                              lineStyle: { width: 4 },
                              animationDuration: 1000,
                              animationEasing: 'cubicOut'
                            },
                            {
                              name: currentCfg.chart.y2Label,
                              type: 'line',
                              smooth: true,
                              data: projectedY2,
                              itemStyle: { color: currentCfg.chart.y2Color },
                              areaStyle: {
                                color: {
                                  type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                  colorStops: [{ offset: 0, color: currentCfg.chart.y2Color + '50' }, { offset: 1, color: currentCfg.chart.y2Color + '05' }]
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
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
