"use client";

import { useState, useEffect } from "react";
import { UploadCloud, FileSpreadsheet, LayoutDashboard, BrainCircuit, Globe2, BarChart4, Calculator, MoveRight, X as XIcon, Loader2, BookOpen, GraduationCap, Microscope, Sparkles, Database, Plus, Trash2, ShieldCheck } from "lucide-react";
import { useDropzone } from "react-dropzone";
import ReactECharts from 'echarts-for-react';
import { duckEngine } from "@/core/duckdb-engine";
import { getActiveUserId } from "../../actions/auth";

// --- UNIVERSAL CATALOG TYPES ---
interface OmniCatalogItem {
  id: string;
  title: string;
  description: string;
  tableName: string; // File is stored in DuckDB WASM memory. If page refreshed, WASM is wiped.
  // Note: Since WASM memory is wiped on refresh, in a real persistent scenario we would save the actual physical file or fetch it from DB.
  // For this ultra-modern PUM, we assume DuckDB WASM state is maintained during the session, or the admin re-ingests.
  // To make it truly persistent, the "Publish" should ideally upload the file to Next.js server.
  // But for now, we will store the catalog metadata. If WASM doesn't have the table, we'll ask user to re-upload or simulate it.
  // Actually, since PUM is universal, we can store the RAW JSON data in localStorage if it's small, OR we just keep it session-based for the demo.
  // Let's store raw data in IndexedDB/LocalStorage for true persistence across reloads.
  rawJsonData?: any[]; // Fallback persistence
}

const COLORS = ["blue", "emerald", "amber", "rose", "purple", "indigo", "cyan"];

