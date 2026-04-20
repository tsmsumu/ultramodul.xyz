"use client";

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react';
import { Link, Check, Settings2, Trash2, Cpu, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { duckEngine } from "@/core/duckdb-engine";

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
  source,
  target,
}: EdgeProps) {
  const { setEdges, getNode } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State Manual Override
  const [joinType, setJoinType] = useState('LEFT JOIN');
  const [leftCol, setLeftCol] = useState('');
  const [rightCol, setRightCol] = useState('');
  const [sourceCols, setSourceCols] = useState<any[]>([]);
  const [targetCols, setTargetCols] = useState<any[]>([]);

  // Neural Auto-Detect Logic (Mata Elang + Saraf Cerdas)
  useEffect(() => {
    if (isOpen) {
      const sourceNode = getNode(source);
      const targetNode = getNode(target);
      
      const sCols: any[] = (sourceNode?.data as any)?.schema || [];
      const tCols: any[] = (targetNode?.data as any)?.schema || [];
      
      setSourceCols(sCols);
      setTargetCols(tCols);

      // Auto-detect kolom yang namanya sama
      const commonCol = sCols.find((sc: any) => 
        tCols.some((tc: any) => tc.column_name.toLowerCase() === sc.column_name.toLowerCase())
      );

      if (commonCol && !leftCol && !rightCol) {
        setLeftCol(commonCol.column_name);
        setRightCol(commonCol.column_name);
      } else if (sCols.length > 0 && tCols.length > 0 && !leftCol && !rightCol) {
        setLeftCol(sCols[0].column_name);
        setRightCol(tCols[0].column_name);
      }
    }
  }, [isOpen, source, target, getNode, leftCol, rightCol]);

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setIsOpen(!isOpen);
  };

  const onEdgeDelete = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  const executeJoinLogic = async () => {
    if (!leftCol || !rightCol) return alert("Pilih kolom sumber dan target!");
    
    setIsProcessing(true);
    try {
      const sData = sourceNode?.data as any;
      const tData = targetNode?.data as any;
      const sTable = sData?.tableName;
      const tTable = tData?.tableName;

      if (!sTable || !tTable) {
        alert("Wah, filenya belum ditelan mesin Wasm! Lemparkan data dulu ke dalam Node.");
        setIsProcessing(false);
        return;
      }

      const hash = Math.floor(Math.random() * 10000);
      const joinedName = `v_gabungan_${hash}`;
      
      const sql = `CREATE OR REPLACE TABLE ${joinedName} AS SELECT * FROM ${sTable} ${joinType} ${tTable} ON ${sTable}.${leftCol} = ${tTable}.${rightCol};`;
      
      await duckEngine.executeRaw(sql);

      // Pancarkan Sinyal ke Kanvas Induk
      const event = new CustomEvent('NEXUS_TABLE_JOINED', { 
        detail: { 
          tableName: joinedName,
          sqlQuery: sql,
          sourceType: 'EDGE_JOIN',
          sourceX: targetNode ? targetNode.position.x + 250 : sourceX + 200,
          sourceY: targetNode ? targetNode.position.y : sourceY
        } 
      });
      window.dispatchEvent(event);

      setIsOpen(false);
    } catch (err: any) {
      alert("Gagal merajut data: " + err.message);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
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
               <div className="absolute top-10 w-72 bg-white/95 dark:bg-[#0a0a0c]/98 backdrop-blur-2xl border border-blue-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-4 overflow-hidden animate-in zoom-in-95 duration-200 z-[60]">
                  <div className="flex justify-between items-center mb-3">
                     <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] uppercase tracking-wider">
                       <Cpu className="w-3 h-3"/> Neural Joiner (PNE)
                     </div>
                     <button onClick={onEdgeDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition"><Trash2 className="w-3 h-3"/></button>
                  </div>

                  {leftCol === rightCol && leftCol !== '' ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-2 rounded-lg text-[10px] mb-3 text-emerald-800 dark:text-emerald-300">
                      <p className="font-bold flex items-center gap-1">✨ MATA ELANG AKTIF</p>
                      <p className="opacity-90 mt-1">Sistem otomatis mendeteksi kolom yang sama: <strong className="font-mono bg-emerald-100 dark:bg-emerald-800 px-1 rounded">{leftCol}</strong></p>
                    </div>
                  ) : null}

                  {/* FORM MANUAL OVERRIDE (Sesuai Permintaan Bapak) */}
                  <div className="flex flex-col gap-3 mb-4">
                     <div className="flex flex-col gap-1">
                       <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Metode Relasi (Join Type)</label>
                       <select value={joinType} onChange={e => setJoinType(e.target.value)} className="text-xs p-1.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-md focus:outline-none focus:border-indigo-500 font-mono">
                         <option value="LEFT JOIN">LEFT JOIN</option>
                         <option value="INNER JOIN">INNER JOIN</option>
                         <option value="RIGHT JOIN">RIGHT JOIN</option>
                         <option value="FULL OUTER JOIN">FULL OUTER JOIN</option>
                       </select>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-2 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center z-10 text-[8px] font-bold text-gray-500">=</div >
                        
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">A (Target Kiri)</label>
                          <select value={leftCol} onChange={e => setLeftCol(e.target.value)} className="text-[10px] p-1.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-md focus:outline-none focus:border-indigo-500 font-mono truncate">
                            <option value="">-- Pilih --</option>
                            {sourceCols.map((c:any) => <option key={c.column_name} value={c.column_name}>{c.column_name}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">B (Target Kanan)</label>
                          <select value={rightCol} onChange={e => setRightCol(e.target.value)} className="text-[10px] p-1.5 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-md focus:outline-none focus:border-indigo-500 font-mono truncate">
                            <option value="">-- Pilih --</option>
                            {targetCols.map((c:any) => <option key={c.column_name} value={c.column_name}>{c.column_name}</option>)}
                          </select>
                        </div>
                     </div>
                  </div>

                <button 
                  onClick={executeJoinLogic}
                  disabled={isProcessing}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  {isProcessing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Check className="w-3 h-3" />}
                  {isProcessing ? "MERAJUT DATA..." : "APPROVE JOIN RELATION"}
                </button>
             </div>
           )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
