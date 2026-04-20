"use client";

import { useEffect, useState } from "react";
import { UserPlus, ShieldAlert } from "lucide-react";
import { getUsers } from "@/app/actions/iam";
import { DataTable } from "@/components/iam/data-table";
import { UserModal } from "@/components/iam/user-modal";
import { ImportModal } from "@/components/iam/import-modal";
import { ApprovalInbox } from "@/components/iam/approval-inbox";
import { useTranslations } from "next-intl";

export default function IAMConsolePage() {
  const t = useTranslations("iam");
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t("desc")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
          >
            Import CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm shadow-blue-500/20"
          >
            <UserPlus className="w-4 h-4" />
            {t("addBtn")}
          </button>
        </div>
      </div>

      {/* IAM Security Highlight */}
      <div className="p-4 bg-orange-50 border border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50 rounded-xl flex items-start gap-4">
         <ShieldAlert className="w-6 h-6 text-orange-600 dark:text-orange-500 shrink-0 mt-0.5" />
         <div>
           <h4 className="font-medium text-orange-900 dark:text-orange-300">{t("ztTitle")}</h4>
           <p className="text-sm text-orange-800 dark:text-orange-400 mt-1">
             {t("ztDesc")}
           </p>
         </div>
      </div>

      {/* Main Table Area */}
      {loading ? (
        <div className="animate-pulse space-y-4">
           <div className="h-10 bg-gray-200 dark:bg-white/5 rounded-xl w-full"></div>
           <div className="h-64 bg-gray-100 dark:bg-white/[0.02] rounded-xl w-full"></div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out space-y-6">
          <ApprovalInbox />
          <div className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <DataTable initialUsers={users} />
          </div>
        </div>
      )}

      {/* Modal */}
      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchUsers}
      />
      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        onRefresh={fetchUsers}
      />
    </div>
  );
}
