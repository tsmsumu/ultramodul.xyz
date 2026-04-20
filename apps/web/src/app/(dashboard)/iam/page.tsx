"use client";

import { useEffect, useState } from "react";
import { UserPlus, ShieldAlert } from "lucide-react";
import { getUsers } from "@/app/actions/iam";
import { DataTable } from "@/components/iam/data-table";
import { UserModal } from "@/components/iam/user-modal";
import { ApprovalInbox } from "@/components/iam/approval-inbox";

export default function IAMConsolePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          <h1 className="text-2xl font-semibold tracking-tight">Identity & Access Matrix</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Centralized management of all user permissions in one console. 
            All activities are automatically monitored by the Panopticon Logbook.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm shadow-blue-500/20"
        >
          <UserPlus className="w-4 h-4" />
          Add Identity
        </button>
      </div>

      {/* IAM Security Highlight */}
      <div className="p-4 bg-orange-50 border border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50 rounded-xl flex items-start gap-4">
         <ShieldAlert className="w-6 h-6 text-orange-600 dark:text-orange-500 shrink-0 mt-0.5" />
         <div>
           <h4 className="font-medium text-orange-900 dark:text-orange-300">Zero-Trust Zone Active</h4>
           <p className="text-sm text-orange-800 dark:text-orange-400 mt-1">
             All authorization changes in this console will be permanently recorded into the Audit Log ledger.
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
    </div>
  );
}
