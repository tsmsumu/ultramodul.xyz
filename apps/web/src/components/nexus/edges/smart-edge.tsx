"use client";

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { Link, Check, Settings2, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function SmartEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const [isOpen, setIsOpen] = useState(false);

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setIsOpen(!isOpen);
  };

  const onEdgeDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan z-50 flex flex-col items-center justify-center"
        >
           {/* Tombol Kaca Kabel */}
           <button
             onClick={onEdgeClick}
             className={`w-8 h-8 rounded-full shadow-lg border-2 flex items-center justify-center transition-all bg-white dark:bg-[#111113] active:scale-95 ${isOpen ? "border-indigo-600 dark:border-indigo-500 scale-110" : "border-gray-200 dark:border-white/20 hover:border-indigo-400"}`}
           >
             <Link className={`w-4 h-4 ${isOpen ? "text-indigo-600 dark:text-indigo-500" : "text-gray-500"}`} />
           </button>

           {/* Kaca Panel Pintar (Muncul Saat Kabel Diklik) */}
           {isOpen && (
             <div className="absolute top-10 w-64 bg-white/90 dark:bg-[#0a0a0c]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs"><Settings2 className="w-3 h-3"/> AUTO-JOIN SUGGESTION</div>
                   <button onClick={onEdgeDelete} className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 p-1.5 rounded-full transition"><Trash2 className="w-3 h-3"/></button>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-2 rounded-lg text-xs mb-3 text-indigo-800 dark:text-indigo-300">
                  <p className="font-semibold mb-1">Analyzing common columns...</p>
                  <p className="text-[10px] opacity-80">( DuckDB Simulation: 'NIK' column detected in both nodes. Using INNER JOIN )</p>
                </div>

                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  <Check className="w-3 h-3" /> APPROVE JOIN RELATION
                </button>
             </div>
           )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
