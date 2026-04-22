"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/actions/auth";
import { motion } from "framer-motion";
import { KeyRound, Loader2, Fingerprint, ActivitySquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UniversalAuthPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAction(formData);
      if (!res.success) {
        setErrorMsg(res.message || "Login failed");
        return;
      }
      // Berhasil
      router.push("/dashboard"); 
    });
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Universal Grid/Matrix Decor */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/5 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[400px] relative z-10"
      >
        <div className="bg-[#0a0a0c] border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-5 relative group cursor-pointer transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10">
              <ActivitySquare className="w-6 h-6 text-white group-hover:text-emerald-500 transition-colors" />
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-emerald-500/50 animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase">UNIVERSAL GATEWAY</h1>
            <p className="text-xs text-emerald-500 font-mono tracking-widest uppercase mt-2 opacity-80 mt-3 border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-500/10">Access Matrix Core</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-red-950/50 border border-red-500/20 text-red-500 text-xs font-mono tracking-wider text-center flex flex-col items-center gap-2">
                {errorMsg}
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Identity (UID / Phone / Email)</label>
              <div className="relative">
                <Fingerprint className="w-4 h-4 absolute left-4 top-4 text-zinc-500" />
                <input 
                  name="identity" 
                  required 
                  autoComplete="off"
                  placeholder="Enter any identity format..."
                  className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-white placeholder:text-zinc-700 font-mono text-sm"
                />
              </div>
              <p className="text-[9px] text-zinc-600 mt-2 px-1 italic">Ketik format apa saja. Sistem otomatis mengenalinya.</p>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-1">Encrypted Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-4 top-4 text-zinc-500" />
                <input 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="Enter passkey..."
                  className="w-full pl-11 pr-4 py-3.5 bg-black/50 border border-white/10 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition text-white placeholder:text-zinc-700 text-sm font-mono tracking-widest"
                />
              </div>
            </div>

            <button 
              disabled={isPending}
              type="submit" 
              className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "AUTHENTICATE"}
            </button>
          </form>

          <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest mt-8 font-mono">
            Unregistered Identity? <a href="/register" className="text-emerald-500 hover:text-emerald-400">Request Access</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
