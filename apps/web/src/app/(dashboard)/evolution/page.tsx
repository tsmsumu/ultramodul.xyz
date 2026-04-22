"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { duckEngine } from "@/core/duckdb-engine";
import { Dna, UploadCloud, CheckCircle2, AlertTriangle, Loader2, Syringe, Trash2, DownloadCloud, Stethoscope } from "lucide-react";
import { useTranslations } from "next-intl";

export default function EvolutionCenterPage() {
  const t = useTranslations("evolution");
  const [loading, setLoading] = useState(false);
  const [tableName, setTableName] = useState<string>('');
  
  // Profiler State
  const [totalRows, setTotalRows] = useState<number>(0);
  const [duplicateCount, setDuplicateCount] = useState<number>(0);
  const [schemaRows, setSchemaRows] = useState<any[]>([]);
  const [nullCounts, setNullCounts] = useState<Record<string, number>>({});
  
  const [healingLog, setHealingLog] = useState<string[]>([]);

  // 1. INGESTION ZONA
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setHealingLog(prev => [...prev, `[Sistem] Menelan file ${file.name}...`]);
    
    try {
      const buffer = await file.arrayBuffer();
      const safeTableName = "t_" + file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      
      const success = await duckEngine.ingestFile(safeTableName, new Uint8Array(buffer), file.name);
      
      if (success) {
        setTableName(safeTableName);
        setHealingLog(prev => [...prev, t("logExtractSuccess")]);
        await runDNAProfiler(safeTableName);
      } else {
        alert(t("logIngestFail"));
      }
    } catch (error) {
      console.error(error);
      alert(t("logIngestFail"));
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/octet-stream': ['.parquet'], 'text/csv': ['.csv'] } });

  // 2. DNA PROFILER (SCANNER)
  const runDNAProfiler = async (table: string) => {
    setLoading(true);
    setHealingLog(prev => [...prev, `[Scanner] Menjalankan rontgen matriks pada tabel...`]);
    
    try {
      // Get Schema
      const schema = await duckEngine.discoverSchema(table);
      setSchemaRows(schema);

      // Get Total Rows
      const rowCountRes = await duckEngine.executeRaw(`SELECT COUNT(*) as total FROM ${table}`);
      const total = Number(rowCountRes[0].total);
      setTotalRows(total);

      // Get Duplicates
      // A quick way: COUNT(*) - COUNT(DISTINCT *) for entire row.
      // In DuckDB: SELECT (SELECT COUNT(*) FROM t) - (SELECT COUNT(*) FROM (SELECT DISTINCT * FROM t)) as dups
      const dupRes = await duckEngine.executeRaw(`SELECT (SELECT COUNT(*) FROM ${table}) - (SELECT COUNT(*) FROM (SELECT DISTINCT * FROM ${table})) as dups`);
      const dups = Number(dupRes[0].dups);
      setDuplicateCount(dups);

      // Count NULLs per column (only first 10 columns for speed if many)
      const colsToScan = schema.slice(0, 15);
      let nullSelects = colsToScan.map(c => `SUM(CASE WHEN ${c.column_name} IS NULL THEN 1 ELSE 0) as null_${c.column_name}`).join(', ');
      
      if (nullSelects) {
        const nullRes = await duckEngine.executeRaw(`SELECT ${nullSelects} FROM ${table}`);
        if (nullRes.length > 0) {
          const counts: Record<string, number> = {};
          colsToScan.forEach(c => {
            counts[c.column_name] = Number(nullRes[0][`null_${c.column_name}`]);
          });
          setNullCounts(counts);
        }
      }

      setHealingLog(prev => [...prev, `[Scanner] Profiling selesai. Terdeteksi ${total} baris dan ${dups} duplikat.`]);
    } catch (error) {
      console.error(error);
      setHealingLog(prev => [...prev, t("logProfileFail", { error: String(error) })]);
    } finally {
      setLoading(false);
    }
  };

  // 3. MUTATION ENGINE
  const purgeDuplicates = async () => {
    if(!tableName) return;
    setLoading(true);
    setHealingLog(prev => [...prev, `[Mutasi] Mengeksekusi Operasi Pembersihan Duplikat...`]);
    try {
      await duckEngine.executeRaw(`CREATE OR REPLACE TABLE ${tableName} AS SELECT DISTINCT * FROM ${tableName}`);
      setHealingLog(prev => [...prev, `[Mutasi] Sukses! Seluruh baris ganda telah dimusnahkan.`]);
      await runDNAProfiler(tableName); // Rescan
    } catch (e) {
      setHealingLog(prev => [...prev, t("logMutateFail", { error: String(e) })]);
    } finally {
      setLoading(false);
    }
  };

  const imputeNulls = async () => {
    if(!tableName) return;
    setLoading(true);
    setHealingLog(prev => [...prev, `[Mutasi] Mengeksekusi Auto-Imputation (Penambalan Data Kosong)...`]);
    try {
      // For each column that has NULLs, patch it.
      for (const col of schemaRows) {
        const nullCnt = nullCounts[col.column_name] || 0;
        if (nullCnt > 0) {
          if (col.column_type.includes('INT') || col.column_type.includes('DOUBLE') || col.column_type.includes('DECIMAL')) {
            // numeric -> patch with median/avg or 0. Simple: 0
            await duckEngine.executeRaw(`UPDATE ${tableName} SET ${col.column_name} = 0 WHERE ${col.column_name} IS NULL`);
            setHealingLog(prev => [...prev, `[Suntikan] Menambal NULL pada kolom numerik '${col.column_name}' dengan angka 0.`]);
          } else {
            // string -> UNKNOWN
            await duckEngine.executeRaw(`UPDATE ${tableName} SET ${col.column_name} = 'UNKNOWN' WHERE ${col.column_name} IS NULL`);
            setHealingLog(prev => [...prev, `[Suntikan] Menambal NULL pada kolom teks '${col.column_name}' dengan 'UNKNOWN'.`]);
          }
        }
      }
      setHealingLog(prev => [...prev, `[Mutasi] Auto-Imputation selesai.`]);
      await runDNAProfiler(tableName);
    } catch (e) {
      setHealingLog(prev => [...prev, t("logImputeFail", { error: String(e) })]);
    } finally {
      setLoading(false);
    }
  };

  // 4. CRYO-EXPORT
  const exportParquet = async () => {
    if(!tableName) return;
    setLoading(true);
    setHealingLog(prev => [...prev, `[Cryo-Export] Membekukan tabel ke format Parquet...`]);
    try {
      const buffer = await duckEngine.exportToParquet(tableName, 'Clean_Data.parquet');
      if (buffer) {
        const blob = new Blob([buffer as any], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Clean_${tableName}.parquet`;
        a.click();
        URL.revokeObjectURL(url);
        setHealingLog(prev => [...prev, t("logExportSuccess")]);
      }
    } catch (e) {
      setHealingLog(prev => [...prev, t("logExportFail", { error: String(e) })]);
    } finally {
      setLoading(false);
    }
  };

  const overallHealth = totalRows === 0 ? 0 : Math.max(0, 100 - ((duplicateCount / totalRows) * 100) - (Object.values(nullCounts).reduce((a,b)=>a+b,0) / (totalRows * schemaRows.length) * 100));

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen p-8 text-zinc-100 flex flex-col gap-6">
      
      {/* HEADER */}
      <div className="flex items-center gap-6 bg-blue-950/20 p-6 rounded-3xl border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
        <div className="w-16 h-16 bg-blue-900/30 border border-blue-500/50 rounded-2xl flex items-center justify-center">
          <Dna className="w-8 h-8 text-blue-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-1">Data Evolution Center</h1>
          <p className="text-blue-400/80 text-sm">Mesin Cuci Laboratorium Data (Zero-Backend DuckDB). Membersihkan, menambal, dan menyembuhkan data secara lokal.</p>
        </div>
        {tableName && (
          <div className="text-right">
             <div className="text-xs text-blue-500 font-bold uppercase tracking-widest">DNA Health Score</div>
             <div className={`text-4xl font-black ${overallHealth > 90 ? 'text-emerald-400' : overallHealth > 70 ? 'text-amber-400' : 'text-red-500'}`}>
               {overallHealth.toFixed(1)}%
             </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* LEFT PANEL: DROPZONE & PROFILER */}
        <div className="col-span-5 flex flex-col gap-6">
           
           {!tableName ? (
             <div {...getRootProps()} className={`flex-1 border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-900/20' : 'border-zinc-800 bg-zinc-900/30 hover:border-blue-500/50'}`}>
               <input aria-label="Input field" placeholder="Enter value..." {...getInputProps()}  />
               {loading ? (
                 <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
               ) : (
                 <UploadCloud className="w-16 h-16 text-zinc-600 mb-4" />
               )}
               <h3 className="text-xl font-bold text-white mb-2">Drop Zona Karantina Data</h3>
               <p className="text-zinc-500 text-sm max-w-xs">Seret Parquet/CSV mentah ke sini. Semua proses cuci data akan dilakukan di RAM Browser Anda tanpa menggunakan Bandwidth/Server VPS.</p>
             </div>
           ) : (
             <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 flex-1 overflow-hidden flex flex-col">
               <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                 <Stethoscope className="w-4 h-4 text-blue-400" /> Hasil Profiler Matriks
               </h3>

               <div className="grid grid-cols-2 gap-4 mb-6 shrink-0">
                 <div className="bg-black/50 border border-white/5 p-4 rounded-2xl text-center">
                   <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Populasi</div>
                   <div className="text-2xl font-black text-white">{totalRows.toLocaleString()}</div>
                 </div>
                 <div className="bg-black/50 border border-red-500/20 p-4 rounded-2xl text-center">
                   <div className="text-[10px] text-red-500 uppercase tracking-widest font-bold">Sel Duplikat</div>
                   <div className="text-2xl font-black text-red-400">{duplicateCount.toLocaleString()}</div>
                 </div>
               </div>

               <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3">Infeksi Kolom Kosong (NULL)</div>
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                 {schemaRows.slice(0, 15).map((col, i) => {
                   const nulls = nullCounts[col.column_name] || 0;
                   const pct = totalRows ? ((nulls/totalRows)*100).toFixed(1) : "0.0";
                   return (
                     <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-white/5">
                       <div className="flex flex-col">
                         <span className="text-xs font-mono font-bold text-zinc-300">{col.column_name}</span>
                         <span className="text-[10px] text-zinc-600">{col.column_type}</span>
                       </div>
                       {nulls > 0 ? (
                         <div className="text-right">
                           <span className="text-xs font-bold text-amber-500">{nulls.toLocaleString()} NULL</span>
                           <div className="text-[10px] text-amber-500/50">{pct}% dari total</div>
                         </div>
                       ) : (
                         <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
                           <CheckCircle2 className="w-3 h-3" /> SEHAT
                         </div>
                       )}
                     </div>
                   );
                 })}
                 {schemaRows.length > 15 && <div className="text-center text-xs text-zinc-500 py-2">... dan {schemaRows.length - 15} kolom lainnya</div>}
               </div>
             </div>
           )}

        </div>

        {/* RIGHT PANEL: MUTATION & LOGS */}
        <div className="col-span-7 flex flex-col gap-6">
           
           <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6">
             <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Syringe className="w-4 h-4 text-emerald-400" /> Operasi Mutasi Bedah
             </h3>

             <div className="grid grid-cols-3 gap-4">
               <button 
                 disabled={!tableName || loading || duplicateCount === 0} 
                 onClick={purgeDuplicates}
                 className="flex flex-col items-center text-center p-4 bg-red-950/30 hover:bg-red-900/50 disabled:opacity-50 border border-red-500/30 rounded-2xl transition"
               >
                 <Trash2 className="w-6 h-6 text-red-400 mb-2" />
                 <span className="text-xs font-bold uppercase tracking-widest text-red-300">Purge Duplicates</span>
               </button>
               
               <button 
                 disabled={!tableName || loading} 
                 onClick={imputeNulls}
                 className="flex flex-col items-center text-center p-4 bg-amber-950/30 hover:bg-amber-900/50 disabled:opacity-50 border border-amber-500/30 rounded-2xl transition"
               >
                 <Syringe className="w-6 h-6 text-amber-400 mb-2" />
                 <span className="text-xs font-bold uppercase tracking-widest text-amber-300">Auto-Impute Nulls</span>
               </button>

               <button 
                 disabled={!tableName || loading} 
                 onClick={exportParquet}
                 className="flex flex-col items-center text-center p-4 bg-blue-950/30 hover:bg-blue-900/50 disabled:opacity-50 border border-blue-500/30 rounded-2xl transition"
               >
                 <DownloadCloud className="w-6 h-6 text-blue-400 mb-2" />
                 <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Cryo-Export Parquet</span>
               </button>
             </div>
           </div>

           <div className="bg-black flex-1 border border-white/5 rounded-3xl p-4 flex flex-col overflow-hidden">
             <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-4 px-2">Log Mesin Evolusi</div>
             <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-2 font-mono text-xs">
               {healingLog.map((log, idx) => {
                  let color = "text-zinc-400";
                  if(log.includes("Mutasi]")) color = "text-emerald-400";
                  if(log.includes("Error]")) color = "text-red-500 font-bold";
                  if(log.includes("Suntikan]")) color = "text-amber-400";
                  if(log.includes("Scanner]")) color = "text-blue-400";
                  return <div key={idx} className={color}>{log}</div>
               })}
             </div>
           </div>

        </div>

      </div>
    </div>
  );
}
