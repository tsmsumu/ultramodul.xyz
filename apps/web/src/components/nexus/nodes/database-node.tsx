"use client";

import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Database, PlugZap, Play, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { executeRawNexusQuery } from "@/app/actions/queryEngine";
import { duckEngine } from "@/core/duckdb-engine";

export function DatabaseNode({ id, data, selected }: { id: string, data: any, selected?: boolean }) {
  const { deleteElements } = useReactFlow();
  const [dbName, setDbName] = useState(data.dbName || "");
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<"idle"|"loading"|"connected"|"error">("idle");

  return (
    <div className={`bg-white dark:bg-[#09090b] border-2 rounded-xl shadow-2xl min-w-[280px] overflow-hidden transition-all ${selected ? 'border-emerald-400 shadow-emerald-500/20' : 'border-emerald-500/50'}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#09090b]" />
      
      <div className="bg-linear-to-r from-emerald-600 to-emerald-500 text-white p-3 text-xs font-bold flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span className="tracking-wider">LIVE DB CONNECTOR</span>
        </div>
        <button aria-label="Action button" 
          onClick={(e) => { e.stopPropagation(); deleteElements({ nodes: [{ id }] }); }}
          className="p-1 cursor-pointer opacity-50 hover:opacity-100 hover:bg-white/20 rounded transition-all text-white hover:text-red-100"
          title="Hapus Node"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-500 mb-1 block">Tabel Target SQLite Backend</label>
          <div className="relative">
            <PlugZap className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input aria-label="Input field" 
              type="text" 
              value={dbName}
              onChange={(e) => {
                 setDbName(e.target.value);
                 setStatus("idle");
              }}
              placeholder="Contoh: users"
              className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100 font-mono transition-all"
              onKeyDownCapture={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <button aria-label="Action button" 
          onClick={async () => {
             if (!dbName) return;
             setIsConnecting(true);
             setStatus("loading");
             try {
               const res = await executeRawNexusQuery(`SELECT * FROM ${dbName}`);
               if (!res.success) throw new Error(res.error);
               const ok = await duckEngine.ingestJSONData(dbName, res.data);
               if(ok) {
                 setStatus("connected");
                 if (data.onFileIngested) data.onFileIngested(data.id, dbName);
               } else {
                 setStatus("error");
               }
             } catch(e) {
               setStatus("error");
             } finally {
               setIsConnecting(false);
             }
          }}
          disabled={status === 'connected' || isConnecting || !dbName}
          className="w-full py-1.5 px-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all flex justify-center items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? <Loader2 className="w-3 h-3 animate-spin"/> : <Play className="w-3 h-3"/>}
          {status === 'connected' ? 'DATA SEDOTED (DUCKDB)' : 'SEDOT KE MEMORI WASM'}
        </button>

        <div className={`flex items-center gap-2 p-2 rounded-lg border text-[10px] font-medium transition-colors
           ${status === 'connected' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/30' :
             status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-100 dark:border-red-800/30' :
             'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-500 border-gray-200 dark:border-white/10'
           }`}>
          <div className={`w-2 h-2 rounded-full ${
             status === 'loading' ? 'bg-amber-500 animate-pulse' :
             status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
             status === 'error' ? 'bg-red-500' :
             'bg-gray-400'
          }`} />
          <span>
            {status === 'loading' ? 'Loading Payload...' :
             status === 'connected' ? 'WASM Memory Engine Active' : 
             status === 'error' ? 'Gagal Menyedot!' :
             'Awaiting Configuration'}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#09090b]" />
    </div>
  );
}
