"use client";

import { Handle, Position } from "@xyflow/react";
import { Settings, Droplets, Trash2, Type } from "lucide-react";
import { useState } from "react";

export function SanitizerNode({ data, selected }: { data: any, selected?: boolean }) {
  const [washNulls, setWashNulls] = useState(data.washNulls ?? true);
  const [trimUpper, setTrimUpper] = useState(data.trimUpper ?? true);

  return (
    <div className={`bg-white dark:bg-[#09090b] border-2 rounded-xl shadow-2xl min-w-[250px] overflow-hidden transition-all ${selected ? 'border-cyan-400 shadow-cyan-500/20' : 'border-cyan-500/50'}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-cyan-500 border-2 border-white dark:border-[#09090b]" />
      
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white p-3 text-xs font-bold flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4" />
          <span className="tracking-wider">AUTO REGEX CLEANER</span>
        </div>
        <Settings className="w-3.5 h-3.5 cursor-pointer opacity-70 hover:opacity-100 hover:rotate-90 transition-all" />
      </div>
      
      <div className="p-4 space-y-3">
        <label className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition">
          <input 
            type="checkbox" 
            checked={washNulls} 
            onChange={e => setWashNulls(e.target.checked)}
            className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
          />
          <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Trash2 className="w-3.5 h-3.5 opacity-70 mt-[-1px] text-red-500" />
            Bakar Baris NULL Kritis
          </div>
        </label>

        <label className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition">
          <input 
            type="checkbox" 
            checked={trimUpper} 
            onChange={e => setTrimUpper(e.target.checked)}
            className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500"
          />
          <div className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <Type className="w-4 h-4 opacity-70 mt-[-1px] text-cyan-500" />
            Trim & UPPERCASE Maksa
          </div>
        </label>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-cyan-500 border-2 border-white dark:border-[#09090b]" />
    </div>
  );
}
