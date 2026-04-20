"use client";

import { Handle, Position } from "@xyflow/react";
import { FileSpreadsheet, Settings } from "lucide-react";

export function FileNode({ data }: { data: any }) {
  return (
    <div className="bg-white dark:bg-[#111113] border-2 border-emerald-500 rounded-xl shadow-xl min-w-[200px] overflow-hidden">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-emerald-500" />
      
      <div className="bg-emerald-500 text-white p-2 text-xs font-bold flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-3 h-3" />
          <span>FILE UPLOAD</span>
        </div>
        <Settings className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" />
      </div>
      
      <div className="p-4 flex flex-col gap-1">
        <span className="font-bold text-gray-900 dark:text-white text-sm">{data.label}</span>
        <span className="text-xs text-gray-500">{data.fileName}</span>
      </div>

      <Handle type="source" position={Position.Right} className="w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#111113]" />
    </div>
  );
}
