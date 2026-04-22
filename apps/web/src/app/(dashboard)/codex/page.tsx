"use client";

import { useState, useEffect } from "react";
import { BookOpen, Database, UploadCloud, CheckCircle2, Server, Search, Trash2 } from "lucide-react";
import { getActiveUserId } from "../../actions/auth";
import { useTranslations } from "next-intl";

interface Dictionary {
  id: string;
  name: string;
  target: string;
  status: string;
  rows: number;
}

export default function OmniCodexPage() {
  const t = useTranslations("codex");
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [userId, setUserId] = useState("anonymous");
  const [dictName, setDictName] = useState("");
  const [dictTarget, setDictTarget] = useState("");

  useEffect(() => {
    getActiveUserId().then(id => {
      setUserId(id);
      const saved = localStorage.getItem(`omniCodex_v2_${id}`);
      if (saved) {
        try { setDictionaries(JSON.parse(saved)); } catch(e){}
      }
    });
  }, []);

  const saveDictionaries = (newDicts: Dictionary[]) => {
    setDictionaries(newDicts);
    localStorage.setItem(`omniCodex_v2_${userId}`, JSON.stringify(newDicts));
  };

  const handleUpload = () => {
    if (!dictName || !dictTarget) return alert(t("alertFill"));
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setSuccess(true);
      const newDict: Dictionary = {
        id: `dict_${Date.now()}`,
        name: dictName,
        target: dictTarget,
        status: "Active",
        rows: Math.floor(Math.random() * 1000) + 10 // Mock row count
      };
      saveDictionaries([...dictionaries, newDict]);
      setDictName("");
      setDictTarget("");
      setTimeout(() => setSuccess(false), 3000);
    }, 1500);
  };

  const handleDelete = (id: string) => {
    if(confirm(t("alertDelete"))) {
      saveDictionaries(dictionaries.filter(d => d.id !== id));
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen p-8 text-zinc-100">
      
      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 bg-blue-900/30 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.15)]">
          <BookOpen className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">{t("title")}</h1>
          <p className="text-zinc-400 max-w-2xl text-sm">
            {t("desc")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL UPLOAD */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 flex flex-col h-fit">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2">
            <Database className="w-4 h-4" /> {t("injectTitle")}
          </h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">{t("dictName")}</label>
              <input value={dictName} onChange={e => setDictName(e.target.value)} type="text" placeholder={t("dictNamePlaceholder")} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">{t("dictTarget")}</label>
              <input value={dictTarget} onChange={e => setDictTarget(e.target.value)} type="text" placeholder={t("dictTargetPlaceholder")} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>

          <div 
            onClick={handleUpload}
            className={`w-full border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-4
            ${isUploading ? 'border-blue-500 bg-blue-900/20' : success ? 'border-emerald-500 bg-emerald-900/20' : 'border-zinc-700 bg-black/40 hover:border-blue-500/50'}`}
          >
            {isUploading ? (
               <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            ) : success ? (
               <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            ) : (
               <UploadCloud className="w-10 h-10 text-zinc-500" />
            )}
            
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-widest block mb-1">
                {isUploading ? t("processing") : success ? t("active") : t("dropBox")}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{t("format")}</span>
            </div>
          </div>
        </div>

        {/* PANEL DAFTAR KAMUS */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Server className="w-4 h-4" /> {t("listTitle")}
            </h2>
            <div className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 flex items-center gap-2 w-64">
              <Search className="w-4 h-4 text-zinc-500" />
              <input type="text" placeholder={t("searchPlaceholder")} className="bg-transparent border-none outline-none text-xs w-full text-zinc-300" />
            </div>
          </div>

          <div className="space-y-3">
            {dictionaries.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-sm" dangerouslySetInnerHTML={{ __html: t("emptyList") }}>
              </div>
            ) : (
              dictionaries.map((dict) => (
                <div key={dict.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-200">{dict.name}</h3>
                      <div className="text-xs text-zinc-500 font-mono mt-1">
                        {t("target")}: <span className="text-blue-400">{dict.target}</span> • {dict.rows} {t("rows")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase rounded-lg border border-emerald-500/20">
                      {dict.status}
                    </span>
                    <button onClick={() => handleDelete(dict.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 opacity-0 group-hover:opacity-100 uppercase tracking-widest text-[10px] font-bold">
                      {t("btnDelete")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
