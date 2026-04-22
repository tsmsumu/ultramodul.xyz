"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CircleDollarSign, CheckCircle2 } from "lucide-react";
import { updateIdentityCurrencies } from "@/app/actions/iam";

const AVAILABLE_CURRENCIES = [
  { code: "USD", label: "US Dollar (USD)" },
  { code: "IDR", label: "Indonesian Rupiah (IDR)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "JPY", label: "Japanese Yen (JPY)" }
];

export function CurrencyModal({ isOpen, onClose, onRefresh, userId, userName, initialCurrencies }: { isOpen: boolean; onClose: () => void; onRefresh: () => void; userId: string | null; userName: string | null; initialCurrencies: string[] }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [primaryCurr, setPrimaryCurr] = useState("USD");
  const [secondaryCurr, setSecondaryCurr] = useState("none");
  const [tertiaryCurr, setTertiaryCurr] = useState("none");

  useEffect(() => {
    if (isOpen && initialCurrencies) {
      setPrimaryCurr(initialCurrencies[0] || "USD");
      setSecondaryCurr(initialCurrencies[1] || "none");
      setTertiaryCurr(initialCurrencies[2] || "none");
      setSuccess(false);
    }
  }, [isOpen, initialCurrencies]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    
    // Construct currency array, remove "none" and remove duplicates
    const rawCurrs = [primaryCurr, secondaryCurr, tertiaryCurr].filter(c => c !== "none");
    const uniqueCurrs = Array.from(new Set(rawCurrs));

    const res = await updateIdentityCurrencies(userId, uniqueCurrs);

    if (res.success) {
      setSuccess(true);
      onRefresh();
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setLoading(false);
      }, 1500);
    } else {
      setLoading(false);
      alert(res.error || "Gagal memperbarui mata uang.");
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
            className="fixed inset-0 m-auto z-50 w-full max-w-md h-fit bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5 text-emerald-500" />
                  Multi-Currency Protocol
                </h2>
                <button aria-label="Action button" onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-emerald-500">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">Mata Uang Diperbarui!</p>
                  <p className="text-sm opacity-80 mt-1">Preferensi Multi-Currency tersimpan.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <p className="text-sm text-emerald-900 dark:text-emerald-300">
                      Atur urutan hierarki mata uang untuk pengguna <strong>{userName}</strong>. Mata Uang Utama akan menjadi default saat pengguna ini login.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1.5 opacity-80">Mata Uang Utama (Wajib)</label>
                    <select aria-label="Select option" 
                      value={primaryCurr}
                      onChange={(e) => setPrimaryCurr(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono"
                    >
                      {AVAILABLE_CURRENCIES.map(c => (
                        <option key={`p_${c.code}`} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80 text-gray-500">Mata Uang Kedua (Opsional)</label>
                    <select aria-label="Select option" 
                      value={secondaryCurr}
                      onChange={(e) => setSecondaryCurr(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono"
                    >
                      <option value="none">-- Tidak Ada --</option>
                      {AVAILABLE_CURRENCIES.map(c => (
                        <option key={`s_${c.code}`} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80 text-gray-500">Mata Uang Ketiga (Opsional)</label>
                    <select aria-label="Select option" 
                      value={tertiaryCurr}
                      onChange={(e) => setTertiaryCurr(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition font-mono"
                    >
                      <option value="none">-- Tidak Ada --</option>
                      {AVAILABLE_CURRENCIES.map(c => (
                        <option key={`t_${c.code}`} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button aria-label="Action button" type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition">
                      Batal
                    </button>
                    <button disabled={loading} type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                      {loading ? "Menyimpan..." : "Terapkan Currency"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
