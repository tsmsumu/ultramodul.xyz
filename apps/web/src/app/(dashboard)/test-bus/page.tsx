"use client";

import { EventBus, EVENTS } from "@/core/event-bus";
import { ActivitySquare, Zap } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function TestBusPage() {
  const t = useTranslations("testbus");
  const [typedMsg, setTypedMsg] = useState("");

  const triggerGlobalEvent = () => {
    EventBus.publish(EVENTS.NOTIFICATION_ALERT, typedMsg || t("alertSignal"));
    setTypedMsg("");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <ActivitySquare className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black">{t("pageTitle")}</h1>
            <p className="text-gray-500">{t("pageSubtitle")}</p>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-5 rounded-2xl mb-8">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-500 mb-2">{t("mfConcept")}</p>
          <p className="text-xs text-amber-700/80 dark:text-amber-500/70" dangerouslySetInnerHTML={{__html: t("mfDesc")}} />
        </div>

        <div className="space-y-4">
          <input 
            type="text"
            value={typedMsg}
            onChange={e => setTypedMsg(e.target.value)}
            placeholder={t("inputPlaceholder")}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button 
            onClick={triggerGlobalEvent}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/30 flex justify-center items-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" />
            {t("fireSignalBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
