"use client";

import { useTranslations } from "next-intl";
import { Activity, ShieldCheck, Database, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const t = useTranslations("home");

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Widget */}
      <div className="relative rounded-2xl bg-gradient-to-br from-emerald-950/80 to-teal-950/80 border border-emerald-500/20 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="p-8 relative z-10">
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">PUM Command Center</h1>
          <p className="text-emerald-400 font-mono text-sm mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM ONLINE & ENCRYPTED
          </p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Nodes", value: "32", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "IAM Matrix", value: "Secured", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Nexus Engine", value: "Idle", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Omni-Data", value: "Syncing", icon: Database, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="p-6 bg-white dark:bg-[#0p0p0b] dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl flex items-center gap-4 hover:border-emerald-500/30 transition-colors"
          >
            <div className={`p-4 rounded-xl ${item.bg} ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{item.label}</p>
              <h3 className="text-2xl font-bold mt-1 tracking-tight">{item.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="h-96 w-full rounded-2xl border border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center text-gray-500 font-mono text-sm">
        <Zap className="w-8 h-8 mb-4 opacity-20" />
        <p>AWAITING INSTRUCTIONS</p>
      </div>

    </div>
  );
}
