"use client";

import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Server, Settings, PlugZap, Play, Loader2, Trash2, KeyRound, Database as DbIcon, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { executeOmniDBQuery } from "@/app/actions/omniEngine";
import { duckEngine } from "@/core/duckdb-engine";

export function OmniDBNode({ id, data, selected }: { id: string, data: any, selected?: boolean }) {
  const { deleteElements } = useReactFlow();
  
  const [engine, setEngine] = useState(data.engine || "postgresql");
  const [host, setHost] = useState(data.host || "");
  const [port, setPort] = useState(data.port || "5432");
  const [dbName, setDbName] = useState(data.dbName || "");
  const [username, setUsername] = useState(data.username || "");
  const [password, setPassword] = useState(data.password || "");
  const [sqlQuery, setSqlQuery] = useState(data.sqlQuery || "SELECT * FROM public.users LIMIT 100");

  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<"idle"|"loading"|"connected"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const colors: Record<string, string> = {
    postgresql: "from-blue-700 to-blue-500 border-blue-500",
    mysql: "from-orange-600 to-yellow-500 border-orange-500",
    mssql: "from-red-700 to-red-500 border-red-500"
  };

  const handleEngineChange = (val: string) => {
    setEngine(val);
    setStatus("idle");
    if (val === 'postgresql') { setPort("5432"); setSqlQuery("SELECT * FROM public.users LIMIT 100"); }
    if (val === 'mysql') { setPort("3306"); setSqlQuery("SELECT * FROM users LIMIT 100"); }
    if (val === 'mssql') { setPort("1433"); setSqlQuery("SELECT * FROM dbo.users"); }
  };

  const activeColor = colors[engine] || colors.postgresql;

  return (
    <div className={`bg-white dark:bg-[#09090b] border-2 rounded-xl shadow-2xl min-w-[320px] overflow-hidden transition-all ${selected ? 'shadow-blue-500/20 shadow-xl' : ''}`} style={{ borderColor: selected ? '#3b82f6' : '#1e3a8a' }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white dark:border-[#09090b]" />
      
      <div className={`bg-linear-to-r ${activeColor} text-white p-3 text-xs font-bold flex justify-between items-center shadow-sm`}>
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4" />
          <span className="tracking-wider uppercase">OMNI DB CONNECTOR</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); deleteElements({ nodes: [{ id }] }); }}
          className="p-1 cursor-pointer opacity-50 hover:opacity-100 hover:bg-white/20 rounded transition-all text-white hover:text-red-100"
          title="Hapus Node"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        {/* Engine Selector */}
        <div>
          <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 mb-1 block">Dialect Engine</label>
          <select 
             value={engine} 
             onChange={(e) => handleEngineChange(e.target.value)}
             className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 font-bold"
          >
            <option value="postgresql">🐘 PostgreSQL</option>
            <option value="mysql">🐬 MySQL</option>
            <option value="mssql">🪟 Microsoft SQL Server</option>
          </select>
        </div>

        <div className="flex gap-2">
           <div className="flex-1">
             <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1 block">Host / IP</label>
             <input type="text" value={host} onChange={e => { setHost(e.target.value); setStatus("idle"); }} placeholder="127.0.0.1" className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none font-mono" />
           </div>
           <div className="w-16">
             <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1 block">Port</label>
             <input type="text" value={port} onChange={e => { setPort(e.target.value); setStatus("idle"); }} className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none font-mono text-center" />
           </div>
        </div>

        <div className="flex gap-2">
           <div className="flex-1">
             <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Username</label>
             <input type="text" value={username} onChange={e => { setUsername(e.target.value); setStatus("idle"); }} placeholder="sa / root" className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none font-mono" />
           </div>
           <div className="flex-1">
             <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1 flex items-center gap-1"><KeyRound className="w-3 h-3"/> Password</label>
             <input type="password" value={password} onChange={e => { setPassword(e.target.value); setStatus("idle"); }} placeholder="••••••••" className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none font-mono" />
           </div>
        </div>

        <div>
           <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1 flex items-center gap-1"><DbIcon className="w-3 h-3"/> Catalog / DB</label>
           <input type="text" value={dbName} onChange={e => { setDbName(e.target.value); setStatus("idle"); }} placeholder="master" className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none font-mono" />
        </div>

        <div>
           <label className="text-[10px] uppercase font-bold tracking-widest text-blue-500 mb-1 flex items-center gap-1 block">SQL Extraction Query</label>
           <textarea 
             value={sqlQuery} 
             onChange={e => { setSqlQuery(e.target.value); setStatus("idle"); }} 
             rows={2}
             className="w-full px-2 py-1.5 text-[10px] bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-blue-900 dark:text-blue-300 font-mono resize-none custom-scrollbar" 
           />
        </div>

        <button 
          onClick={async () => {
             if (!host || !dbName || !username || !sqlQuery) return;
             setIsConnecting(true);
             setStatus("loading");
             setErrorMsg(null);
             try {
               const res = await executeOmniDBQuery({ engine, host, port: parseInt(port), database: dbName, user: username, password }, sqlQuery);
               if (!res.success) throw new Error(res.error);
               
               // Sanitize virtual table name to prevent SQL Injection in DuckDB schema
               const virtualTableName = `omni_${engine}_${id.replace('node_','').replace(/-/g,'_')}`;
               
               const ok = await duckEngine.ingestJSONData(virtualTableName, res.data);
               if(ok) {
                 setStatus("connected");
                 if (data.onFileIngested) data.onFileIngested(id, virtualTableName);
               } else {
                 throw new Error("DuckDB Wasm failed to Ingest Data");
               }
             } catch(e: any) {
               setStatus("error");
               setErrorMsg(e.message);
             } finally {
               setIsConnecting(false);
             }
          }}
          disabled={status === 'connected' || isConnecting || !host || !dbName || !sqlQuery}
          className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <PlugZap className="w-3.5 h-3.5"/>}
          {status === 'connected' ? 'DATA SEDOTED (DUCKDB)' : 'JALANKAN INGESTOR KE WASM'}
        </button>

        {status === 'error' && (
          <div className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded text-[9px] text-red-600 dark:text-red-400 font-mono overflow-x-auto whitespace-pre-wrap">
            {errorMsg}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-blue-500 border-2 border-white dark:border-[#09090b]" />
    </div>
  );
}
