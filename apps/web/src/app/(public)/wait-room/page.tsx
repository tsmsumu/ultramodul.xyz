"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function WaitRoomPage() {
  const t = useTranslations("public");

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/20 mb-8 animate-pulse">
          <ShieldCheck className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          {t("waitRoomTitle")}
        </h1>
        
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-6 rounded-3xl">
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            {t("waitRoomDesc")}
          </p>
        </div>

        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-white transition-colors mt-8"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Gerbang Utama
        </Link>
      </div>
    </div>
  );
}
