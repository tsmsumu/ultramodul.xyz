"use client";

import { useEffect, useState } from "react";
import { BookOpen, Search, ShieldAlert, Cpu, Activity } from "lucide-react";
import { getAuditLogs } from "@/app/actions/logbook";

export default function LogbookPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const data = await getAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredLogs = logs.filter(log => 
    JSON.stringify(log).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Audit Logbook Intel</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Instrumen pengintaian aktivitas sistem sekunder secara komprehensif.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Lacak ID, Aksi, atau Aktor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 pl-9 pr-4 py-2 bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-red-500/50 outline-none transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="p-4 bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-between shadow-sm">
           <div>
             <p className="text-sm text-gray-500 dark:text-gray-400">Total Log Terekam</p>
             <h4 className="text-2xl font-semibold mt-1">{loading ? "..." : logs.length}</h4>
           </div>
           <Activity className="w-8 h-8 text-blue-500 opacity-80" />
         </div>
         <div className="p-4 bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-between shadow-sm">
           <div>
             <p className="text-sm text-gray-500 dark:text-gray-400">Aksi Tingkat Kritis</p>
             <h4 className="text-2xl font-semibold mt-1 text-red-600 dark:text-red-400">
               {loading ? "..." : logs.filter(l => l.action.includes("REVOKE") || l.action.includes("DELETE")).length}
             </h4>
           </div>
           <ShieldAlert className="w-8 h-8 text-red-500 opacity-80" />
         </div>
         <div className="p-4 bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-between shadow-sm">
           <div>
             <p className="text-sm text-gray-500 dark:text-gray-400">Status Integritas Mesin</p>
             <h4 className="text-2xl font-semibold mt-1 text-emerald-600 dark:text-emerald-400">Aman</h4>
           </div>
           <Cpu className="w-8 h-8 text-emerald-500 opacity-80" />
         </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#0a0a0c] mt-4">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Timestamp (WIP)</th>
              <th className="px-6 py-4 font-medium">Aktor</th>
              <th className="px-6 py-4 font-medium">Aktivitas Sistem</th>
              <th className="px-6 py-4 font-medium">Target ID</th>
              <th className="px-6 py-4 font-medium">Data Metadata Raw</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center text-gray-500 animate-pulse">Menyelaraskan koneksi Intelejen...</td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center text-gray-500">Log intelijen nihil atau tidak ditemukan di basis data.</td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors font-mono text-xs">
                  <td className="px-6 py-3 border-l-2 border-transparent">
                    {new Date(log.createdAt).toLocaleString("id-ID", { hour12: false, fractionalSecondDigits: 3 })}
                  </td>
                  <td className="px-6 py-3 font-semibold">{log.actorName}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded border 
                      ${log.action.includes('CREATE') ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' :
                        log.action.includes('REVOKE') || log.action.includes('REJECT') ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' :
                        'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                      }
                    `}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400">
                     {log.target ? `${log.target.slice(0,12)}...` : '-'}
                  </td>
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {log.metadata || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
