"use client";

import { Handle, Position } from "@xyflow/react";
import { Database, Settings, PlugZap } from "lucide-react";
import { useState } from "react";

export function DatabaseNode({ data, selected }: { data: any, selected?: boolean }) {
  const [dbUrl, setDbUrl] = useState(data.dbUrl || "");

  return (
    <div className={`bg-white dark:bg-[#09090b] border-2 rounded-xl shadow-2xl min-w-[280px] overflow-hidden transition-all ${selected ? 'border-emerald-400 shadow-emerald-500/20' : 'border-emerald-500/50'}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#09090b]" />
      
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-3 text-xs font-bold flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span className="tracking-wider">LIVE DB CONNECTOR</span>
        </div>
        <Settings className="w-3.5 h-3.5 cursor-pointer opacity-70 hover:opacity-100 hover:rotate-90 transition-all" />
      </div>
      
      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-500 mb-1 block">Connection String (PG/MySQL)</label>
          <div className="relative">
            <PlugZap className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input 
              type="password" 
              value={dbUrl}
              onChange={(e) => setDbUrl(e.target.value)}
              placeholder="postgres://user:pass@host/db"
              className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100 font-mono transition-all"
              onKeyDownCapture={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
          <div className={`w-2 h-2 rounded-full ${dbUrl ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-400">
            {dbUrl ? 'Ready to Establish Connection' : 'Awaiting Connection URL'}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#09090b]" />
    </div>
  );
}
