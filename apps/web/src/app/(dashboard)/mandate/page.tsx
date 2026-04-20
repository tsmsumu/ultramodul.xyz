"use client";

import { useEffect, useState } from "react";
import { getMandates, updateMandateStatus } from "@/app/actions/mandate";
import { Clock, KeyRound, AlertCircle, CheckCircle2, XCircle, ShieldOff } from "lucide-react";

export default function MandateWorkflowPage() {
  const [mandates, setMandates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const data = await getMandates();
    setMandates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id: string, status: string) => {
    // In real app, actorId is from session. We use placeholder SYSTEM
    await updateMandateStatus(id, "SYSTEM", status);
    fetchData();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Delegasi & Mandat</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Engine perpindahan beban kerja (*Workflow*) seketika.
          </p>
        </div>
      </div>

      {loading ? (
         <div className="animate-pulse space-y-4 pt-4">
           {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-white/5 rounded-xl w-full"></div>)}
         </div>
      ) : mandates.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-white/5 mt-8">
           <AlertCircle className="w-12 h-12 text-gray-400 mb-4 opacity-50" />
           <h3 className="text-lg font-medium">Beban Kerja Kosong</h3>
           <p className="text-sm text-gray-500 mt-1">Belum ada delegasi tugas yang diterbitkan.</p>
         </div>
      ) : (
        <div className="grid gap-4 mt-8">
          {mandates.map((m) => (
            <div key={m.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-xl shadow-sm hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
              <div className="space-y-1 w-full md:w-1/2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-md border
                    ${m.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' :
                      m.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50' :
                      'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'}
                  `}>
                    {m.status}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Batas: {new Date(m.validUntil).toLocaleString('id-ID')}
                  </span>
                </div>
                <h3 className="text-base font-medium mt-2">{m.taskDescription}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 pt-1">
                  Pemberi: <strong className="text-gray-700 dark:text-gray-300">{m.delegatorName}</strong> 
                  <span className="mx-2">➔</span>
                  Penerima: <strong className="text-gray-700 dark:text-gray-300">{m.delegateeName}</strong>
                </p>
              </div>

              <div className="flex gap-2">
                {m.status === "PENDING" && (
                  <>
                    <button onClick={() => handleAction(m.id, "ACTIVE")} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950/30 dark:hover:bg-green-900/50 dark:text-green-400 rounded-lg text-sm font-medium transition cursor-pointer">
                      <CheckCircle2 className="w-4 h-4" /> Terima
                    </button>
                    <button onClick={() => handleAction(m.id, "REJECTED")} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg text-sm font-medium transition cursor-pointer">
                      <XCircle className="w-4 h-4" /> Tolak
                    </button>
                  </>
                )}
                {m.status === "ACTIVE" && (
                  <button onClick={() => handleAction(m.id, "REVOKED")} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:hover:bg-orange-900/50 dark:text-orange-400 rounded-lg text-sm font-medium transition cursor-pointer">
                    <ShieldOff className="w-4 h-4" /> Cabut Mandat
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
