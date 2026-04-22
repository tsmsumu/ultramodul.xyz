"use client";

import { useEffect, useState } from "react";
import { getMandates, updateMandateStatus, createMandate } from "@/app/actions/mandate";
import { getUsers } from "@/app/actions/iam";
import { Clock, KeyRound, AlertCircle, CheckCircle2, XCircle, ShieldOff, Plus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function MandateWorkflowPage() {
  const t = useTranslations("mandate");
  const [mandates, setMandates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const data = await getMandates();
    const uData = await getUsers();
    setMandates(data);
    setUsers(uData);
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

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    // Convert jam ke detik
    const hoursStr = formData.get("validHours") as string;
    const hours = parseInt(hoursStr) || 24;
    const seconds = hours * 3600;

    await createMandate({
      delegatorId: "SYSTEM_ROOT", // Kita asumsikan Root/User yang lg login
      delegateeId: formData.get("delegateeId") as string,
      taskDescription: formData.get("taskDescription") as string,
      validUntilSeconds: seconds
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="flex justify-start">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition"
        >
          <Plus className="w-4 h-4" /> {t("btnDelegate")}
        </button>
      </div>

      {loading ? (
         <div className="animate-pulse space-y-4 pt-4">
           {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-white/5 rounded-xl w-full"></div>)}
         </div>
      ) : mandates.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-white/5 mt-8">
           <AlertCircle className="w-12 h-12 text-gray-400 mb-4 opacity-50" />
           <h3 className="text-lg font-medium">{t("emptyTitle")}</h3>
           <p className="text-sm text-gray-500 mt-1">{t("emptyDesc")}</p>
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
                    {t("deadline")} {new Date(m.validUntil).toLocaleString('id-ID')}
                  </span>
                </div>
                <h3 className="text-base font-medium mt-2">{m.taskDescription}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 pt-1">
                  {t("delegator")} <strong className="text-gray-700 dark:text-gray-300">{m.delegatorName}</strong> 
                  <span className="mx-2">➔</span>
                  {t("delegatee")} <strong className="text-gray-700 dark:text-gray-300">{m.delegateeName}</strong>
                </p>
              </div>

              <div className="flex gap-2">
                {m.status === "PENDING" && (
                  <>
                    <button onClick={() => handleAction(m.id, "ACTIVE")} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-950/30 dark:hover:bg-green-900/50 dark:text-green-400 rounded-lg text-sm font-medium transition cursor-pointer">
                      <CheckCircle2 className="w-4 h-4" /> {t("btnAccept")}
                    </button>
                    <button onClick={() => handleAction(m.id, "REJECTED")} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg text-sm font-medium transition cursor-pointer">
                      <XCircle className="w-4 h-4" /> {t("btnReject")}
                    </button>
                  </>
                )}
                {m.status === "ACTIVE" && (
                  <button onClick={() => handleAction(m.id, "REVOKED")} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:hover:bg-orange-900/50 dark:text-orange-400 rounded-lg text-sm font-medium transition cursor-pointer">
                    <ShieldOff className="w-4 h-4" /> {t("btnRevoke")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Buat Mandat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a0a0c] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
               <h3 className="font-semibold">{t("modalTitle")}</h3>
               <button onClick={() => setIsModalOpen(false)} title={t("btnCancel")} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><XCircle className="w-5 h-5"/></button>
            </div>
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
               <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{t("selectDelegatee")}</label>
                 <select name="delegateeId" aria-label={t("selectDelegatee")} required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none text-sm">
                   <option value="">{t("selectTarget")}</option>
                   {users.map(u => (
                     <option key={u.id} value={u.id} className="dark:bg-zinc-900">{u.name} ({u.username})</option>
                   ))}
                 </select>
               </div>
               
               <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{t("taskDesc")}</label>
                 <textarea name="taskDescription" aria-label={t("taskDesc")} required rows={3} placeholder={t("taskPlaceholder")} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none text-sm resize-none"></textarea>
               </div>

               <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">{t("validHours")}</label>
                 <input type="number" name="validHours" aria-label={t("validHours")} defaultValue="24" min="1" max="720" required className="w-full px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg outline-none text-sm" />
               </div>
               
               <div className="pt-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition">{t("btnCancel")}</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition flex items-center gap-2">
                     {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : t("btnPublish")}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
