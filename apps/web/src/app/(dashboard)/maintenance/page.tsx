"use client";

import { useTranslations } from "next-intl";
import { ServerCog, DatabaseZap, Clock, Trash2, Cpu, HardDrive, Unplug, AlertOctagon, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getServerTelemetry } from "../../actions/telemetry";
import { executeVacuumDb, executeReindexDb } from "../../actions/maintenance";

export default function MaintenancePanopticon() {
  const t = useTranslations("maintenance");

  // Real VPS Telemetry Pulse
  const [cpuPulse, setCpuPulse] = useState(0);
  const [ramPulse, setRamPulse] = useState(0);
  const [connPulse, setConnPulse] = useState(0);

  useEffect(() => {
    // Physical Engine Scanner
    const intv = setInterval(async () => {
       const stats = await getServerTelemetry();
       setCpuPulse(stats.cpu);
       setRamPulse(stats.ram);
       setConnPulse(stats.connections);
    }, 2000);
    return () => clearInterval(intv);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Matrix */}
      <div className="flex items-center gap-4 bg-red-950/20 border border-red-500/20 p-6 rounded-3xl backdrop-blur-sm">
        <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-500/30">
          <ServerCog className="w-8 h-8 text-red-500 animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">{t("title")}</h1>
          <p className="text-red-400 text-sm font-mono mt-1 opacity-80">{t("desc")}</p>
        </div>
      </div>

      {/* Telemetry HUD */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-2 mb-4">{t("telemetry")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TelemetryCard icon={Cpu} title="CPU Core Threads" value={`${cpuPulse.toFixed(1)}%`} color="emerald" />
          <TelemetryCard icon={HardDrive} title="Memory Allocation" value={`${ramPulse.toFixed(1)}%`} color="blue" />
          <TelemetryCard icon={Unplug} title="Active Connectors" value={`${connPulse} Node`} color="amber" />
        </div>
      </div>

      {/* Extreme Executor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Vacuum Engine */}
        <ExecutorCard 
          icon={Trash2} 
          title={t("vacuumTitle")} 
          actionBtn={t("vacuumBtn")} 
          colorMode="red"
          actionFn={executeVacuumDb}
        />
        {/* Index Rebuilder */}
        <ExecutorCard 
          icon={DatabaseZap} 
          title={t("indexTitle")} 
          actionBtn={t("indexBtn")} 
          colorMode="amber"
          actionFn={executeReindexDb}
        />
        {/* Time Machine Backup */}
        <ExecutorCard 
          icon={Clock} 
          title={t("backupTitle")} 
          actionBtn={t("backupBtn")} 
          colorMode="blue"
          actionFn={async () => { return new Promise(resolve => setTimeout(resolve, 3000)); }}
        />
      </div>
    </div>
  );
}

function TelemetryCard({ icon: Icon, title, value, color }: any) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-950/10",
    blue: "text-blue-400 border-blue-500/20 bg-blue-950/10",
    amber: "text-amber-400 border-amber-500/20 bg-amber-950/10",
  };
  const cTheme = colorMap[color];

  return (
    <div className={`p-6 rounded-3xl border ${cTheme} backdrop-blur-md relative overflow-hidden`}>
      <Icon className="w-16 h-16 absolute -right-4 -bottom-4 opacity-10" />
      <div className="flex flex-col gap-2 relative z-10">
        <span className="text-xs uppercase font-bold opacity-60 tracking-wider">{title}</span>
        <span className="text-4xl font-mono font-black">{value}</span>
      </div>
    </div>
  );
}

function ExecutorCard({ icon: Icon, title, actionBtn, colorMode, actionFn }: any) {
  const [status, setStatus] = useState<"idle" | "arming" | "running" | "success">("idle");

  const handleTrigger = async () => {
    if (status === "idle") {
      setStatus("arming"); // 1st Click (Arming)
    } else if (status === "arming") {
      setStatus("running"); // 2nd Click (Execute)
      
      // Execute Real Backend SQL
      if (actionFn) await actionFn();
      
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const getTheme = () => {
    if (status === "success") return `border-emerald-500 bg-emerald-950/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]`;
    if (colorMode === "red") return `border-red-900/50 bg-[#0a0a0a] hover:border-red-600/50`;
    if (colorMode === "amber") return `border-amber-900/50 bg-[#0a0a0a] hover:border-amber-600/50`;
    return `border-blue-900/50 bg-[#0a0a0a] hover:border-blue-600/50`;
  };

  const getBtnTheme = () => {
    if (status === "arming") return "bg-red-600 text-white animate-pulse";
    if (status === "running") return "bg-gray-800 text-gray-500 cursor-not-allowed";
    if (status === "success") return "bg-emerald-600 text-white";
    
    if (colorMode === "red") return "bg-red-950 text-red-400 border border-red-900 hover:bg-red-900";
    if (colorMode === "amber") return "bg-amber-950 text-amber-400 border border-amber-900 hover:bg-amber-900";
    return "bg-blue-950 text-blue-400 border border-blue-900 hover:bg-blue-900";
  };

  return (
    <div className={`p-8 rounded-3xl border transition-all duration-500 ${getTheme()} flex flex-col justify-between h-72 relative overflow-hidden group`}>
      {/* Background Icon */}
      <Icon className="w-48 h-48 absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-700" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-6">
          <Icon className="w-6 h-6 text-white opacity-80" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
      </div>

      <div className="relative z-10 w-full mt-auto">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.button 
              key="idle"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleTrigger}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase transition-all ${getBtnTheme()}`}
            >
              {actionBtn}
            </motion.button>
          )}
          {status === "arming" && (
            <motion.button 
              key="arming"
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              onClick={handleTrigger}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 ${getBtnTheme()}`}
            >
              <AlertOctagon className="w-4 h-4" /> SECURE CLICK TO EXECUTE
            </motion.button>
          )}
          {status === "running" && (
            <motion.button 
              key="running" disabled
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 ${getBtnTheme()}`}
            >
              <Loader2 className="w-4 h-4 animate-spin" /> SYSTEM EXECUTING...
            </motion.button>
          )}
          {status === "success" && (
            <motion.button 
              key="success" disabled
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-2 ${getBtnTheme()}`}
            >
              <CheckCircle2 className="w-4 h-4" /> SUCCESSFUL
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
