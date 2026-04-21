"use client";

import { useState } from "react";
import { UploadCloud, FileSpreadsheet, LayoutDashboard, BrainCircuit, Globe2, BarChart4, ChevronRight, Calculator, MoveRight, X as XIcon, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import ReactECharts from 'echarts-for-react';
import { duckEngine } from "@/core/duckdb-engine";

export default function OmniAnalyticsPage() {
  const [fileIngested, setFileIngested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [schemaRows, setSchemaRows] = useState<any[]>([]);
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'treemap' | 'line'>('bar');
  const [tableName, setTableName] = useState<string>('');

  // PIVOT BUILDER STATE
  const [xAxisCol, setXAxisCol] = useState<string | null>(null);
  const [yAxisCol, setYAxisCol] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isAggregating, setIsAggregating] = useState(false);
  const [draggedCol, setDraggedCol] = useState<string | null>(null);

  const buildChart = async (x: string | null, y: string | null) => {
    if (!x || !tableName) return;
    setIsAggregating(true);
    try {
      let query = '';
      if (!y) {
        // Jika Y tidak ada, default ke COUNT(*) (Frekuensi)
        query = `SELECT ${x} as name, COUNT(*) as value FROM ${tableName} GROUP BY ${x} ORDER BY value DESC LIMIT 50;`;
      } else {
        // Jika Y ada, default ke SUM(Y)
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

  // Deteksi Tipe Kolom (Omni-Schema Introspector)
  const hasGeoColumns = schemaRows.some(s => s.column_name.toLowerCase().includes('lat') || s.column_name.toLowerCase().includes('lon') || s.column_name.toLowerCase().includes('prov') || s.column_name.toLowerCase().includes('kab'));
  const hasTimeColumns = schemaRows.some(s => s.column_name.toLowerCase().includes('date') || s.column_name.toLowerCase().includes('time') || s.column_name.toLowerCase().includes('tahun') || s.column_name.toLowerCase().includes('bulan') || s.column_type.includes('DATE') || s.column_type.includes('TIMESTAMP'));

  if (!fileIngested) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-24 h-24 bg-indigo-900/30 border border-indigo-500/30 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(79,70,229,0.2)]">
           <BrainCircuit className="w-12 h-12 text-indigo-500" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-widest uppercase mb-4">
          UNIVERSAL OMNIVERSE
        </h1>
        <p className="text-zinc-400 max-w-lg mb-10 text-sm">
          PUM Omni-Analytics mendeteksi struktur (DNA) data secara otomatis. Lempar file Parquet atau CSV apa pun ke dalam reaktor ini, dan sistem akan membangun Workspace secara spesifik untuk struktur tersebut.
        </p>

        <div {...getRootProps()} className={`w-full max-w-2xl border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer flex flex-col items-center justify-center gap-4
            ${isDragActive ? 'border-indigo-500 bg-indigo-950/20' : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-indigo-500/50'}
        `}>
          <input {...getInputProps()} />
          {loading ? (
             <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
               <span className="text-indigo-400 font-bold uppercase tracking-widest text-sm">Menelan Data ke WASM...</span>
             </div>
          ) : (
            <>
              <UploadCloud className={`w-12 h-12 ${isDragActive ? 'text-indigo-400 animate-bounce' : 'text-zinc-500'}`} />
              <div className="text-lg font-bold text-white uppercase tracking-widest">
                Drop Parquet Data Here
              </div>
              <span className="text-xs text-zinc-500 font-mono">.parquet / .csv supported • Zero Server Upload (100% In-Browser)</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-6rem)] flex flex-col gap-4">
      {/* HEADER DASHBOARD */}
      <div className="bg-zinc-900/60 border border-white/5 p-4 rounded-2xl flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
             <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
           </div>
           <div>
             <h2 className="text-lg font-black text-white tracking-widest uppercase">Universal Workspace</h2>
             <div className="text-[10px] text-zinc-500 font-mono mt-0.5">ACTIVE TABLE: <span className="text-indigo-400">{tableName}</span> • {dataPreview.length >= 100 ? '100+ Rows Loaded' : `${dataPreview.length} Rows Loaded`}</div>
           </div>
        </div>

        <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
           <button onClick={() => setChartType('bar')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${chartType === 'bar' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
             <LayoutDashboard className="w-4 h-4" /> QUANTUM PIVOT (BAR)
           </button>
           <button onClick={() => setChartType('treemap')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] ${chartType === 'treemap' ? 'bg-emerald-600 text-white' : 'text-emerald-500 hover:text-white hover:bg-white/5'}`}>
             <Globe2 className="w-4 h-4" /> GEO RADAR (TREEMAP)
           </button>
           <button onClick={() => setChartType('line')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] ${chartType === 'line' ? 'bg-amber-600 text-white' : 'text-amber-500 hover:text-white hover:bg-white/5'}`}>
             <BarChart4 className="w-4 h-4" /> TIME SERIES (LINE)
           </button>
        </div>
      </div>

      {/* WORKSPACE AREA */}
      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* OMNI-SCHEMA SIDEBAR */}
        <div className="w-64 bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden shrink-0">
           <div className="bg-black/40 p-3 border-b border-white/5 text-[10px] uppercase tracking-widest font-bold text-zinc-400">
             Introspected Schema ({schemaRows.length} Cols)
           </div>
           <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {schemaRows.map((col, idx) => (
                <div 
                   key={idx} 
                   draggable 
                   onDragStart={() => setDraggedCol(col.column_name)}
                   onDragEnd={() => setDraggedCol(null)}
                   className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg cursor-grab active:cursor-grabbing transition group"
                >
                   <span className="text-xs text-zinc-300 font-mono truncate w-[65%]" title={col.column_name}>{col.column_name}</span>
                   <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-bold group-hover:bg-indigo-900 group-hover:text-indigo-300 transition">
                     {col.column_type.includes('VARCHAR') ? 'TEXT' : col.column_type.includes('INT') || col.column_type.includes('DOUBLE') ? 'NUM' : 'MIX'}
                   </span>
                </div>
              ))}
           </div>
        </div>

        {/* ANALYTICS CANVAS */}
        <div className="flex-1 bg-zinc-900/20 border border-white/5 rounded-2xl overflow-hidden relative flex flex-col">
             <div className="w-full h-full flex flex-col">
                {/* BUILDER HEADER */}
                <div className="h-16 bg-black/40 border-b border-white/5 flex items-center px-6 gap-6 shrink-0">
                   <div className="flex items-center gap-2">
                     <Calculator className="w-4 h-4 text-zinc-500" />
                     <span className="text-xs text-zinc-500 font-bold uppercase tracking-widest">PIVOT BUILDER</span>
                   </div>
                   
                   {/* X AXIS DROP */}
                   <div 
                     onDragOver={(e) => e.preventDefault()}
                     onDrop={() => handleDropAxis('X')}
                     className={`w-64 h-10 border-2 border-dashed rounded-lg flex items-center justify-between px-3 transition-colors ${draggedCol ? 'border-indigo-500 bg-indigo-900/20' : 'border-zinc-700 bg-zinc-900/50'}`}
                   >
                     {xAxisCol ? (
                       <>
                         <span className="text-xs text-indigo-400 font-mono font-bold truncate">X: {xAxisCol}</span>
                         <button onClick={() => {setXAxisCol(null); setChartData([]);}} className="text-zinc-500 hover:text-red-400"><XIcon className="w-3 h-3"/></button>
                       </>
                     ) : (
                       <span className="text-[10px] text-zinc-500 uppercase font-bold">DRAG X-AXIS HERE (GROUP BY)</span>
                     )}
                   </div>

                   <MoveRight className="w-4 h-4 text-zinc-700" />

                   {/* Y AXIS DROP */}
                   <div 
                     onDragOver={(e) => e.preventDefault()}
                     onDrop={() => handleDropAxis('Y')}
                     className={`w-64 h-10 border-2 border-dashed rounded-lg flex items-center justify-between px-3 transition-colors ${draggedCol ? 'border-amber-500 bg-amber-900/20' : 'border-zinc-700 bg-zinc-900/50'}`}
                   >
                     {yAxisCol ? (
                       <>
                         <span className="text-xs text-amber-400 font-mono font-bold truncate">Y: SUM({yAxisCol})</span>
                         <button onClick={() => {setYAxisCol(null); buildChart(xAxisCol, null);}} className="text-zinc-500 hover:text-red-400"><XIcon className="w-3 h-3"/></button>
                       </>
                     ) : (
                       <span className="text-[10px] text-zinc-500 uppercase font-bold">DRAG Y-AXIS HERE (COUNT DEFAULT)</span>
                     )}
                   </div>
                </div>

                {/* CHART AREA */}
                <div className="flex-1 overflow-hidden p-6 bg-[#050505]">
                   {!xAxisCol ? (
                      <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                        <LayoutDashboard className="w-16 h-16 text-zinc-800 mb-4" />
                        <span className="text-zinc-500 uppercase tracking-widest font-bold text-sm">Tarik Kolom ke Kotak X-Axis untuk Membangun Grafik</span>
                      </div>
                   ) : isAggregating ? (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                        <span className="text-indigo-400 font-mono text-xs">DuckDB WebGL Aggregating Data...</span>
                      </div>
                   ) : (
                      <div className="w-full h-full bg-zinc-900/20 border border-white/5 rounded-3xl p-4">
                        {chartType === 'bar' && (
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
                              yAxis: { 
                                type: 'value',
                                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                                axisLabel: { color: '#71717a' }
                              },
                              series: [{
                                data: chartData.map(d => d.value),
                                type: 'bar',
                                itemStyle: { color: '#4f46e5', borderRadius: [4, 4, 0, 0] },
                                animationDuration: 1500,
                                animationEasing: 'cubicOut'
                              }]
                            }} 
                            style={{ height: '100%', width: '100%' }} 
                          />
                        )}

                        {chartType === 'treemap' && (
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
                                itemStyle: {
                                  borderColor: '#050505',
                                  borderWidth: 2,
                                  gapWidth: 1
                                },
                                label: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
                                color: ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7']
                              }]
                            }} 
                            style={{ height: '100%', width: '100%' }} 
                          />
                        )}

                        {chartType === 'line' && (
                          <ReactECharts 
                            option={{
                              backgroundColor: 'transparent',
                              tooltip: { trigger: 'axis' },
                              grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
                              dataZoom: [
                                { type: 'inside', start: 0, end: 100 },
                                { start: 0, end: 100, textStyle: { color: '#71717a' } }
                              ],
                              xAxis: { 
                                type: 'category', 
                                data: chartData.map(d => String(d.name)),
                                axisLabel: { color: '#71717a', fontSize: 10 }
                              },
                              yAxis: { 
                                type: 'value',
                                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                                axisLabel: { color: '#71717a' }
                              },
                              series: [{
                                data: chartData.map(d => d.value),
                                type: 'line',
                                smooth: true,
                                areaStyle: {
                                  color: {
                                    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                    colorStops: [{ offset: 0, color: 'rgba(245,158,11,0.5)' }, { offset: 1, color: 'rgba(245,158,11,0.05)' }]
                                  }
                                },
                                itemStyle: { color: '#f59e0b' },
                                animationDuration: 1500,
                                animationEasing: 'cubicOut'
                              }]
                            }} 
                            style={{ height: '100%', width: '100%' }} 
                          />
                        )}
                      </div>
                   )}
                </div>
             </div>
        </div>

      </div>
    </div>
  );
}
