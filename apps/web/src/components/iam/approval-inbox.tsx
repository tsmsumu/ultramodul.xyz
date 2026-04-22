"use client";

import { useEffect, useState, useMemo } from "react";
import { getPendingApprovals, resolveApproval } from "@/app/actions/approvals";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react";

export function ApprovalInbox() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getPendingApprovals();
    setApprovals(data);
  };

  const handleResolve = async (id: string, type: string, isApprove: boolean) => {
    const checker = "SYSTEM_ADMIN"; // Mocked
    await resolveApproval(id, checker, isApprove, type);
    load();
    // Beritahu parent (page) bahwa ada user baru yg di-approve supaya tabel terre-render
    if (type === "IDENTITY" && typeof window !== "undefined") {
        window.dispatchEvent(new Event("iam-refresh"));
    }
  };

  const filteredApprovals = useMemo(() => {
    if (!searchQuery) return approvals;
    const q = searchQuery.toLowerCase();
    return approvals.filter(ap => 
      ap.targetUserId.toLowerCase().includes(q) || 
      (ap.moduleName || "").toLowerCase().includes(q) ||
      ap.type.toLowerCase().includes(q)
    );
  }, [approvals, searchQuery]);

  // Hapus return null agar Kotak Persidangan selalu muncul
  // if (approvals.length === 0) return null;
  return (
    <div className="mb-8 border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-5">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
         <div className="flex items-center gap-2">
           <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
           <h2 className="font-semibold text-amber-800 dark:text-amber-500">Antrean Persidangan Hak Akses ({approvals.length})</h2>
         </div>
         <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
            <input 
              type="text" 
              placeholder="Cari antrean..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/60 dark:bg-black/20 border border-amber-200 dark:border-amber-900/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-amber-900 dark:text-amber-200 placeholder:text-amber-600/50 transition"
            />
         </div>
       </div>

       <div className="space-y-3">
          {filteredApprovals.length === 0 && approvals.length > 0 ? (
             <div className="text-center py-4 text-amber-700/60 dark:text-amber-500/50 text-sm font-medium">
               Tidak ada antrean yang cocok dengan pencarian "{searchQuery}".
             </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="text-center py-6 text-amber-700/60 dark:text-amber-500/50 text-sm font-medium">
               Bebas Tugas! Tidak ada antrean mandat otorisasi yang menunggu persetujuan Bapak.
            </div>
          ) : (
            filteredApprovals.map(ap => (
              <div key={ap.id} className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-amber-100 dark:border-white/5 rounded-lg p-3 shadow-sm hover:shadow transition">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${ap.moduleName === 'DELETE_ACCOUNT' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                    {ap.type === 'IDENTITY' ? "Pendaftaran Karakter Baru" : ap.moduleName === 'PASSWORD_RESET' ? "Permohonan Ganti Sandi" : ap.moduleName === 'DELETE_ACCOUNT' ? "Vonis Pemusnahan Identitas" : "Akses Matriks: " + ap.moduleName}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2 font-mono">
                    <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">ID: {ap.targetUserId.split('-')[0]}</span>
                    {ap.moduleName !== 'PASSWORD_RESET' && ap.moduleName !== 'DELETE_ACCOUNT' && <span className="bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">Otoritas Opsi: {ap.proposedPermissions}</span>}
                    {ap.moduleName === 'PASSWORD_RESET' && <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200">Setel Ulang Sandi Ekstrem</span>}
                    {ap.moduleName === 'DELETE_ACCOUNT' && <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 uppercase font-black">Hapus Permanen!</span>}
                    <span className="bg-amber-100/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200/50">Waktu: {ap.proposedTimeRule}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <button aria-label="Action button" onClick={() => handleResolve(ap.id, ap.type, false)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-md transition shadow-sm shadow-red-500/20" title="Tolak">
                    <XCircle className="w-4 h-4" /> Tolak
                  </button>
                  <button aria-label="Action button" onClick={() => handleResolve(ap.id, ap.type, true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-md transition shadow-sm shadow-emerald-500/20" title="Setujui">
                    <CheckCircle className="w-4 h-4" /> Setujui
                  </button>
                </div>
              </div>
            ))
          )}
       </div>
    </div>
  );
}
