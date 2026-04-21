"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Save, BoxSelect, CheckSquare, Search } from "lucide-react";
import { getUserMatrix, saveUserMatrix } from "@/app/actions/matrix";
import { getRegisteredModuleIds } from "@/core/module-registry";

const MODULES = getRegisteredModuleIds();

const PERMISSIONS = [
  { id: "VIEW", label: "View (Lihat)", color: "text-blue-500" },
  { id: "MODIFY", label: "Modify (Ubah)", color: "text-amber-500" },
  { id: "UPLOAD", label: "Upload (Unggah)", color: "text-orange-500" },
  { id: "PRINT", label: "Print (Cetak)", color: "text-emerald-500" },
  { id: "EXPORT", label: "Export (Unduh)", color: "text-purple-500" }
];

export function MatrixDrawer({ 
  isOpen, 
  onClose, 
  userId, 
  userName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  userId: string | null; 
  userName: string | null;
}) {
  const [matrixData, setMatrixData] = useState<Record<string, string[]>>({});
  const [initialMatrixData, setInitialMatrixData] = useState<Record<string, string[]>>({});
  const [timeRules, setTimeRules] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen && userId) {
      loadData();
    }
  }, [isOpen, userId]);

  const loadData = async () => {
    setLoading(true);
    const mtx = await getUserMatrix(userId!);
    const structured: Record<string, string[]> = {};
    const tRules: Record<string, string> = {};
    
    mtx.forEach((item: any) => {
      try {
        structured[item.moduleName] = JSON.parse(item.permissions);
        tRules[item.moduleName] = item.timeRule || '24/7';
      } catch(e) {
        structured[item.moduleName] = [];
      }
    });

    // Populate missing models
    MODULES.forEach(mod => {
      if (!structured[mod]) structured[mod] = [];
      if (!tRules[mod]) tRules[mod] = '24/7';
    });

    setMatrixData(structured);
    setInitialMatrixData(JSON.parse(JSON.stringify(structured))); // Deep copy for immutability
    setTimeRules(tRules);
    setLoading(false);
  };

  const togglePermission = (mod: string, perm: string) => {
    setMatrixData(prev => {
      const current = prev[mod] || [];
      const updated = current.includes(perm) 
        ? current.filter(p => p !== perm) 
        : [...current, perm];
      return { ...prev, [mod]: updated };
    });
  };

  const handleSaveAll = async () => {
    setLoading(true);
    // Masuk ke tahap Maker-Checker Table, TAPI HANYA UNTUK MODUL YANG MENGALAMI PERUBAHAN
    for (const mod of Object.keys(matrixData)) {
       const currentPerms = matrixData[mod];
       const initialPerms = initialMatrixData[mod] || [];
       
       // Cek formasi hash murni
       const currentHash = [...currentPerms].sort().join(",");
       const initialHash = [...initialPerms].sort().join(",");

       if (currentHash !== initialHash) {
         await saveUserMatrix(userId!, mod, currentPerms, timeRules[mod] || '24/7');
       }
    }
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#09090b] shadow-2xl z-50 border-l border-gray-200 dark:border-white/10 flex flex-col"
          >
            <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                   <Shield className="w-5 h-5" />
                 </div>
                 <div>
                   <h2 className="font-semibold text-lg leading-tight">Granular Matrix</h2>
                   <p className="text-xs text-gray-500">{userName}</p>
                 </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 pt-4 pb-2 border-b border-gray-100 dark:border-white/10">
               <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Cari Spesifik Modul..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-24 bg-gray-100 dark:bg-white/5 rounded-xl"></div>
                  <div className="h-24 bg-gray-100 dark:bg-white/5 rounded-xl"></div>
                </div>
              ) : (
                MODULES.filter(mod => mod.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                   <div className="text-center py-10 text-gray-400 text-sm">Modul tidak ditemukan.</div>
                ) : (
                MODULES.filter(mod => mod.toLowerCase().includes(searchQuery.toLowerCase())).map(mod => (
                  <div key={mod} className="border border-gray-200 dark:border-white/10 rounded-xl p-4 bg-gray-50/50 dark:bg-white/[0.01]">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="flex items-center gap-2 font-medium text-sm"><BoxSelect className="w-4 h-4 opacity-50"/> Modul {mod}</h3>
                        <select 
                           value={timeRules[mod]}
                           onChange={(e) => setTimeRules(prev => ({...prev, [mod]: e.target.value}))}
                           className="text-xs bg-gray-100 dark:bg-white/10 rounded-md px-2 py-1 border-none focus:ring-0 cursor-pointer"
                        >
                           <option value="24/7">24/7 (Bebas)</option>
                           <option value="WORK_HOURS">Jam Kerja Saja</option>
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        {PERMISSIONS.map(p => {
                          const isActive = matrixData[mod]?.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => togglePermission(mod, p.id)}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs text-left transition-all
                                ${isActive 
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500/50' 
                                  : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5'}
                              `}
                            >
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isActive ? 'bg-indigo-500 border-indigo-500' : 'bg-white dark:bg-zinc-800 border-gray-300 dark:border-gray-600'}`}>
                                {isActive && <CheckSquare className="w-3 h-3 text-white" />}
                              </div>
                              <span className={`${isActive ? p.color : 'text-gray-600 dark:text-gray-400'}`}>{p.label}</span>
                            </button>
                          )
                        })}
                     </div>
                  </div>
                ))
                )
              )}
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
               <button 
                 disabled={loading}
                 onClick={handleSaveAll}
                 className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
               >
                 <Save className="w-4 h-4" /> {loading ? "Mengajukan Sidang..." : "Ajukan Persetujuan Baru"}
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
