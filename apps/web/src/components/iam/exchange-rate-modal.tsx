"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCcw, DollarSign, CheckCircle2, TrendingUp } from "lucide-react";
import { getExchangeRates, updateExchangeRate, syncExchangeRates } from "@/app/actions/currency";

export function ExchangeRateModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rates, setRates] = useState<any[]>([]);

  // Local state for editing
  const [editPair, setEditPair] = useState("");
  const [editRate, setEditRate] = useState<number | "">("");
  const [editIsAuto, setEditIsAuto] = useState(true);

  const fetchRates = async () => {
    const data = await getExchangeRates();
    setRates(data);
    if (data.length === 0) {
      setEditPair("USD_IDR");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      fetchRates();
      setEditPair("");
      setEditRate("");
      setEditIsAuto(true);
    }
  }, [isOpen]);

  const handleSync = async () => {
    setSyncing(true);
    const res = await syncExchangeRates();
    setSyncing(false);
    if (res.success) {
      await fetchRates();
    } else {
      alert("Gagal melakukan sinkronisasi auto-rate.");
    }
  };

  const handleSelectToEdit = (rateObj: any) => {
    setEditPair(rateObj.pair);
    setEditRate(rateObj.rate);
    setEditIsAuto(rateObj.isAuto);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editPair || editRate === "") return;
    
    setLoading(true);
    const res = await updateExchangeRate(editPair, Number(editRate), editIsAuto);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      await fetchRates();
      setTimeout(() => setSuccess(false), 2000);
    } else {
      alert(res.error || "Gagal menyimpan rate.");
    }
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto z-50 w-full max-w-2xl h-fit max-h-[90vh] bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
                Global Exchange Rate Engine
              </h2>
              <button aria-label="Action button" onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md transition text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Daftar Konversi Aktif</h3>
                <button 
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50 border border-blue-200"
                >
                  <RefreshCcw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Menyinkronkan...' : 'Sync Auto-Rates'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                {rates.map(r => (
                  <div 
                    key={r.id} 
                    onClick={() => handleSelectToEdit(r)}
                    className="p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121214] hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition shadow-sm group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{r.pair.replace('_', ' → ')}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest ${r.isAuto ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                        {r.isAuto ? 'AUTO' : 'MANUAL'}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {Number(r.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2 flex justify-between">
                      <span>Update: {new Date(r.lastUpdated).toLocaleDateString()}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition text-emerald-500 font-medium">Edit</span>
                    </div>
                  </div>
                ))}
                {rates.length === 0 && (
                  <div className="col-span-full py-8 text-center text-sm text-gray-400 border border-dashed rounded-xl">
                    Belum ada rate yang terdaftar. Gunakan tombol Sync atau tambah manual di bawah.
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-200 dark:border-white/10">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-500" /> 
                  Formulir Modifikasi Rate
                </h3>
                
                {success && (
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800/50 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5" /> Rate berhasil disimpan!
                  </div>
                )}

                <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider opacity-70">Pairing (e.g. USD_IDR)</label>
                     <input 
                       type="text" 
                       required
                       value={editPair}
                       onChange={(e) => setEditPair(e.target.value.toUpperCase())}
                       placeholder="USD_IDR"
                       className="w-full px-3 py-2 bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition uppercase font-mono"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider opacity-70">Nilai Konversi (Rate)</label>
                     <input 
                       type="number" 
                       required
                       step="any"
                       value={editRate}
                       onChange={(e) => setEditRate(e.target.value === "" ? "" : Number(e.target.value))}
                       placeholder="15000"
                       className="w-full px-3 py-2 bg-white dark:bg-[#0a0a0c] border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono"
                     />
                  </div>
                  <div className="col-span-full flex items-center justify-between mt-2">
                     <label className="flex items-center gap-3 cursor-pointer">
                       <input 
                         type="checkbox" 
                         checked={editIsAuto}
                         onChange={(e) => setEditIsAuto(e.target.checked)}
                         className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                       />
                       <span className="text-sm font-medium">Auto Sync Mode (Akan dioverride saat tombol Sync ditekan)</span>
                     </label>
                     <button 
                       disabled={loading || !editPair || editRate === ""} 
                       type="submit" 
                       className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                     >
                       {loading ? "Menyimpan..." : "Simpan Rate"}
                     </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
