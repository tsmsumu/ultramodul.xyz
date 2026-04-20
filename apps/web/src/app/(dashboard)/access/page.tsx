"use client";

import { BoxSelect } from "lucide-react";

export default function AccessMatrixPage() {
  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
          <BoxSelect className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Active Identity Matrix</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Visualisasi pemetaan wewenang absolut lintas-modul.
          </p>
        </div>
      </div>

      <div className="h-64 mt-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center p-8 text-center">
        <div>
          <h3 className="text-xl font-medium text-indigo-900 dark:text-indigo-300">Modul Konstruksi Tahap Beta</h3>
          <p className="text-sm text-indigo-700 dark:text-indigo-400 mt-2 max-w-md mx-auto">
            Matriks visual ini (berupa tabel silang per-modul) siap ditampilkan setelah Modul Bisnis (contoh: Pendaftaran, Laporan) ditambahkan ke dalam platform. 
            Struktur Database `accessMatrix` sudah aktif secara statis di belakang layar.
          </p>
        </div>
      </div>
    </div>
  );
}
