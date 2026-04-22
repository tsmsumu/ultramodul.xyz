"use client";

import { useEffect, useState, useRef } from "react";
import { Shield, Eye, Clock, Activity, Fingerprint, Map, Terminal, RotateCcw, Search, Download, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getRealLogs } from "@/app/actions/logger";

export default function LogBookPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const fetchLogs = async () => {
    const data = await getRealLogs({
       searchQuery: searchQuery || undefined,
       startDate: startDate || undefined,
       endDate: endDate || undefined,
       limit: 100
    });
    setLogs(data);
  };

  useEffect(() => {
    fetchLogs();
    
    // Polling Real-time untuk 100% Live Sync jika di posisi Live
    if (!isLive) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, [isLive, searchQuery, startDate, endDate]);

  const handleExport = () => {
     // Native CSV Export for logs!
     if(logs.length === 0) return;
     const headers = ["Timestamp", "Hash", "Actor", "Action Target", "Payload"];
     const rows = logs.map(l => [
        new Date(l.createdAt).toISOString(),
        l.id,
        l.actorId,
        `[${l.action}] ${l.target || ''}`,
        `"${JSON.stringify(l.metadata || {}).replace(/"/g, '""')}"`
     ]);
     const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.href = url;
     link.setAttribute("download", `panopticon_ledger_${Date.now()}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col bg-[#050505] text-green-500 font-mono overflow-hidden">
      
      {/* Header Panopticon */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-green-500/20 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest flex items-center gap-3 text-green-400">
            <Eye className="w-8 h-8 animate-pulse text-red-500" />
            PANOPTICON LEDGER
          </h1>
          <p className="text-xs text-green-600 mt-1 uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-3 h-3" /> Immutable Live Tracker (No Simulation)
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex bg-green-500/10 border border-green-500/30 rounded px-3 py-1.5 items-center gap-2">
             <Search className="w-3 h-3 text-green-600" />
             <input 
                type="text" 
                placeholder="Deep query..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-green-400 outline-none placeholder:text-green-800 w-32 focus:w-48 transition-all"
             />
           </div>

           <div className="flex bg-green-500/10 border border-green-500/30 rounded px-2 py-1.5 items-center gap-2">
             <Calendar className="w-3 h-3 text-green-600" />
             <input aria-label="Input field" placeholder="Enter value..." type="datetime-local" step="1" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent text-green-500 text-[10px] outline-none" title="Waktu Mulai" />
             <span className="text-green-800">-</span>
             <input aria-label="Input field" placeholder="Enter value..." type="datetime-local" step="1" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent text-green-500 text-[10px] outline-none" title="Waktu Berakhir" />
           </div>

           <button aria-label="Action button" 
             onClick={handleExport}
             className="px-3 py-1.5 rounded border border-green-500/50 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-black text-xs font-bold transition flex items-center gap-2"
           >
             <Download className="w-4 h-4" /> EXPORT PARQUET/CSV
           </button>

           <button aria-label="Action button" 
             onClick={() => setIsLive(!isLive)}
             className={`px-3 py-1.5 rounded border text-xs font-bold transition flex items-center gap-2
             ${isLive ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 border-green-500/50 text-green-500 hover:bg-green-500 hover:text-black'}`}
           >
             <Activity className={isLive ? "animate-pulse" : ""} w-4 h-4 />
             {isLive ? "LIVE" : "PAUSED"}
           </button>
        </div>
      </div>

      {/* Tampilan Tabel Log ala Terminal */}
      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-green-700 uppercase border-b border-green-500/20">
              <th className="py-3 px-2 font-normal whitespace-nowrap"><Clock className="w-3 h-3 inline mr-1"/> Timestamp</th>
              <th className="py-3 px-2 font-normal"><Fingerprint className="w-3 h-3 inline mr-1"/> Hash ID</th>
              <th className="py-3 px-2 font-normal"><Map className="w-3 h-3 inline mr-1"/> Action Target</th>
              <th className="py-3 px-2 font-normal"><Terminal className="w-3 h-3 inline mr-1"/> Payload (JSON)</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {logs.map((log) => (
                <motion.tr 
                  key={log.id}
                  initial={{ opacity: 0, y: -20, backgroundColor: "rgba(34, 197, 94, 0.2)" }}
                  animate={{ opacity: 1, y: 0, backgroundColor: "transparent" }}
                  exit={{ opacity: 0 }}
                  className={`border-b border-green-500/10 text-xs transition-colors hover:bg-green-500/5 ${log.action.includes('CRITICAL') || log.action.includes('EMERGENCY') ? 'text-amber-500' : 'text-green-400'}`}
                >
                  <td className="py-3 px-2 opacity-70 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('id-ID', { second: '2-digit', minute: '2-digit', hour: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-2 text-[10px] tracking-wider opacity-60">
                    ...{log.id.substring(max(0, log.id.length - 12))}
                  </td>
                  <td className="py-3 px-2 font-bold flex items-center gap-2">
                    {(log.action.includes('CRITICAL') || log.action.includes('EMERGENCY')) && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                    [{log.action}] {log.target}
                  </td>
                  <td className="py-3 px-2 opacity-80 break-all max-w-[300px]">
                    {JSON.stringify(log.metadata)}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center p-20 opacity-30">
            <Eye className="w-16 h-16 mb-4 animate-pulse" />
            <p className="text-sm tracking-widest">AWAITING SYSTEM SIGNALS...</p>
          </div>
        )}
      </div>
      
      {/* Footer / Status Bar */}
      <div className="mt-4 pt-3 border-t border-green-500/20 text-[10px] flex justify-between opacity-50 uppercase tracking-widest">
         <span>Secure PUM Panopticon LIVE</span>
         <span>Connection: NODE_SQLITE_STREAM</span>
      </div>
    </div>
  );
}

// Helper untuk trim ID 
function max(a: number, b: number) { return a > b ? a : b; }
