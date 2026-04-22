"use client";

import { Handle, Position } from "@xyflow/react";
import { FileSpreadsheet, Settings, UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { duckEngine } from "@/core/duckdb-engine";

export function FileNode({ data, id }: { data: any, id: string }) {
  const [loading, setLoading] = useState(false);
  const [fileAttached, setFileAttached] = useState<string | null>(null);
  const [tableAlias, setTableAlias] = useState<string | null>(null);
  const [schemaRows, setSchemaRows] = useState<any[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    setLoading(true);
    setFileAttached(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const uint8Buffer = new Uint8Array(buffer);
      const tableName = `table_${id.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // 1. Telan File ke DuckDB RAM
      const success = await duckEngine.ingestFile(tableName, uint8Buffer, file.name);
      
      if (success) {
        setTableAlias(tableName);
        // 2. Mata Elang: Rontgen Skema
        const schema = await duckEngine.discoverSchema(tableName);
        setSchemaRows(schema);
        
        // Simpan referensi nama tabel di Node Data agar Edge tahu
        if (data.onFileIngested) data.onFileIngested(id, tableName, schema);
      }
    } catch (e) {
      console.error(e);
      setFileAttached("Failed to ingest!");
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/octet-stream': ['.parquet'], 'text/csv': ['.csv'] } });

  return (
    <div className="bg-white dark:bg-[#111113] border-2 border-emerald-500 rounded-xl shadow-xl w-[260px] overflow-hidden transition-all">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500" />
      
      <div className="bg-emerald-500 text-white p-2 text-xs font-bold flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-3 h-3" />
          <span>FILE NODE (WASM)</span>
        </div>
        <Settings className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" />
      </div>
      
      <div className="p-3 flex flex-col gap-2">
        {!fileAttached ? (
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 min-h-[100px]
            ${isDragActive ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}
          `}>
             <input aria-label="Input field" placeholder="Enter value..." {...getInputProps()}  />
             <UploadCloud className={`w-6 h-6 ${isDragActive ? 'text-emerald-500' : 'text-gray-400'}`} />
             <span className="text-[10px] text-gray-500 leading-tight">
               {isDragActive ? 'Drop file here...' : 'Drag & Drop Parquet / CSV here'}
             </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-md border border-emerald-100 dark:border-emerald-800">
               <div className="flex items-center gap-2">
                 {loading ? <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                 <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 truncate" title={fileAttached}>{fileAttached}</span>
               </div>
               {tableAlias && (
                 <div className="flex gap-2 items-center bg-white/50 dark:bg-black/20 p-1 rounded font-mono text-[9px] text-emerald-700 dark:text-emerald-400">
                   <span className="font-bold opacity-70">ALIAS:</span> {tableAlias}
                 </div>
               )}
            </div>
            
            {schemaRows.length > 0 && (
              <div className="text-[9px] text-gray-500 flex flex-col gap-1 max-h-24 overflow-y-auto mt-1 custom-scrollbar">
                <div className="font-bold border-b border-gray-100 dark:border-white/10 pb-1 mb-1 text-gray-700 dark:text-gray-300">Auto-Detected Schema:</div>
                {schemaRows.map((r, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="truncate w-3/5 font-mono">{r.column_name}</span>
                    <span className="text-[8px] bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded text-emerald-600 dark:text-emerald-400 font-mono w-2/5 text-right truncate">{r.column_type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#111113]" />
    </div>
  );
}
