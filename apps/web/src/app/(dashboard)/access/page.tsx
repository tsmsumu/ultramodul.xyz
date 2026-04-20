"use client";

import { useEffect, useState } from "react";
import { BoxSelect, Save, Loader2, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { getUsers } from "@/app/actions/iam";
import { getUserMatrix, saveUserMatrix } from "@/app/actions/matrix";
import { ModuleRegistry, getRegisteredModuleIds } from "@/core/module-registry";
import { motion } from "framer-motion";

export default function AccessMatrixPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  
  // State for user's matrix: Record<moduleName, string[]>
  const [matrix, setMatrix] = useState<Record<string, string[]>>({});

  useEffect(() => {
    getUsers().then(data => {
      setUsers(data);
      if (data.length > 0) handleSelectUser(data[0].id);
      setLoading(false);
    });
  }, []);

  const handleSelectUser = async (userId: string) => {
    setSelectedUser(userId);
    const dbMatrix = await getUserMatrix(userId);
    const mt: Record<string, string[]> = {};
    dbMatrix.forEach((row) => {
      try {
        mt[row.moduleName] = JSON.parse(row.permissions);
      } catch(e) {}
    });
    setMatrix(mt);
  };

  const handleToggle = (moduleName: string, perm: string) => {
    setMatrix(prev => {
      const current = prev[moduleName] || [];
      const updated = current.includes(perm) 
        ? current.filter(p => p !== perm) 
        : [...current, perm];
      return { ...prev, [moduleName]: updated };
    });
  };

  const handleSaveModule = async (moduleName: string) => {
    if (!selectedUser) return;
    setSaving(moduleName);
    const perms = matrix[moduleName] || [];
    await saveUserMatrix(selectedUser, moduleName, perms, "24/7");
    setSaving(null);
  };

  if (loading) return <div className="p-8 text-white"><Loader2 className="animate-spin w-8 h-8" /></div>;

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
          <BoxSelect className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-widest uppercase">Active Identity Matrix</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 uppercase font-mono tracking-widest">
            Cross-Module Authority Grid (LIVE)
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Kolom Kiri: Selector User */}
        <div className="w-full lg:w-1/3 space-y-4">
           <div className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/5">
             <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center gap-2">
               <Search className="w-4 h-4 text-gray-500" />
               <input type="text" placeholder="Cari Universal ID..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-zinc-600" />
             </div>
             <div className="max-h-[500px] overflow-y-auto p-2 space-y-1">
               {users.map(u => (
                 <button 
                   key={u.id}
                   onClick={() => handleSelectUser(u.id)}
                   className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                     selectedUser === u.id 
                     ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 shadow-sm" 
                     : "hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent"
                   }`}
                 >
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedUser === u.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/10'}`}>
                      <User className="w-4 h-4" />
                   </div>
                   <div className="overflow-hidden">
                     <p className="font-bold text-sm truncate">{u.name}</p>
                     <p className="text-xs opacity-60 font-mono tracking-widest truncate">{u.username}</p>
                   </div>
                 </button>
               ))}
             </div>
           </div>
        </div>

        {/* Kolom Kanan: Matrix Toggles */}
        <div className="w-full lg:w-2/3">
           <div className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/5">
             <div className="p-6 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
                <h3 className="text-lg font-bold">Matrix Configuration</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">Assign module clearance levels directly to SQLite.</p>
             </div>
             
             <div className="p-0">
               {ModuleRegistry.map((mod, idx) => {
                 const perms = matrix[mod.id] || [];
                 return (
                   <div key={mod.id} className="p-4 md:p-6 border-b border-gray-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors">
                     
                     <div className="flex items-center gap-4 w-full md:w-1/3">
                       <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                         <mod.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                       </div>
                       <div>
                         <p className="font-bold text-sm">{mod.name}</p>
                         <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{mod.category}</p>
                       </div>
                     </div>

                     <div className="flex flex-wrap items-center gap-3 flex-1">
                       {["VIEW", "MODIFY", "UPLOAD", "EXPORT", "PRINT"].map((p) => (
                         <label key={p} className="flex items-center gap-2 cursor-pointer group" onClick={() => handleToggle(mod.id, p)}>
                           <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              perms.includes(p) 
                              ? "bg-emerald-500 border-emerald-500" 
                              : "border-gray-300 dark:border-gray-600 group-hover:border-emerald-500"
                           }`}>
                             {perms.includes(p) && <div className="w-2 h-2 bg-white rounded-sm" />}
                           </div>
                           <span className={`text-xs font-bold tracking-wider ${perms.includes(p) ? 'text-emerald-500' : 'text-gray-500'}`}>{p}</span>
                         </label>
                       ))}
                     </div>

                     <button 
                       onClick={() => handleSaveModule(mod.id)}
                       disabled={saving === mod.id}
                       className="shrink-0 px-4 py-2 border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg text-xs font-bold uppercase tracking-widest transition flex items-center gap-2"
                     >
                       {saving === mod.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3" />}
                       Save
                     </button>
                   </div>
                 );
               })}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