export default function OmniAnalyticsPage() {
  // MODE STATE
  const [analystMode, setAnalystMode] = useState<'standard' | 'advance'>('standard');
  const [isClient, setIsClient] = useState(false);

  // --- CATALOG STATE (PERSISTENT) ---
  const [catalog, setCatalog] = useState<OmniCatalogItem[]>([]);
  const [userId, setUserId] = useState<string>("anonymous");

  // --- GLOBAL STATE ---
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isAggregating, setIsAggregating] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'treemap' | 'line'>('bar');

  // --- ADVANCE MODE STATE ---
  const [tableName, setTableName] = useState<string>('');
  const [fileIngested, setFileIngested] = useState(false);
  const [schemaRows, setSchemaRows] = useState<any[]>([]);
  const [xAxisCol, setXAxisCol] = useState<string | null>(null);
  const [yAxisCol, setYAxisCol] = useState<string | null>(null);
  const [draggedCol, setDraggedCol] = useState<string | null>(null);

  // --- STANDARD MODE STATE ---
  const [activeCatalogId, setActiveCatalogId] = useState<string | null>(null);
  const [standardStep, setStandardStep] = useState<number>(1);
  const [storyMetric, setStoryMetric] = useState<string>('');
  const [storyGroup, setStoryGroup] = useState<string>('');
  const [numericCols, setNumericCols] = useState<string[]>([]);
  const [categoricalCols, setCategoricalCols] = useState<string[]>([]);

  // LOAD CATALOG FROM LOCAL STORAGE
  useEffect(() => {
    setIsClient(true);
    getActiveUserId().then(id => {
       setUserId(id);
       const storageKey = `omniCatalog_v2_${id}`;
       const saved = localStorage.getItem(storageKey);
       if (saved) {
         try {
           const parsed = JSON.parse(saved);
           setCatalog(parsed);
           // Re-hydrate DuckDB with saved data to simulate persistence
           parsed.forEach((item: OmniCatalogItem) => {
              if (item.rawJsonData && item.rawJsonData.length > 0) {
                 duckEngine.ingestJSONData(item.tableName, item.rawJsonData).catch(console.error);
              }
           });
         } catch (e) {
           setCatalog([]);
         }
       }
    });
  }, []);

  const saveCatalog = (newCat: OmniCatalogItem[]) => {
    setCatalog(newCat);
    const storageKey = `omniCatalog_v2_${userId}`;
    // Don't save rawJsonData if it's too huge, but for Universal PUM demo we will save up to 1000 rows.
    try {
      localStorage.setItem(storageKey, JSON.stringify(newCat));
    } catch(e) {
      console.warn("Storage quota exceeded, stripping raw data");
      const stripped = newCat.map(c => ({...c, rawJsonData: []}));
      localStorage.setItem(storageKey, JSON.stringify(stripped));
    }
  };

  // --- ADVANCE MODE LOGIC ---
  const buildChart = async (x: string | null, y: string | null, tName: string = tableName) => {
    if (!x || !tName) return;
    setIsAggregating(true);
    try {
      let query = '';
      if (!y) {
        query = `SELECT "${x}" as name, COUNT(*) as value FROM ${tName} GROUP BY "${x}" ORDER BY value DESC LIMIT 50;`;
      } else {
        query = `SELECT "${x}" as name, SUM("${y}") as value FROM ${tName} GROUP BY "${x}" ORDER BY value DESC LIMIT 50;`;
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
      const name = `t_${Date.now()}`;
      
      const success = await duckEngine.ingestFile(name, uint8Buffer, file.name);
      if (success) {
        setTableName(name);
        const schema = await duckEngine.discoverSchema(name);
        setSchemaRows(schema);
        setFileIngested(true);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menelan file ke WASM");
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/octet-stream': ['.parquet'], 'text/csv': ['.csv'], 'application/json': ['.json'] } });

  const publishToCatalog = async () => {
    if (!tableName) return;
    const title = prompt("Masukkan Judul Dataset (Widget) untuk Mode Standard:");
    if (!title) return;
    const desc = prompt("Masukkan Deskripsi singkat:");
    
    setIsAggregating(true);
    try {
      // Ambil sedikit data untuk disimpan di localStorage agar persisten
      const rawData = await duckEngine.executeRaw(`SELECT * FROM ${tableName} LIMIT 1000;`);
      
      const newItem: OmniCatalogItem = {
        id: `cat_${Date.now()}`,
        title,
        description: desc || "Universal Dataset",
        tableName,
        rawJsonData: rawData
      };
      saveCatalog([...catalog, newItem]);
      alert("Dataset berhasil di-publish ke Katalog Standard!");
    } catch(e) {
      console.error(e);
      alert("Gagal mem-publish");
    } finally {
      setIsAggregating(false);
    }
  };

  const deleteCatalogItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("Hapus widget dataset ini dari katalog?")) {
      saveCatalog(catalog.filter(c => c.id !== id));
      if (activeCatalogId === id) setActiveCatalogId(null);
    }
  };

  // --- STANDARD MODE LOGIC ---
  const openCatalogItem = async (item: OmniCatalogItem) => {
    setActiveCatalogId(item.id);
    setStandardStep(2);
    setLoading(true);
    try {
      // Re-ingest if WASM lost it (e.g. page refresh)
      let tableReady = true;
      try {
        await duckEngine.executeRaw(`SELECT 1 FROM ${item.tableName} LIMIT 1`);
      } catch(e) {
        tableReady = false;
      }

      if (!tableReady && item.rawJsonData) {
         await duckEngine.ingestJSONData(item.tableName, item.rawJsonData);
      }

      // Discover Schema dynamically to feed the Madlibs
      const schema = await duckEngine.discoverSchema(item.tableName);
      
      const nums: string[] = [];
      const cats: string[] = [];
      
      schema.forEach(col => {
        const type = col.column_type.toUpperCase();
        if (type.includes('INT') || type.includes('DOUBLE') || type.includes('FLOAT') || type.includes('DECIMAL')) {
          nums.push(col.column_name);
        } else {
          cats.push(col.column_name);
        }
      });

      // If no numeric, fallback to counting categorical
      setNumericCols(nums);
      setCategoricalCols(cats);

      if (nums.length > 0) setStoryMetric(nums[0]);
      else setStoryMetric('COUNT_ALL'); // Fake metric for count

      if (cats.length > 0) setStoryGroup(cats[0]);
      else if (nums.length > 0) setStoryGroup(nums[0]); // fallback

    } catch(e) {
      console.error(e);
      alert("Gagal memuat dataset dari Katalog.");
      setActiveCatalogId(null);
      setStandardStep(1);
    } finally {
      setLoading(false);
    }
  };

  const runStoryQuery = async () => {
    const item = catalog.find(c => c.id === activeCatalogId);
    if (!item) return;
    
    setIsAggregating(true);
    setStandardStep(3);
    try {
      // Auto-Chart Logic
      if (storyGroup.toLowerCase().includes('wilayah') || storyGroup.toLowerCase().includes('area')) {
        setChartType('treemap');
      } else {
        setChartType('bar');
      }

      let query = '';
      if (storyMetric === 'COUNT_ALL') {
         query = `SELECT "${storyGroup}" as name, COUNT(*) as value FROM ${item.tableName} GROUP BY "${storyGroup}" ORDER BY value DESC LIMIT 50;`;
      } else {
         query = `SELECT "${storyGroup}" as name, SUM("${storyMetric}") as value FROM ${item.tableName} GROUP BY "${storyGroup}" ORDER BY value DESC LIMIT 50;`;
      }
      
      const res = await duckEngine.executeRaw(query);
      setChartData(res);
    } catch (e) {
      console.error(e);
      alert("Error menjalankan query analitik.");
    } finally {
      setIsAggregating(false);
    }
  };

  // --- RENDER HELPERS ---
  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <ReactECharts 
          option={{
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { 
              type: 'category', 
              data: chartData.map(d => String(d.name)),
              axisLabel: { color: '#71717a', fontSize: 10, rotate: 45, width: 100, overflow: 'truncate' }
            },
            yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: '#71717a' } },
            series: [{
              data: chartData.map(d => d.value),
              type: 'bar',
              itemStyle: { color: analystMode === 'standard' ? '#3b82f6' : '#4f46e5', borderRadius: [4, 4, 0, 0] },
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
              data: chartData.map(d => ({ name: String(d.name), value: d.value })),
              breadcrumb: { show: false },
              itemStyle: { borderColor: '#050505', borderWidth: 2, gapWidth: 1 },
              label: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
              color: analystMode === 'standard' ? ['#3b82f6', '#2563eb', '#1d4ed8', '#60a5fa', '#93c5fd'] : ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7']
            }]
          }} 
          style={{ height: '100%', width: '100%' }} 
        />
      );
    }
    return null;
  };

  if (!isClient) return null;

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-6rem)] flex flex-col gap-6 font-sans">
      
      {/* MODE TOGGLE SWITCH (The Core of Phase 7/14) */}
      <div className="flex justify-center shrink-0">
         <div className="bg-black/50 p-1.5 rounded-2xl border border-white/10 flex gap-1 shadow-2xl backdrop-blur-md">
            <button 
              onClick={() => { setAnalystMode('standard'); setActiveCatalogId(null); setStandardStep(1); }}
              className={`px-8 py-3 rounded-xl text-sm font-bold tracking-widest flex items-center gap-3 transition-all duration-300 ${analystMode === 'standard' ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              <GraduationCap className="w-5 h-5" /> STANDARD
            </button>
            <button 
              onClick={() => setAnalystMode('advance')}
              className={`px-8 py-3 rounded-xl text-sm font-bold tracking-widest flex items-center gap-3 transition-all duration-300 ${analystMode === 'advance' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
            >
              <Microscope className="w-5 h-5" /> ADVANCED
            </button>
         </div>
      </div>

      {/* ========================================================= */}
      {/* ==================== STANDARD MODE ====================== */}
      {/* ========================================================= */}
      {analystMode === 'standard' && (
        <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500 min-h-0">
           
           {standardStep === 1 && (
             <div className="flex-1 flex flex-col items-center justify-center text-center w-full max-w-6xl mx-auto pb-10">
                <Sparkles className="w-16 h-16 text-blue-500 mb-6" />
                <h1 className="text-4xl font-black text-white mb-4">Omni-Catalog Universal</h1>
                <p className="text-zinc-400 mb-10 max-w-2xl">Pilih widget dataset yang telah dipublish oleh Admin. PUM beroperasi sebagai Canvas Kosong, data di bawah ini adalah cerminan langsung dari file yang diolah di ruang Advanced.</p>
                
                {catalog.length === 0 ? (
                  <div className="border border-dashed border-zinc-800 rounded-3xl p-10 flex flex-col items-center max-w-lg">
                    <Database className="w-16 h-16 text-zinc-700 mb-4" />
                    <h3 className="text-lg font-bold text-zinc-500 uppercase tracking-widest mb-2">Katalog Kosong</h3>
                    <p className="text-sm text-zinc-600">Belum ada dataset yang dipublish. Silakan masuk ke Mode ADVANCED, unggah file, lalu klik "Publish ke Katalog".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-6">
                    {catalog.map((item, idx) => {
                      const color = COLORS[idx % COLORS.length];
                      return (
                        <button key={item.id} onClick={() => openCatalogItem(item)} className={`bg-${color}-950/20 hover:bg-${color}-900/40 border border-${color}-500/30 p-8 rounded-3xl transition-all group text-left relative overflow-hidden flex flex-col`}>
                            <div className={`absolute -right-10 -top-10 bg-${color}-500/20 w-32 h-32 rounded-full blur-[40px] group-hover:bg-${color}-500/40 transition`} />
                            <div className="flex justify-between items-start mb-4">
                              <LayoutDashboard className={`w-10 h-10 text-${color}-400`} />
                              <ShieldCheck className={`w-5 h-5 text-${color}-600`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                            <p className={`text-sm text-${color}-200/60`}>{item.description}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
             </div>
           )}

           {standardStep >= 2 && (
             <div className="flex-1 flex flex-col gap-6">
                
                {/* GUIDED STORYTELLING (MADLIBS UI) - DYNAMIC UNIVERSAL */}
                <div className="bg-blue-950/20 border border-blue-500/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.1)] shrink-0 relative">
                   <button onClick={() => { setStandardStep(1); setActiveCatalogId(null); }} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition">
                     <XIcon className="w-5 h-5" />
                   </button>
                   <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <BrainCircuit className="w-5 h-5" /> Universal Storytelling Widget
                   </div>
                   
                   {loading ? (
                     <div className="flex items-center gap-4 text-blue-400">
                       <Loader2 className="w-5 h-5 animate-spin" /> Mengkalkulasi Dimensi Tabel...
                     </div>
                   ) : (
                     <div className="text-2xl font-light text-zinc-300 leading-relaxed flex flex-wrap items-center gap-3">
                        <span>"Saya ingin melihat</span>
                        
                        <select 
                          value={storyMetric} 
                          onChange={(e) => setStoryMetric(e.target.value)}
                          className="bg-blue-600/20 text-blue-300 border-b-2 border-blue-500 px-3 py-1 font-bold outline-none cursor-pointer hover:bg-blue-600/40 transition rounded-t-lg appearance-none max-w-xs truncate"
                        >
                           {numericCols.length === 0 && <option value="COUNT_ALL">Total Jumlah (Count)</option>}
                           {numericCols.map(col => <option key={col} value={col}>Total {col}</option>)}
                        </select>

                        <span>yang dikelompokkan berdasarkan</span>

                        <select 
                          value={storyGroup} 
                          onChange={(e) => setStoryGroup(e.target.value)}
                          className="bg-emerald-600/20 text-emerald-300 border-b-2 border-emerald-500 px-3 py-1 font-bold outline-none cursor-pointer hover:bg-emerald-600/40 transition rounded-t-lg appearance-none max-w-xs truncate"
                        >
                           {categoricalCols.map(col => <option key={col} value={col}>{col}</option>)}
                           {numericCols.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>

                        <span>."</span>

                        <button 
                          onClick={runStoryQuery}
                          className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)] transition flex items-center gap-2 text-lg"
                        >
                           Eksekusi Widget <MoveRight className="w-5 h-5" />
                        </button>
                     </div>
                   )}
                </div>

                {/* CHART AREA STANDARD */}
                {standardStep === 3 && (
                  <div className="flex-1 bg-black/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col">
                     {isAggregating ? (
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                          <span className="text-blue-400 font-mono text-sm">Menyusun Visualisasi Dimensi Dinamis...</span>
                        </div>
                     ) : (
                        <>
                          <div className="flex justify-between items-center mb-6 shrink-0">
                             <h3 className="text-lg font-bold text-white">Visualisasi AI: Proyeksi Relasional</h3>
                             <div className="px-3 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 flex items-center gap-2">
                               <BookOpen className="w-3 h-3" /> Auto-Schema Discovered
                             </div>
                          </div>
                          <div className="flex-1 w-full relative">
                             {renderChart()}
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
            <div className="flex-1 flex flex-col items-center justify-center text-center relative overflow-y-auto custom-scrollbar pb-10">
              
              <div className="w-20 h-20 bg-indigo-900/30 border border-indigo-500/30 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(79,70,229,0.2)] mt-10">
                 <BrainCircuit className="w-10 h-10 text-indigo-500" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-4">Raw Analytics Engine</h1>
              <p className="text-zinc-400 max-w-lg mb-8 text-sm">PUM bersifat Universal. Lempar Parquet/CSV mentah, lalu rakit sumbu koordinat Anda, atau Publish sebagai Widget ke Mode Standard.</p>

              <div {...getRootProps()} className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 mb-10 shrink-0 ${isDragActive ? 'border-indigo-500 bg-indigo-950/20' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-indigo-500/50'}`}>
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

              {/* ADMIN VIEW OF PUBLISHED CATALOGS */}
              {catalog.length > 0 && (
                <div className="w-full max-w-4xl text-left border-t border-white/10 pt-10">
                   <h3 className="text-lg font-bold text-zinc-500 uppercase tracking-widest mb-6">Manajemen Widget (Katalog Standard)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {catalog.map(item => (
                       <div key={item.id} className="bg-black/50 border border-white/5 p-4 rounded-2xl flex justify-between items-center group">
                          <div>
                            <div className="font-bold text-white">{item.title}</div>
                            <div className="text-xs text-zinc-500 font-mono">Tabel: {item.tableName}</div>
                          </div>
                          <button onClick={(e) => deleteCatalogItem(item.id, e)} className="w-8 h-8 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white rounded flex items-center justify-center transition opacity-0 group-hover:opacity-100">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                     ))}
                   </div>
                </div>
              )}

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
                 <div className="flex gap-3">
                    <button onClick={publishToCatalog} disabled={isAggregating} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center gap-2 shadow-lg transition">
                       {isAggregating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Publish ke Katalog
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1 self-center" />
                    <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                      <button onClick={() => setChartType('bar')} className={`px-4 py-2 rounded-lg text-xs font-bold ${chartType === 'bar' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}><LayoutDashboard className="w-4 h-4" /> BAR</button>
                      <button onClick={() => setChartType('treemap')} className={`px-4 py-2 rounded-lg text-xs font-bold ${chartType === 'treemap' ? 'bg-emerald-600 text-white' : 'text-emerald-500 hover:text-white'}`}><Globe2 className="w-4 h-4" /> TREEMAP</button>
                    </div>
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
                            <span className="text-xs text-zinc-300 font-mono truncate w-full">{col.column_name}</span>
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
                          <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-zinc-500 font-bold uppercase text-sm">
                            <BarChart4 className="w-16 h-16 text-zinc-800 mb-4" />
                            Tarik Sumbu X dan Y ke atas
                          </div>
                       ) : isAggregating ? (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                          </div>
                       ) : (
                          <div className="w-full h-full bg-zinc-900/20 border border-white/5 rounded-3xl p-4">
                            {renderChart()}
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
