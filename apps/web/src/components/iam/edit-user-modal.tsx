"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCog, CheckCircle2 } from "lucide-react";
import { updateIdentityByAdmin } from "@/app/actions/iam";
import { useTranslations } from "next-intl";

export function EditUserModal({ 
  isOpen, 
  onClose, 
  onRefresh, 
  user,
  currentUserRole
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onRefresh: () => void;
  user: any;
  currentUserRole?: string;
}) {
  const t = useTranslations("iam");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset form when opened with new user
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setErrorMsg(null);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    
    const res = await updateIdentityByAdmin(user.id, {
      name: formData.get("name") as string,
      role: formData.get("role") as string,
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
      setErrorMsg(res.error || "Gagal memperbarui identitas.");
    }
  };

  if (!user) return null;

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
                  <UserCog className="w-5 h-5 text-indigo-500" />
                  {t("modalEditTitle")}
                </h2>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-12 text-emerald-500">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">{t("msgUpdated")}</p>
                  <p className="text-sm opacity-80 mt-1">{t("msgAudit")}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                     <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800/50">
                       {errorMsg}
                     </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">{t("labelUid")}</label>
                    <input disabled value={user.username} className="w-full px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-500 font-mono cursor-not-allowed" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">{t("labelName")}</label>
                    <input required defaultValue={user.name} name="name" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 opacity-80">{t("labelPhone")}</label>
                      <input defaultValue={user.phoneNumber || ""} name="phoneNumber" type="tel" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5 opacity-80">{t("labelEmail")}</label>
                      <input defaultValue={user.email || ""} name="email" type="email" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 opacity-80">{t("labelRole")}</label>
                    <select required defaultValue={user.role} name="role" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition appearance-none">
                      {currentUserRole === "owner" && <option value="owner" className="font-bold">{t("roleOwner")}</option>}
                      <option value="super_admin">{t("roleSuperAdmin")}</option>
                      <option value="admin">{t("roleAdmin")}</option>
                      <option value="member">{t("roleMember")}</option>
                      <option value="viewer">{t("roleViewer")}</option>
                    </select>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition">
                      {t("btnCancel")}
                    </button>
                    <button disabled={loading} type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2">
                      {loading ? t("btnSaving") : t("btnSave")}
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
