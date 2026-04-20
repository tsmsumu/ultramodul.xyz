"use client";

import { Handle, Position } from "@xyflow/react";
import { BookOpen, Settings } from "lucide-react";
import { useState } from "react";

export function MetadataNode({ data }: { data: any }) {
  const [autoMode, setAutoMode] = useState(false); // Default Manual as requested

  return (
    <div className="bg-white dark:bg-[#111113] border-2 border-amber-500 rounded-xl shadow-xl min-w-[220px] overflow-hidden">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-amber-500" />
      
      <div className="bg-amber-500 text-white p-2 text-xs font-bold flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3 h-3" />
          <span>METADATA KAMUS</span>
        </div>
        <Settings className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" />
      </div>
      
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center bg-gray-100 dark:bg-white/5 rounded-md p-1">
          <button 
            onClick={() => setAutoMode(false)}
            className={`flex-1 text-[10px] py-1 font-bold rounded ${!autoMode ? "bg-white dark:bg-zinc-800 shadow" : "text-gray-500"}`}
          >
            MANUAL
          </button>
          <button 
            onClick={() => setAutoMode(true)}
            className={`flex-1 text-[10px] py-1 font-bold rounded ${autoMode ? "bg-amber-500 text-white shadow" : "text-gray-500"}`}
          >
            OTOMATIS
          </button>
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-sm mt-1">{data.label}</span>
        <span className="text-xs text-amber-600 dark:text-amber-500">{data.dbName}</span>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-amber-500 border-2 border-white dark:border-[#111113]" />
    </div>
  );
}
