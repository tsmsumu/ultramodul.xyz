"use client";

import { X, UploadCloud, FileSpreadsheet, Loader2 } from "lucide-react";
import { useState } from "react";
import { importCSVIdentities } from "@/app/actions/iam";

export function ImportModal({ isOpen, onClose, onRefresh }: { isOpen: boolean, onClose: () => void, onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [errorItem, setErrorItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;

     setLoading(true);
     setErrorItem(null);

     const reader = new FileReader();
     reader.onload = async (evt) => {
        const text = evt.target?.result as string;
        if (text) {
           const result = await importCSVIdentities(text);
           if (result.success) {
              alert(`Sukses mengimpor ${result.count} Identitas!`);
              onRefresh();
              onClose();
           } else {
              setErrorItem(result.error || "Gagal Parse File");
           }
        }
        setLoading(false);
     };
     reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0a0a0c] w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
           <h3 className="font-semibold text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
             <FileSpreadsheet className="w-5 h-5"/> Import Batch Identity
           </h3>
           <button onClick={onClose} className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition">
             <X className="w-5 h-5"/>
           </button>
        </div>
        
        <div className="p-6 space-y-4">
           
           <div className="p-4 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl relative hover:bg-gray-100 dark:hover:bg-white/10 transition flex flex-col items-center justify-center gap-2 cursor-pointer group h-40">
             {loading ? (
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
             ) : (
                <>
                  <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 transition" />
                  <p className="text-sm font-medium">Klik untuk Pilih File .CSV</p>
                  <p className="text-xs text-gray-500 font-mono">Format: username, name, role</p>
                </>
             )}
             <input aria-label="File upload" id="fileUpload" disabled={loading} type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
           </div>

           {errorItem && (
             <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-200 dark:border-red-800/30">
               {errorItem}
             </div>
           )}

           <div className="text-[10px] text-gray-500 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
             <strong>Aturan CSV Format Jaringan:</strong><br/>
             1. File wajib memuat 3 kolom tanpa petik tambahan ganda.<br/>
             2. Kolom 1 = Identitas Global (UID)<br/>
             3. Kolom 2 = Nama Lengkap Resmi<br/>
             4. Kolom 3 = Role Sistem (admin | member | viewer)<br/>
             Semua baris akan didaftarkan ke Matrix SQLite dalam status "Active". Matrix hak akses spesifik harus disetel melalui halaman Matrix / Mandat setelahnya.
           </div>

        </div>
      </div>
    </div>
  );
}
