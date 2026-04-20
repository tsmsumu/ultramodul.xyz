"use client";

import { toggleIdentityStatus } from "@/app/actions/iam";
import { Lock, Unlock, ShieldAlert } from "lucide-react";
import { useState } from "react";

export function DataTable({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggle = async (id: string, currentStatus: string) => {
    setLoadingId(id);
    const res = await toggleIdentityStatus(id, currentStatus);
    if (res.success) {
      setUsers(users.map(u => u.id === id ? { ...u, status: currentStatus === "active" ? "inactive" : "active" } : u));
    }
    setLoadingId(null);
  };

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-white/5">
        <ShieldAlert className="w-12 h-12 text-gray-400 mb-4 opacity-50" />
        <h3 className="text-lg font-medium">Belum ada Identitas</h3>
        <p className="text-sm text-gray-500 mt-1">Sistem Matrix saat ini masih kosong.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#0a0a0c]">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-6 py-4 font-medium">Nomor Induk (NIK)</th>
            <th className="px-6 py-4 font-medium">Nama Lengkap</th>
            <th className="px-6 py-4 font-medium">Otoritas</th>
            <th className="px-6 py-4 font-medium">Status</th>
            <th className="px-6 py-4 font-medium text-right">Tindakan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4 font-mono text-xs">{user.nik}</td>
              <td className="px-6 py-4 font-medium">{user.name}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                  ${user.role === 'admin' ? 'bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800/50 dark:text-purple-400' : 
                    user.role === 'viewer' ? 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300' : 
                    'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400'}
                `}>
                  {user.role.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                  ${user.status === 'active' ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800/50 dark:text-green-400' : 
                    'bg-red-100 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400'}
                `}>
                  <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                  {user.status === 'active' ? 'Aktif' : 'Terblokir'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  disabled={loadingId === user.id}
                  onClick={() => handleToggle(user.id, user.status)}
                  className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition disabled:opacity-50"
                  title={user.status === 'active' ? 'Kunci Akses' : 'Buka Akses'}
                >
                  {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
