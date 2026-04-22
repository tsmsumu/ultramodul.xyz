"use client";

import { Handle, Position } from "@xyflow/react";
import { BookOpen, Settings, UploadCloud, CheckCircle2, Loader2, FileText } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

export function MetadataNode({ data, id }: { data: any, id: string }) {
  const [autoMode, setAutoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileAttached, setFileAttached] = useState<string | null>(null);
  const [dictionaryVariables, setDictionaryVariables] = useState<string[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    
    setLoading(true);
    setFileAttached(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      // Selalu baca sheet paling pertama
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Parsing Baris dari Excel (Array of Arrays)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      let discoveredVars: string[] = [];
      let headerRowIndex = -1;
      let varNameColIndex = -1;
      
      // 1. Auto-Discovery: Cari baris mana yang merupakan Header Utama
      for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
         const row = jsonData[i];
         if (!row) continue;
         for (let j = 0; j < row.length; j++) {
            const cell = String(row[j] || '').toLowerCase().trim();
            // Biasanya di kamus resmi ada 'Nama Variabel' (Label) dan 'Nama variabel' (Kolom DB)
            if (cell === 'nama variabel') {
               headerRowIndex = i;
               varNameColIndex = j; // Ambil index kolom ini
            }
         }
         if (headerRowIndex !== -1) break;
      }
      
      // 2. Ekstrak Data
      if (headerRowIndex !== -1 && varNameColIndex !== -1) {
         for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row[varNameColIndex]) {
               const varName = String(row[varNameColIndex]).trim();
               if (varName && isNaN(Number(varName))) {
                 discoveredVars.push(varName);
               }
            }
         }
      } else {
         // Fallback: Anggap baris pertama adalah header rata (Flat CSV Style)
         const headers = jsonData[0];
         if (headers && headers.length > 0) {
            discoveredVars = headers.map(h => String(h)).filter(h => h && isNaN(Number(h)));
         }
      }
      
      if (discoveredVars.length > 0) {
        setDictionaryVariables(discoveredVars);
        if (data.onFileIngested) {
           data.onFileIngested(id, `kamus_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`);
        }
        setAutoMode(true);
      } else {
        setFileAttached("Format Kamus Tidak Dikenali!");
      }
    } catch (e) {
      console.error(e);
      setFileAttached("Extracted failed!");
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    } 
  });

  return (
    <div className="bg-white dark:bg-[#111113] border-2 border-amber-500 rounded-xl shadow-xl w-[260px] overflow-hidden transition-all">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-amber-500" />
      
      <div className="bg-amber-500 text-white p-2 text-xs font-bold flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3 h-3" />
          <span>KAMUS DATA (.XLSX)</span>
        </div>
        <Settings className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" />
      </div>
      
      <div className="p-3 flex flex-col gap-2">
        <div className="flex justify-between items-center bg-gray-100 dark:bg-white/5 rounded-md p-1 mb-1">
          <button aria-label="Action button" 
            onClick={() => setAutoMode(false)}
            className={`flex-1 text-[10px] py-1 font-bold rounded transition ${!autoMode ? "bg-white dark:bg-zinc-800 shadow" : "text-gray-500"}`}
          >
            MANUAL
          </button>
          <button aria-label="Action button" 
            onClick={() => setAutoMode(true)}
            className={`flex-1 text-[10px] py-1 font-bold rounded transition ${autoMode ? "bg-amber-500 text-white shadow" : "text-gray-500"}`}
          >
            AUTO PARSE
          </button>
        </div>

        {!fileAttached ? (
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 min-h-[100px]
            ${isDragActive ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}
          `}>
             <input aria-label="Input field" placeholder="Enter value..." {...getInputProps()}  />
             <UploadCloud className={`w-6 h-6 ${isDragActive ? 'text-amber-500' : 'text-gray-400'}`} />
             <span className="text-[10px] text-gray-500 leading-tight">
               {isDragActive ? 'Drop excel here...' : 'Drift Kamus Data (.xlsx) here'}
             </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md border border-amber-100 dark:border-amber-800">
               {loading ? <Loader2 className="w-4 h-4 text-amber-600 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
               <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 truncate" title={fileAttached}>{fileAttached}</span>
            </div>
            
            {dictionaryVariables.length > 0 && (
              <div className="text-[9px] text-gray-500 flex flex-col gap-1 max-h-28 overflow-y-auto mt-1 custom-scrollbar">
                <div className="font-bold border-b border-gray-100 dark:border-white/10 pb-1 mb-1 flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <FileText className="w-3 h-3 text-amber-500" />
                  Recognized Variables:
                </div>
                {dictionaryVariables.map((val, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-zinc-900 px-2 py-1 rounded">
                    <span className="truncate flex-1 font-mono text-zinc-700 dark:text-zinc-300">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-amber-500 border-2 border-white dark:border-[#111113]" />
    </div>
  );
}
