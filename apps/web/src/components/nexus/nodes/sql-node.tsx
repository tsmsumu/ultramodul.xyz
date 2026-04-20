"use client";

import { Handle, Position } from "@xyflow/react";
import { Terminal, Settings } from "lucide-react";
import { useState } from "react";

export function SqlNode({ data, selected }: { data: any, selected?: boolean }) {
  const [sqlQuery, setSqlQuery] = useState(data.sqlQuery || "SELECT * FROM source_data\nWHERE 1=1");

  return (
    <div className={`bg-white dark:bg-[#09090b] border-2 rounded-xl shadow-2xl min-w-[320px] overflow-hidden transition-all ${selected ? 'border-amber-400 shadow-amber-500/20' : 'border-amber-500/50'}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-amber-500 border-2 border-white dark:border-[#09090b]" />
      
      <div className="bg-gradient-to-r from-amber-600 to-orange-500 text-white p-3 text-xs font-bold flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="tracking-wider">RAW SQL OVERRIDE</span>
        </div>
        <Settings className="w-3.5 h-3.5 cursor-pointer opacity-70 hover:opacity-100 hover:rotate-90 transition-all" />
      </div>
      
      <div className="p-3">
        <textarea
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          onKeyDownCapture={(e) => e.stopPropagation()} // Supaya tidak men-trigger Backspace pan/zoom React Flow
          rows={5}
          className="w-full text-xs font-mono bg-zinc-950 text-emerald-400 p-3 rounded-lg border border-white/10 outline-none focus:ring-1 focus:ring-amber-500 transition-all resize-none shadow-inner"
          placeholder="Tulis kueri DDL/DML sakti di sini..."
        />
        <p className="text-[10px] text-gray-500 mt-2 font-medium italic">
          *Peringatan: Kueri di Node ini secara paksa meniban aturan aliran data (Forging).
        </p>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-amber-500 border-2 border-white dark:border-[#09090b]" />
    </div>
  );
}
