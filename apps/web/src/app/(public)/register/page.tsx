"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { registerPublicMember } from "@/app/actions/register";
import { motion } from "framer-motion";
import { Fingerprint, Loader2, Key } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const t = useTranslations("public");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await registerPublicMember(formData);
      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      // Navigasi Berdasarkan Status (AI Verval)
      if (res.status === "active") {
        router.push("/dashboard"); 
      } else {
        router.push("/wait-room");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Kaca Pembias (Glassmorphism Decor) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-5">
              <Fingerprint className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{t("registerTitle")}</h1>
            <p className="text-sm text-gray-400 mt-2">{t("registerSubtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Universal Identity Code</label>
              <input 
                name="username" 
                required 
                maxLength={16}
                placeholder="Enter 16 Digit Code"
                className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-white placeholder:text-gray-600 font-mono"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{t("nameLabel")}</label>
              <input 
                name="name" 
                required 
                placeholder={t("namePlaceholder")}
                className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-white placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{t("passwordLabel")}</label>
              <div className="relative">
                <Key className="w-5 h-5 absolute left-4 top-3.5 text-gray-500" />
                <input aria-label="Input field" placeholder="Enter value..." 
                  name="password" 
                  type="password" 
                  required 
                  className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition text-white"
                 />
              </div>
            </div>

            <button 
              disabled={isPending}
              type="submit" 
              className="w-full py-4 mt-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t("submitBtn")}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
