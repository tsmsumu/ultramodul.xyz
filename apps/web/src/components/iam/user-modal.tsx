"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, CheckCircle2, Shuffle, Copy } from "lucide-react";
import { createIdentity } from "@/app/actions/iam";

export function UserModal({ isOpen, onClose, onRefresh }: { isOpen: boolean; onClose: () => void; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedPass, setGeneratedPass] = useState("");

  const generatePass = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setGeneratedPass(pass);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPass);
    alert("Password tersalin!");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await createIdentity({
      nik: formData.get("nik") as string,
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      plainPassword: generatedPass || undefined
    });

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
      alert("Gagal menambahkan identitas.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto z-50 w-full max-w-md h-fit bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                  Tambah Identitas
                </h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-green-500">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">Identitas Tersimpan!</p>
                  <p className="text-sm opacity-80 mt-1">Audit Log otomatis tercatat.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">Nomor Induk Kependudukan (NIK)</label>
                    <input required name="nik" pattern="[0-9]{16}" title="16 Digit NIK" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Masukkan 16 angka NIK..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">Nama Lengkap</label>
                    <input required name="name" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Nama sesuai identitas..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">Hak Akses (Role)</label>
                    <select required name="role" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none">
                      <option value="user" className="dark:bg-zinc-900">Operator Standar</option>
                      <option value="admin" className="dark:bg-zinc-900">Administrator Pusat</option>
                      <option value="viewer" className="dark:bg-zinc-900">Auditor (View Only)</option>
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-end mb-1.5 opacity-80">
                      <label className="block text-sm font-medium">Password Sementara (Opsional)</label>
                      <button type="button" onClick={generatePass} className="text-[10px] flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline">
                        <Shuffle className="w-3 h-3" /> ACAK BARU
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input readOnly value={generatedPass} className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg font-mono text-xs focus:outline-none text-gray-500" placeholder="Kosongkan jika sistem murni Passkey..." />
                      {generatedPass && (
                        <button type="button" onClick={copyToClipboard} className="p-2 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition" title="Salin Password">
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition">
                      Batal
                    </button>
                    <button disabled={loading} type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                      {loading ? "Menyimpan..." : "Simpan Identitas"}
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
