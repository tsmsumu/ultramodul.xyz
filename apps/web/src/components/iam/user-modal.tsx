"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, CheckCircle2, Shuffle, Copy } from "lucide-react";
import { createIdentity } from "@/app/actions/iam";
import { useTranslations } from "next-intl";

export function UserModal({ isOpen, onClose, onRefresh, currentUserRole }: { isOpen: boolean; onClose: () => void; onRefresh: () => void; currentUserRole?: string }) {
  const t = useTranslations("iam");
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
    alert(t("msgCopied"));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await createIdentity({
      username: formData.get("username") as string,
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      plainPassword: generatedPass || undefined,
      phoneNumber: formData.get("phoneNumber") as string || undefined,
      email: formData.get("email") as string || undefined
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
      alert(t("msgFailCreate"));
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
                  {t("modalCreateTitle")}
                </h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-green-500">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">{t("msgCreated")}</p>
                  <p className="text-sm opacity-80 mt-1">{t("msgAudit")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">{t("labelUid")}</label>
                    <input required name="username" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder={t("phUid")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">{t("labelName")}</label>
                    <input required name="name" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder={t("phName")} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 opacity-80">{t("labelPhone")}</label>
                      <input name="phoneNumber" type="tel" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder={t("phPhone")} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 opacity-80">{t("labelEmail")}</label>
                      <input name="email" type="email" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder={t("phEmail")} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">{t("labelRole")}</label>
                    <select aria-label="Role" required defaultValue="member" name="role" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none">
                      {currentUserRole === "owner" && <option value="owner" className="font-bold">{t("roleOwner")}</option>}
                      <option value="super_admin">{t("roleSuperAdmin")}</option>
                      <option value="admin">{t("roleAdmin")}</option>
                      <option value="member">{t("roleMember")}</option>
                      <option value="viewer">{t("roleViewer")}</option>
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-end mb-1.5 opacity-80">
                      <label className="block text-sm font-medium">{t("labelPass")}</label>
                      <button type="button" onClick={generatePass} className="text-[10px] flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline">
                        <Shuffle className="w-3 h-3" /> {t("btnShuffle")}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input readOnly value={generatedPass} className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg font-mono text-xs focus:outline-none text-gray-500" placeholder={t("phPass")} />
                      {generatedPass && (
                        <button type="button" onClick={copyToClipboard} className="p-2 border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition" title={t("btnCopy")}>
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition">
                      {t("btnCancel")}
                    </button>
                    <button disabled={loading} type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2">
                      {loading ? t("btnCreating") : t("btnCreate")}
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
