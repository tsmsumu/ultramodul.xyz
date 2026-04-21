"use client";

import { useState } from "react";
import { UploadCloud, FileSpreadsheet, LayoutDashboard, BrainCircuit, Globe2, BarChart4, Calculator, MoveRight, X as XIcon, Loader2, BookOpen, GraduationCap, Microscope, Sparkles, Users } from "lucide-react";
import { useDropzone } from "react-dropzone";
import ReactECharts from 'echarts-for-react';
import { duckEngine } from "@/core/duckdb-engine";

export default function OmniAnalyticsPage() {
  // MODE STATE
  const [analystMode, setAnalystMode] = useState<'standard' | 'advance'>('standard');

  // --- GLOBAL STATE ---
  const [loading, setLoading] = useState(false);
  const [tableName, setTableName] = useState<string>('');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isAggregating, setIsAggregating] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'treemap' | 'line'>('bar');

  // --- ADVANCE MODE STATE ---
  const [fileIngested, setFileIngested] = useState(false);
  const [schemaRows, setSchemaRows] = useState<any[]>([]);
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [xAxisCol, setXAxisCol] = useState<string | null>(null);
  const [yAxisCol, setYAxisCol] = useState<string | null>(null);
  const [draggedCol, setDraggedCol] = useState<string | null>(null);
  const [activeDictionary, setActiveDictionary] = useState<boolean>(false);

  // --- STANDARD MODE STATE ---
  const [standardStep, setStandardStep] = useState<number>(1);
  const [storyMetric, setStoryMetric] = useState<string>('jumlah_penduduk');
  const [storyGroup, setStoryGroup] = useState<string>('kode_wilayah');
  
  const mockKamus: Record<string, string> = {
    "3201": "Kab. Bogor",
    "3202": "Kab. Sukabumi",
    "3203": "Kab. Cianjur",
    "3204": "Kab. Bandung",
    "3205": "Kab. Garut",
    "1": "Sangat Miskin",
    "2": "Miskin",
    "3": "Rentan",
    "A": "Infrastruktur Baik",
    "B": "Infrastruktur Sedang",
    "C": "Infrastruktur Rusak"
  };

  // --- ADVANCE MODE LOGIC ---
  const buildChart = async (x: string | null, y: string | null) => {
    if (!x || !tableName) return;
    setIsAggregating(true);
    try {
      let query = '';
      if (!y) {
        query = `SELECT ${x} as name, COUNT(*) as value FROM ${tableName} GROUP BY ${x} ORDER BY value DESC LIMIT 50;`;
      } else {
        query = `SELECT ${x} as name, SUM(${y}) as value FROM ${tableName} GROUP BY ${x} ORDER BY value DESC LIMIT 50;`;
      }
      const res = await duckEngine.executeRaw(query);
      setChartData(res);
    } catch (e) {
      console.error(e);
      alert("Error building chart. Periksa tipe data kolom.");
    } finally {
      setIsAggregating(false);
    }
  };

  const handleDropAxis = (axis: 'X' | 'Y') => {
    if (!draggedCol) return;
    if (axis === 'X') {
      setXAxisCol(draggedCol);
      buildChart(draggedCol, yAxisCol);
    } else {
      setYAxisCol(draggedCol);
      buildChart(xAxisCol, draggedCol);
    }
    setDraggedCol(null);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const uint8Buffer = new Uint8Array(buffer);
      const name = `t_omni_${Date.now()}`;
      
      const success = await duckEngine.ingestFile(name, uint8Buffer, file.name);
      if (success) {
        setTableName(name);
        const schema = await duckEngine.discoverSchema(name);
        setSchemaRows(schema);
        const preview = await duckEngine.previewData(name, 100);
        setDataPreview(preview);
        setFileIngested(true);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menelan file ke WASM");
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/octet-stream': ['.parquet'], 'text/csv': ['.csv'] } });

  // --- STANDARD MODE LOGIC ---
  const loadMockDataset = async (type: string) => {
    setLoading(true);
    try {
      let mockData: any[] = [];
      const wilayahs = ["3201", "3202", "3203", "3204", "3205"];
      
      if (type === 'kependudukan') {
         const status = ["1", "2", "3"]; // Miskin codes
         for(let i=0; i<1000; i++) {
            mockData.push({
               kode_wilayah: wilayahs[Math.floor(Math.random()*wilayahs.length)],
               status_kesejahteraan: status[Math.floor(Math.random()*status.length)],
               jumlah_penduduk: Math.floor(Math.random()*10) + 1
            });
         }
      } else {
         const kondisi = ["A", "B", "C"]; 
         for(let i=0; i<500; i++) {
            mockData.push({
               kode_wilayah: wilayahs[Math.floor(Math.random()*wilayahs.length)],
               kondisi_jalan: kondisi[Math.floor(Math.random()*kondisi.length)],
               anggaran_miliar: Math.floor(Math.random()*50) + 10
            });
         }
         setStoryMetric('anggaran_miliar');
      }

      const name = `t_standard_${Date.now()}`;
      const success = await duckEngine.ingestJSONData(name, mockData);
      
      if (success) {
         setTableName(name);
         setStandardStep(2);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runStoryQuery = async () => {
    if (!tableName) return;
    setIsAggregating(true);
    setStandardStep(3);
    try {
      // Auto-Chart Logic
      if (storyGroup.includes('wilayah')) setChartType('treemap');
      else setChartType('bar');

      const query = `SELECT ${storyGroup} as name, SUM(${storyMetric}) as value FROM ${tableName} GROUP BY ${storyGroup} ORDER BY value DESC LIMIT 50;`;
      const res = await duckEngine.executeRaw(query);
      setChartData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAggregating(false);
    }
  };


  // --- RENDER HELPERS ---
  const renderChart = (isStandard: boolean = false) => {
    const isCodexActive = isStandard ? true : activeDictionary;
    
    if (chartType === 'bar') {
      return (
        <ReactECharts 
          option={{
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { 
              type: 'category', 
              data: chartData.map(d => String(isCodexActive ? (mockKamus[d.name] || d.name) : d.name)),
              axisLabel: { color: '#71717a', fontSize: 10, rotate: 45, width: 100, overflow: 'truncate' }
            },
            yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#71717a' } },
            series: [{
              data: chartData.map(d => d.value),
              type: 'bar',
              itemStyle: { color: isStandard ? '#3b82f6' : '#4f46e5', borderRadius: [4, 4, 0, 0] },
              animationDuration: 1500,
              animationEasing: 'cubicOut'
            }]
          }} 
          style={{ height: '100%', width: '100%' }} 
        />
      );
    }

    if (chartType === 'treemap') {
      return (
        <ReactECharts 
          option={{
            backgroundColor: 'transparent',
            tooltip: { formatter: '{b}: {c}' },
            series: [{
              type: 'treemap',
              roam: false,
              nodeClick: false,
              data: chartData.map(d => ({ name: String(isCodexActive ? (mockKamus[d.name] || d.name) : d.name), value: d.value })),
              breadcrumb: { show: false },
              itemStyle: { borderColor: '#050505', borderWidth: 2, gapWidth: 1 },
              label: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
              color: isStandard ? ['#3b82f6', '#2563eb', '#1d4ed8', '#60a5fa', '#93c5fd'] : ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7']
            }]
          }} 
          style={{ height: '100%', width: '100%' }} 
        />
      );
    }

    return null; // Line chart omitted for brevity, logic is same
  };


  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-6rem)] flex flex-col gap-6 font-sans">
      
      {/* MODE TOGGLE SWITCH (The Core of Phase 7) */}
      <div className="flex justify-center shrink-0">
         <div className="bg-black/50 p-1.5 rounded-2xl border border-white/10 flex gap-1 shadow-2xl backdrop-blur-md">
            <button 
              onClick={() => setAnalystMode('standard')}
              className={`px-8 py-3 rounded-xl text-sm font-bold tracking-widest flex items-center gap-3 transition-all duration-300 ${analystMode === 'standard' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              <GraduationCap className="w-5 h-5" /> MODE JUNIOR (STANDARD)
            </button>
            <button 
              onClick={() => setAnalystMode('advance')}
              className={`px-8 py-3 rounded-xl text-sm font-bold tracking-widest flex items-center gap-3 transition-all duration-300 ${analystMode === 'advance' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              <Microscope className="w-5 h-5" /> MODE SENIOR (ADVANCE)
            </button>
         </div>
      </div>

      {/* ========================================================= */}
      {/* ==================== STANDARD MODE ====================== */}
      {/* ========================================================= */}
      {analystMode === 'standard' && (
        <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500">
           
           {standardStep === 1 && (
             <div className="flex-1 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
                <Sparkles className="w-16 h-16 text-blue-500 mb-6" />
                <h1 className="text-4xl font-black text-white mb-4">Apa yang ingin Anda ketahui hari ini?</h1>
                <p className="text-zinc-400 mb-10">Pilih dari katalog dataset instan di bawah ini. Tidak perlu mengunggah file atau mengerti bahasa SQL.</p>
                
                <div className="grid grid-cols-2 gap-6 w-full">
                   <button onClick={() => loadMockDataset('kependudukan')} className="bg-blue-950/20 hover:bg-blue-900/40 border border-blue-500/30 p-8 rounded-3xl transition-all group text-left relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 bg-blue-500/20 w-32 h-32 rounded-full blur-[40px] group-hover:bg-blue-500/40 transition" />
                      <Users className="w-10 h-10 text-blue-400 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Kesejahteraan & Kependudukan</h3>
                      <p className="text-sm text-blue-200/60">Data sebaran penduduk miskin dan rentan di berbagai kabupaten.</p>
                   </button>
                   <button onClick={() => loadMockDataset('infrastruktur')} className="bg-emerald-950/20 hover:bg-emerald-900/40 border border-emerald-500/30 p-8 rounded-3xl transition-all group text-left relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 bg-emerald-500/20 w-32 h-32 rounded-full blur-[40px] group-hover:bg-emerald-500/40 transition" />
                      <LayoutDashboard className="w-10 h-10 text-emerald-400 mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">Infrastruktur & Anggaran</h3>
                      <p className="text-sm text-emerald-200/60">Data kondisi jalan dan alokasi anggaran pembangunan per wilayah.</p>
                   </button>
                </div>
             </div>
           )}

           {standardStep >= 2 && (
             <div className="flex-1 flex flex-col gap-6">
                
                {/* GUIDED STORYTELLING (MADLIBS UI) */}
                <div className="bg-blue-950/20 border border-blue-500/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.1)] shrink-0">
                   <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <BrainCircuit className="w-5 h-5" /> Guided Storytelling
                   </div>
                   <div className="text-2xl font-light text-zinc-300 leading-relaxed flex flex-wrap items-center gap-3">
                      <span>"Saya ingin melihat</span>
                      
                      <select 
                        value={storyMetric} 
                        onChange={(e) => setStoryMetric(e.target.value)}
                        className="bg-blue-600/20 text-blue-300 border-b-2 border-blue-500 px-3 py-1 font-bold outline-none cursor-pointer hover:bg-blue-600/40 transition rounded-t-lg appearance-none"
                      >
                         <option value="jumlah_penduduk">Total Jumlah</option>
                         <option value="anggaran_miliar">Anggaran (Miliar)</option>
                      </select>

                      <span>yang dikelompokkan berdasarkan</span>

                      <select 
                        value={storyGroup} 
                        onChange={(e) => setStoryGroup(e.target.value)}
                        className="bg-emerald-600/20 text-emerald-300 border-b-2 border-emerald-500 px-3 py-1 font-bold outline-none cursor-pointer hover:bg-emerald-600/40 transition rounded-t-lg appearance-none"
                      >
                         <option value="kode_wilayah">Wilayah (Kabupaten)</option>
                         <option value="status_kesejahteraan">Status Kesejahteraan</option>
                         <option value="kondisi_jalan">Kondisi Infrastruktur</option>
                      </select>

                      <span>."</span>

                      <button 
                        onClick={runStoryQuery}
                        className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)] transition flex items-center gap-2 text-lg"
                      >
                         Tampilkan <MoveRight className="w-5 h-5" />
                      </button>
                   </div>
                </div>

                {/* CHART AREA JUNIOR */}
                {standardStep === 3 && (
                  <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col">
                     {isAggregating ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                          <span className="text-blue-400 font-mono text-sm">Menyusun Visualisasi Otomatis...</span>
                        </div>
                     ) : (
                        <>
                          <div className="flex justify-between items-center mb-6 shrink-0">
                             <h3 className="text-lg font-bold text-white">Visualisasi AI: {storyGroup === 'kode_wilayah' ? 'Geo Radar (Otomatis)' : 'Quantum Bar (Otomatis)'}</h3>
                             <div className="px-3 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 flex items-center gap-2">
                               <BookOpen className="w-3 h-3" /> Kamus (Codex) Otomatis Aktif
                             </div>
                          </div>
                          <div className="flex-1 w-full relative">
                             {renderChart(true)}
                          </div>
                        </>
                     )}
                  </div>
                )}
             </div>
           )}
        </div>
      )}

      {/* ========================================================= */}
      {/* ==================== ADVANCE MODE ======================= */}
      {/* ========================================================= */}
      {analystMode === 'advance' && (
        <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-500">
          {!fileIngested ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-indigo-900/30 border border-indigo-500/30 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(79,70,229,0.2)]">
                 <BrainCircuit className="w-10 h-10 text-indigo-500" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-4">Raw Analytics Engine</h1>
              <p className="text-zinc-400 max-w-lg mb-8 text-sm">Lempar file Parquet mentah. Rakit sumbu X dan Y Anda sendiri.</p>

              <div {...getRootProps()} className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${isDragActive ? 'border-indigo-500 bg-indigo-950/20' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-indigo-500/50'}`}>
                <input {...getInputProps()} />
                {loading ? (
                   <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-zinc-500" />
                    <div className="text-lg font-bold text-white uppercase tracking-widest">Drop Parquet / CSV Data Here</div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 min-h-0">
               {/* ADVANCE HEADER */}
               <div className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white tracking-widest uppercase">Universal Workspace</h2>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">TABLE: {tableName}</div>
                    </div>
                 </div>
                 <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                    <button onClick={() => setActiveDictionary(!activeDictionary)} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 border ${activeDictionary ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'bg-zinc-900 text-zinc-500 border-white/5'}`}>
                      <BookOpen className="w-4 h-4" /> INJECT DICTIONARY
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1 self-center" />
                    <button onClick={() => setChartType('bar')} className={`px-4 py-2 rounded-lg text-xs font-bold ${chartType === 'bar' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}><LayoutDashboard className="w-4 h-4" /> BAR</button>
                    <button onClick={() => setChartType('treemap')} className={`px-4 py-2 rounded-lg text-xs font-bold ${chartType === 'treemap' ? 'bg-emerald-600 text-white' : 'text-emerald-500 hover:text-white'}`}><Globe2 className="w-4 h-4" /> TREEMAP</button>
                 </div>
               </div>

               {/* ADVANCE WORKSPACE */}
               <div className="flex-1 flex gap-4 min-h-0">
                 {/* SIDEBAR */}
                 <div className="w-64 bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col shrink-0">
                    <div className="bg-black/40 p-3 border-b border-white/5 text-[10px] uppercase font-bold text-zinc-400">Schema ({schemaRows.length})</div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                       {schemaRows.map((col, idx) => (
                         <div key={idx} draggable onDragStart={() => setDraggedCol(col.column_name)} onDragEnd={() => setDraggedCol(null)} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg cursor-grab transition">
                            <span className="text-xs text-zinc-300 font-mono truncate w-[65%]">{col.column_name}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* CANVAS */}
                 <div className="flex-1 bg-zinc-900/20 border border-white/5 rounded-2xl flex flex-col">
                    {/* BUILDER */}
                    <div className="h-16 bg-black/40 border-b border-white/5 flex items-center px-6 gap-6 shrink-0">
                       <Calculator className="w-4 h-4 text-zinc-500" />
                       <div onDragOver={(e) => e.preventDefault()} onDrop={() => handleDropAxis('X')} className={`w-64 h-10 border-2 border-dashed rounded-lg flex items-center justify-between px-3 ${draggedCol ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-700 bg-zinc-900/50'}`}>
                         {xAxisCol ? <span className="text-xs text-indigo-400 font-mono font-bold truncate">X: {xAxisCol}</span> : <span className="text-[10px] text-zinc-500 uppercase font-bold">DRAG X-AXIS HERE</span>}
                       </div>
                       <MoveRight className="w-4 h-4 text-zinc-700" />
                       <div onDragOver={(e) => e.preventDefault()} onDrop={() => handleDropAxis('Y')} className={`w-64 h-10 border-2 border-dashed rounded-lg flex items-center justify-between px-3 ${draggedCol ? 'border-amber-500 bg-amber-900/20' : 'border-zinc-700 bg-zinc-900/50'}`}>
                         {yAxisCol ? <span className="text-xs text-amber-400 font-mono font-bold truncate">Y: SUM({yAxisCol})</span> : <span className="text-[10px] text-zinc-500 uppercase font-bold">DRAG Y-AXIS HERE</span>}
                       </div>
                    </div>

                    {/* CHART */}
                    <div className="flex-1 overflow-hidden p-6 bg-[#050505]">
                       {!xAxisCol ? (
                          <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-zinc-500 font-bold uppercase text-sm">
                            Tarik Sumbu X dan Y ke atas
                          </div>
                       ) : isAggregating ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                          </div>
                       ) : (
                          <div className="w-full h-full bg-zinc-900/20 border border-white/5 rounded-3xl p-4">
                            {renderChart(false)}
                          </div>
                       )}
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
