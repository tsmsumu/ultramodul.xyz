"use client";

import { useState } from "react";
import { updateIdentity } from "../../actions/auth";
import { Lock, User, KeyRound, Save, Activity, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfileFormProps {
  initialUid: string;
  initialName: string;
  role: string;
}

export default function ProfileForm({ initialUid, initialName, role }: ProfileFormProps) {
  const t = useTranslations("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const pass1 = formData.get("password") as string;
    const pass2 = formData.get("confirmPassword") as string;

    if (pass1 && pass1 !== pass2) {
      setErrorMsg(t('passwordMismatch'));
      setIsSaving(false);
      return;
    }

    const res = await updateIdentity(formData);
    
    if (res.success) {
      setSuccessMsg(res.message || t('successMessage'));
      // Clear password fields manually
      (document.getElementById("password") as HTMLInputElement).value = "";
      (document.getElementById("confirmPassword") as HTMLInputElement).value = "";
    } else {
      setErrorMsg(res.message || t("updateFail"));
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-950/80 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      
      {/* ABSOLUTE ID (LOCKED) */}
      <div className="mb-8 p-6 bg-black/50 border border-white/5 rounded-2xl flex items-center justify-between">
         <div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> {t('universalId')}
            </h3>
            <p className="text-2xl font-mono text-zinc-500 tracking-wider">{initialUid}</p>
         </div>
         <div className="flex flex-col items-end">
            <Lock className="w-6 h-6 text-zinc-600 mb-2" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 border border-zinc-800 px-2 py-0.5 rounded">{t('locked')}</span>
         </div>
      </div>

      <div className="space-y-6">
        {/* NAMA LENGKAP */}
        <div>
          <label htmlFor="fullName" className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-indigo-500" /> {t('fullName')}
          </label>
          <input 
            id="fullName"
            type="text" 
            name="fullName"
            defaultValue={initialName}
            required
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* ROLE */}
        <div>
          <label htmlFor="role" className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> {t('role')}
          </label>
          <input 
            id="role"
            type="text" 
            value={role.toUpperCase()}
            disabled
            className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-emerald-500/50 font-bold tracking-widest cursor-not-allowed"
          />
        </div>

        <hr className="border-white/5 my-8" />

        {/* SANDI BARU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label htmlFor="password" className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block">
               {t('newPassword')}
             </label>
             <input 
               type="password" 
               name="password"
               id="password"
               placeholder={t('newPasswordPlaceholder')}
               className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-zinc-700"
             />
           </div>
           <div>
             <label htmlFor="confirmPassword" className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 block">
               {t('confirmPassword')}
             </label>
             <input 
               type="password" 
               name="confirmPassword"
               id="confirmPassword"
               placeholder={t('confirmPasswordPlaceholder')}
               className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-zinc-700"
             />
           </div>
        </div>

        {/* NOTIFICATIONS */}
        {errorMsg && (
          <div className="bg-red-950/30 border border-red-900/50 text-red-400 text-sm p-4 rounded-xl flex items-center gap-3">
             <AlertTriangle className="w-5 h-5 shrink-0" /> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-950/30 border border-emerald-900/50 text-emerald-400 text-sm p-4 rounded-xl flex items-center gap-3">
             <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
          </div>
        )}

        {/* SUBMIT */}
        <div className="pt-4 flex justify-end">
           <button 
             type="submit"
             disabled={isSaving}
             className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-105"
           >
             {isSaving ? <><Activity className="w-5 h-5 animate-spin" /> {t('encrypting')}</> : <><Save className="w-5 h-5" /> {t('save')}</>}
           </button>
        </div>

      </div>
    </form>
  );
}
