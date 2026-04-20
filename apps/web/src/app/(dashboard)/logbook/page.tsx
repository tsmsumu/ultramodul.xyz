"use client";

import { useEffect, useState } from "react";
import { Shield, Eye, Clock, Activity, Fingerprint, Map, Terminal, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogEntry {
  id: string;
  timestamp: number;
  module: string;
  actionData: string;
  userId: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | "FATAL";
  cryptoHash: string;
}

export default function LogBookPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Simulasi SSE (Server-Sent Events) turunnya Log ala Matrix
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const cryptoSeed = Math.random().toString(36).substring(2, 15);
      const randomModules = ["IAM_MATRIX", "PUM_TAILOR", "CORE_AUTH", "EXPORT_HUB"];
      const randMod = randomModules[Math.floor(Math.random() * randomModules.length)];
      
      const newLog: LogEntry = {
        id: cryptoSeed,
        timestamp: Date.now(),
        module: randMod,
        actionData: JSON.stringify({ event: "PULSE_CHECK", latency: Math.floor(Math.random() * 50) + "ms" }),
        userId: "SYS_ORACLE",
        severity: Math.random() > 0.9 ? "WARNING" : "INFO",
        cryptoHash: "0x" + cryptoSeed.toUpperCase() + "..."
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50)); // Simpan max 50 log interaktif
    }, 2500);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col bg-[#050505] text-green-500 font-mono overflow-hidden">
      
      {/* Header Panopticon */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-green-500/20">
        <div>
          <h1 className="text-2xl font-bold tracking-widest flex items-center gap-3 text-green-400">
            <Eye className="w-8 h-8 animate-pulse text-red-500" />
            PANOPTICON LEDGER
          </h1>
          <p className="text-xs text-green-600 mt-1 uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-3 h-3" /> Immutable Blockchain-Lite Logger (Live Streaming SSE)
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setIsLive(!isLive)}
             className={`px-4 py-2 rounded border text-xs font-bold transition flex items-center gap-2
             ${isLive ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-green-500/10 border-green-500/50 text-green-500'}`}
           >
             <Activity className={isLive ? "animate-pulse" : ""} w-4 h-4 />
             {isLive ? "LIVE: ONLINE" : "LIVE: PAUSED"}
           </button>
        </div>
      </div>

      {/* Tampilan Tabel Log ala Terminal */}
      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-green-700 uppercase border-b border-green-500/20">
              <th className="py-3 px-2 font-normal"><Clock className="w-3 h-3 inline mr-1"/> Timestamp</th>
              <th className="py-3 px-2 font-normal"><Fingerprint className="w-3 h-3 inline mr-1"/> Hash (SHA256)</th>
              <th className="py-3 px-2 font-normal"><Map className="w-3 h-3 inline mr-1"/> Target Module</th>
              <th className="py-3 px-2 font-normal"><Terminal className="w-3 h-3 inline mr-1"/> Payload (JSON)</th>
              <th className="py-3 px-2 text-right font-normal">Revert</th>
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
                  className={`border-b border-green-500/10 text-xs transition-colors hover:bg-green-500/5 ${log.severity === 'WARNING' ? 'text-amber-500' : 'text-green-400'}`}
                >
                  <td className="py-3 px-2 opacity-70">
                    {new Date(log.timestamp).toISOString().split('T')[1].slice(0,-1)}
                  </td>
                  <td className="py-3 px-2 text-[10px] tracking-wider opacity-60">
                    {log.cryptoHash}
                  </td>
                  <td className="py-3 px-2 font-bold flex items-center gap-2">
                    {log.severity !== 'INFO' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                    [{log.module}]
                  </td>
                  <td className="py-3 px-2 opacity-80 break-all max-w-[300px]">
                    {log.actionData}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button className="text-[10px] px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-500 hover:bg-green-500 hover:text-black transition flex items-center gap-1 ml-auto">
                      <RotateCcw className="w-3 h-3" /> UNDO
                    </button>
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
         <span>Secure PUM Tailor Panopticon v1.0</span>
         <span>Connection: WSS://ENCRYPTED_LEDGER</span>
      </div>
    </div>
  );
}
