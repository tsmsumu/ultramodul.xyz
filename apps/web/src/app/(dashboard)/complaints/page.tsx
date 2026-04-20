"use client";

import { useTranslations } from "next-intl";
import { submitComplaintAction } from "../../actions/complaints";
import { MessageSquareWarning, Send, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";

export default function PengaduanPage() {
  const t = useTranslations("pengaduan");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Create FormData from the form target
    const formData = new FormData(e.target as HTMLFormElement);
    
    // Absolute Pure Drizzle Execute
    const res = await submitComplaintAction(formData);
    
    setLoading(false);
    if(res.success) {
      setSubmitted(true);
    } else {
      alert("Error: " + res.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-900/30">
            <MessageSquareWarning className="w-7 h-7 text-red-600 dark:text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black">{t("title")}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t("desc")}</p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 p-8 rounded-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">{t("successTitle")}</h3>
            <p className="text-emerald-600 dark:text-emerald-500/80 text-sm max-w-md">
              {t("successDesc")}
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="mt-6 px-6 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition"
            >
              {t("newReportBtn")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">{t("topicLabel")}</label>
              <select name="topic" required className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition appearance-none">
                <option value="" disabled selected>{t("optSelect")}</option>
                <option value="infrastruktur" className="dark:bg-[#09090b]">{t("optInfra")}</option>
                <option value="pelayanan" className="dark:bg-[#09090b]">{t("optPublic")}</option>
                <option value="kesehatan" className="dark:bg-[#09090b]">{t("optHealth")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">{t("contentLabel")}</label>
              <textarea 
                name="content"
                required 
                rows={5}
                placeholder={t("placeholder")}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition"
              />
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-red-600/20"
              >
                {loading ? t("submittingBtn") : t("submitBtn")}
                {!loading && <Send className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
