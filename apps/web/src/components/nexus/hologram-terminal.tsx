"use client";

import { useEffect, useState } from "react";
import { X, Database, Play, Loader2 } from "lucide-react";
import { duckEngine } from "@/core/duckdb-engine";
import { executeRawNexusQuery } from "@/app/actions/queryEngine";

export function HologramTerminal({ nodeData, onClose }: { nodeData: any | null, onClose: () => void }) {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nodeData) return;
    
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData([]);
      setColumns([]);

      try {
        let rows = [];
        // Jika data dari SQLite Backend:
        if (nodeData.executionEngine === 'sqlite') {
           const query = nodeData.sqlQuery || `SELECT * FROM ${nodeData.dbName || nodeData.tableName} LIMIT 50`;
           const res = await executeRawNexusQuery(query);
           if (!res.success) throw new Error(res.error);
           rows = res.data;
        } else {
           // DuckDB Parquet Client
           rows = await duckEngine.previewData(nodeData.tableName || nodeData.dbName, 50);
        }

        if (!isMounted) return;

        if (rows.length > 0) {
          setColumns(Object.keys(rows[0]));
          setData(rows);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || "Failed to fetch data from DuckDB Wasm");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [nodeData]);

  if (!nodeData) return null;

  return (
    <div className="absolute bottom-4 left-4 right-80 mx-auto max-w-5xl h-64 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-xl border border-blue-500/30 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 z-20">
      
      {/* Terminal Top Bar */}
      <div className="h-10 bg-blue-600/10 dark:bg-blue-900/20 border-b border-blue-500/20 flex justify-between items-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-mono text-sm font-semibold tracking-wide text-blue-900 dark:text-blue-300">
            Terminal: <span className="text-pink-600 dark:text-pink-400">{nodeData.dbName || nodeData.tableName || 'SQL_NODE'}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 ${nodeData.executionEngine === 'sqlite' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
            <Play className="w-3 h-3"/> {nodeData.executionEngine === 'sqlite' ? 'SQLITE LIVE' : 'DUCKDB WASM'}
          </span>
          <button onClick={onClose} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer transition">
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Terminal Content Box */}
      <div className="flex-1 overflow-auto bg-[#fafafa] dark:bg-[#111113] p-1 custom-scrollbar">
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xs font-mono animate-pulse">Wasm Processor Reading...</span>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs font-mono text-red-500 bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded border border-red-200 dark:border-red-900/30">
              Error: {error}
            </span>
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs font-mono text-gray-500">Query returned 0 rows.</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="sticky top-0 bg-white/95 dark:bg-[#18181b]/95 backdrop-blur z-10 shadow-sm">
              <tr>
                <th className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-r border-gray-200 dark:border-white/10 text-center w-8">#</th>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2 text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-white/10">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-[11px] text-gray-700 dark:text-gray-300">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50 dark:hover:bg-white/[0.03] transition-colors border-b border-gray-100 dark:border-white/5">
                  <td className="px-3 py-1.5 border-r border-gray-100 dark:border-white/10 text-gray-400 text-center">{idx + 1}</td>
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-1.5 truncate max-w-[200px]" title={String(row[col])}>
                      {row[col] === null ? <span className="text-gray-400 italic">null</span> : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
