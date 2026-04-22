"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe2, CheckCircle2 } from "lucide-react";
import { updateIdentityLanguages } from "@/app/actions/iam";

const AVAILABLE_LANGUAGES = [
  { code: "id", label: "Bahasa Indonesia (ID)" },
  { code: "en", label: "English (EN)" },
  { code: "ar", label: "Arabic (AR)" },
  { code: "jp", label: "Japanese (JP)" }
];

export function LanguageModal({ isOpen, onClose, onRefresh, userId, userName, initialLanguages }: { isOpen: boolean; onClose: () => void; onRefresh: () => void; userId: string | null; userName: string | null; initialLanguages: string[] }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [primaryLang, setPrimaryLang] = useState("id");
  const [secondaryLang, setSecondaryLang] = useState("none");
  const [tertiaryLang, setTertiaryLang] = useState("none");

  useEffect(() => {
    if (isOpen && initialLanguages) {
      setPrimaryLang(initialLanguages[0] || "id");
      setSecondaryLang(initialLanguages[1] || "none");
      setTertiaryLang(initialLanguages[2] || "none");
      setSuccess(false);
    }
  }, [isOpen, initialLanguages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    
    // Construct language array, remove "none" and remove duplicates
    const rawLangs = [primaryLang, secondaryLang, tertiaryLang].filter(l => l !== "none");
    const uniqueLangs = Array.from(new Set(rawLangs));

    const res = await updateIdentityLanguages(userId, uniqueLangs);

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
      alert(res.error || "Gagal memperbarui bahasa.");
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
                  <Globe2 className="w-5 h-5 text-indigo-500" />
                  Rosetta Protocol
                </h2>
                <button aria-label="Action button" onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-emerald-500">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">Bahasa Diperbarui!</p>
                  <p className="text-sm opacity-80 mt-1">Preferensi Rosetta Protocol tersimpan.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                    <p className="text-sm text-indigo-900 dark:text-indigo-300">
                      Atur urutan hierarki bahasa untuk pengguna <strong>{userName}</strong>. Bahasa Utama akan langsung aktif saat pengguna ini login.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-1.5 opacity-80">Bahasa Utama (Wajib)</label>
                    <select aria-label="Select option" 
                      value={primaryLang}
                      onChange={(e) => setPrimaryLang(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    >
                      {AVAILABLE_LANGUAGES.map(l => (
                        <option key={`p_${l.code}`} value={l.code}>{l.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80 text-gray-500">Bahasa Kedua (Opsional)</label>
                    <select aria-label="Select option" 
                      value={secondaryLang}
                      onChange={(e) => setSecondaryLang(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    >
                      <option value="none">-- Tidak Ada --</option>
                      {AVAILABLE_LANGUAGES.map(l => (
                        <option key={`s_${l.code}`} value={l.code}>{l.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80 text-gray-500">Bahasa Ketiga (Opsional)</label>
                    <select aria-label="Select option" 
                      value={tertiaryLang}
                      onChange={(e) => setTertiaryLang(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    >
                      <option value="none">-- Tidak Ada --</option>
                      {AVAILABLE_LANGUAGES.map(l => (
                        <option key={`t_${l.code}`} value={l.code}>{l.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button aria-label="Action button" type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition">
                      Batal
                    </button>
                    <button disabled={loading} type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                      {loading ? "Menyimpan..." : "Terapkan Rosetta"}
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
