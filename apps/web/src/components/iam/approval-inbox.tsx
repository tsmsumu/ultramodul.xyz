"use client";

import { useEffect, useState } from "react";
import { getPendingApprovals, resolveApproval } from "@/app/actions/approvals";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export function ApprovalInbox() {
  const [approvals, setApprovals] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const data = await getPendingApprovals();
    setApprovals(data);
  };

  const handleResolve = async (id: string, isApprove: boolean) => {
    const checker = "SYSTEM_ADMIN"; // Mocked
    await resolveApproval(id, checker, isApprove);
    load();
  };

  if (approvals.length === 0) return null;

  return (
    <div className="mb-8 border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-5">
       <div className="flex items-center gap-2 mb-4">
         <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
         <h2 className="font-semibold text-amber-800 dark:text-amber-500">Antrean Persidangan Hak Akses ({approvals.length})</h2>
       </div>

       <div className="space-y-3">
         {approvals.map(ap => (
           <div key={ap.id} className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-amber-100 dark:border-white/5 rounded-lg p-3">
             <div>
               <p className="text-sm font-medium">Modul: {ap.moduleName}</p>
               <div className="flex gap-2 text-xs text-gray-500 mt-1">
                 <span>User ID: {ap.targetUserId}</span>
                 <span>| Aturan Waktu: {ap.proposedTimeRule}</span>
                 <span>| Hak: {ap.proposedPermissions}</span>
               </div>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={() => handleResolve(ap.id, false)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition" title="Tolak">
                  <XCircle className="w-5 h-5" />
                </button>
                <button onClick={() => handleResolve(ap.id, true)} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition" title="Setujui">
                  <CheckCircle className="w-5 h-5" />
                </button>
             </div>
           </div>
         ))}
       </div>
    </div>
  );
}
