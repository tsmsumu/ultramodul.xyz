"use client";

import { useState } from "react";
import { BookOpen, Database, UploadCloud, CheckCircle2, Server, Search } from "lucide-react";

export default function OmniCodexPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const mockDictionaries = [
    { id: 1, name: "Kamus Master Wilayah BPS 2024", target: "kode_kabupaten", status: "Active", rows: 514 },
    { id: 2, name: "Kamus KBLI 2020", target: "kode_lapangan_usaha", status: "Active", rows: 1240 },
    { id: 3, name: "Kamus Pendidikan BPS", target: "r301", status: "Active", rows: 12 },
  ];

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="max-w-[1600px] mx-auto min-h-screen p-8 text-zinc-100">
      
      <div className="flex items-center gap-6 mb-12">
        <div className="w-16 h-16 bg-blue-900/30 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.15)]">
          <BookOpen className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">Omni-Codex Global Registry</h1>
          <p className="text-zinc-400 max-w-2xl text-sm">
            Perpustakaan Metadata Nasional (Rosetta Stone). Kamus yang diunggah di sini akan otomatis tersedia bagi semua Ahli Analis di seluruh platform untuk menerjemahkan kode sandi menjadi bahasa manusia secara Real-Time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL UPLOAD */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 flex flex-col h-fit">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2">
            <Database className="w-4 h-4" /> Inject Rosetta Stone
          </h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Nama Kamus</label>
              <input type="text" placeholder="Contoh: Kamus KBLI 2020" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Target Kolom Utama</label>
              <input type="text" placeholder="Contoh: kode_lapangan_usaha" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors" />
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
                {isUploading ? 'Memproses Kamus...' : success ? 'Kamus Aktif!' : 'Drop Excel/CSV Metadata'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Format: [code, label]</span>
            </div>
          </div>
        </div>

        {/* PANEL DAFTAR KAMUS */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-white/5 rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Server className="w-4 h-4" /> Kamus Nasional Tersedia
            </h2>
            <div className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 flex items-center gap-2 w-64">
              <Search className="w-4 h-4 text-zinc-500" />
              <input type="text" placeholder="Cari Kamus..." className="bg-transparent border-none outline-none text-xs w-full text-zinc-300" />
            </div>
          </div>

          <div className="space-y-3">
            {mockDictionaries.map((dict) => (
              <div key={dict.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-200">{dict.name}</h3>
                    <div className="text-xs text-zinc-500 font-mono mt-1">
                      TARGET: <span className="text-blue-400">{dict.target}</span> • {dict.rows} Baris Teks
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase rounded-lg border border-emerald-500/20">
                    {dict.status}
                  </span>
                  <button className="text-xs font-bold text-red-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
