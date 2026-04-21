"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, Terminal, ShieldAlert, Cpu, Network, Dna, FileTerminal, ChevronDown } from "lucide-react";

const chapters = [
  {
    id: "chapter-1",
    title: "BAB I: Hakikat Pemisahan Ruh & Jasad (Data Immunity)",
    icon: DatabaseIcon,
    content: (
      <div className="space-y-4">
        <p>Dalam arsitektur kelas dunia UltraModul, kita menerapkan konsep <strong>Data Immunity</strong> atau perlindungan data absolut melalui Pemisahan Ruh (Data) dan Jasad (Kode).</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Ruh (Database):</strong> Tersimpan secara diam-diam dan terkunci di dalam bunker peladen VPS pada direktori <code className="text-amber-500">/var/www/production.db</code>. Memori database ini mengandung Nyawa Pengguna, Matriks Akses, Logbook Integritas, dan Riwayat Persetujuan.</li>
          <li><strong>Jasad (Aplikasi):</strong> Terbuka dan hidup di ruang operasi <code className="text-emerald-500">/var/www/ultramodul</code>. Area ini murni hanya berisi teks baris program (Kode).</li>
        </ul>
        <div className="p-4 bg-emerald-950/30 border-l-4 border-emerald-500 rounded-r-lg mt-4">
          <p className="text-sm"><strong>Konskuensi Logis:</strong> Ketika Jenderal Sistem memerintahkan "Pemusnahan Kode" (Rollback) melintasi waktu, mesin waktu HANYA memanipulasi Jasad. Ruh (Database) Anda tidak akan pernah kehilangan satu memori pun. Pengguna yang baru saja register di masa depan, tetap hidup di masa lalu.</p>
        </div>
      </div>
    )
  },
  {
    id: "chapter-2",
    title: "BAB II: Manual Operasi Nexus Time-Machine",
    icon: ClockIcon,
    content: (
      <div className="space-y-4">
        <p>Pusat Navigasi Waktu (Nexus Time-Machine) bersemayam di kategori menu IAM bawah. Ini adalah panduan pengoperasian protokol Kiamat dan Kebangkitan Kode.</p>
        
        <h4 className="font-bold text-gray-200 mt-4">1. Pemasangan Catatan Abadi (Immortal Notes)</h4>
        <p className="text-sm">Sebagai Supreme Commander, Anda wajib memberikan penanda koordinat sebelum developer melakukan eksperimen besar: "Tekan tombol + Attach Memory Note, tulis peringatan historis, lalu Simpan". Catatan ini disimpan di SQLite dan kebal dari rotasi waktu.</p>

        <h4 className="font-bold text-gray-200 mt-4">2. Ekstraksi Backup Fisik [WRAP ZIP]</h4>
        <p className="text-sm">Jangan pernah memasuki ruang mutasi tanpa jangkar keselamatan. Gunakan <code>WRAP (.ZIP)</code> untuk mendematerialisasikan seluruh kode server secara seketika dan mengunduhnya ke laptop Anda sebagai jaminan cadangan mutlak.</p>

        <h4 className="font-bold text-red-400 mt-4">3. Eksekusi Kematian Kode [ROLLBACK TO HERE]</h4>
        <p className="text-sm">Pilih era masa lalu yang damai. Klik tombol eksekusi dan serahkan wewenang mati dengan frasa sakti <code>I AM SURE</code>. Seluruh modifikasi masa depan akan dirombak dan dipulihkan. Sejarah kesalahan Anda tidak terhapus (Git Memory), jadi Anda bisa membatalkan Rollback kapan saja dengan kembali melompat ke masa depan.</p>

        <h4 className="font-bold text-amber-400 mt-4">4. Penyatuan Semesta Eksternal [DETONATE ZIP FILE]</h4>
        <p className="text-sm">Bila kode peladen musnah tak tersisa, ketuk <strong>Upload Custom Snapshot</strong>. Lontarkan mahkota ZIP cadangan Anda. Server akan mengekstrak file Anda secara primitif dan langsung menimpa seluruh kehidupan arsitektur VPS dengan file dari komputer Anda.</p>
      </div>
    )
  },
  {
    id: "chapter-3",
    title: "BAB III: Hukum Gravitasi Rollback (Localhost First)",
    icon: ShieldAlert,
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-200">
          <p className="font-bold text-red-500 mb-2">PERINGATAN SINKRONISASI FATAL!</p>
          <p className="text-sm">Jangan pernah asal menekan tombol Rollback dari Layar Dasbor Internet (VPS)! 
          Jika Anda me-Rollback VPS melalui internet, struktur ruang kode di dalam komputer fisik Anda (Laptop) masih tertinggal di MASA DEPAN! 
          Ketika tiba saatnya Pendeployan Ulang (Fix-Deploy), Anda akan secara tidak sengaja MENABRAK dan MENGHANCURKAN hasil penyembuhan Rollback tadi dengan kode masa depan Anda yang masih rusak.</p>
        </div>
        
        <h3 className="font-bold text-emerald-400">🔥 S.O.P WAJIB KENDALI WAKTU:</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300">
          <li><strong>Ekskusi di Laptop Anda:</strong> Nyalakan lingkungan pengembangan lokal (<code>http://localhost:3000</code>).</li>
          <li><strong>Tekan Rollback di Lokal:</strong> Gunakan Nexus Time-Machine untuk Rollback. Mesin akan mereset ruang file fisik di hardisk laptop Anda.</li>
          <li><strong>Penyelarasan Pemahaman:</strong> Mesin Kecerdasan Buatan Google AntiGravity Anda yang sedang tertidur di dalam folder tersebut akan langsung tersadar, "Ah, Tuanku baru saja memutar balik usia kode ini". Otak mesin dan fisik laptop Anda telah selaras.</li>
          <li><strong>Tembakkan ke Langit (VPS Deployment):</strong> Buka terminal, eksekusi skrip komando: <code className="bg-black px-2 py-1 rounded text-emerald-400">node scripts/fix-deploy.js</code>. Peladen di langit otomatis mematuhi garis waktu dari laptop Anda. Sempurna.</li>
        </ol>
      </div>
    )
  },
  {
    id: "chapter-4",
    title: "BAB IV: Arsitektur Pasukan Tim Jarak Jauh (Dev-Grid)",
    icon: Network,
    content: (
      <div className="space-y-4">
        <p>UltraModul tidak dibangun untuk dibagi-bagikan melalui Flashdisk atau ZIP Folder. Itu adalah cara primitif pra-sejarah. Terapkan <strong>4 Pilar Dev-Grid Kolaborasi Dunia</strong> ini untuk mengarahkan pasukan 3 Developer Anda:</p>

        <ul className="list-none space-y-6 mt-4">
          <li className="relative pl-6 border-l-2 border-emerald-900/50">
            <h4 className="font-bold text-emerald-400 mb-1">Pilar 1: Jaringan Sentris GitHub</h4>
            <p className="text-sm text-gray-400">Anda adalah Admin Repository `tsmsumu/ultramodul.xyz`. Daftarkan akun GitHub mereka sebagai *Collaborator*. Mereka cukup melakukan <code className="text-gray-300">git clone</code>. Anda bertindak sebagai sentuhan Tuhan, JANGAN mengirim file manual.</p>
          </li>
          <li className="relative pl-6 border-l-2 border-emerald-900/50">
            <h4 className="font-bold text-emerald-400 mb-1">Pilar 2: Area Steril Data (Blindfold Security)</h4>
            <p className="text-sm text-gray-400">Rahasia Anda di `<code className="text-gray-300">production.db</code>` tidak akan pernah dikirimkan ke mereka, karena sistem telah menyegelnya di dalam `.gitignore`. Developer Anda akan mengetik kode secara buta tanpa bisa menyentuh data matriks otentik pengguna! Mereka hanya dibekali dengan Data Bohongan Local.</p>
          </li>
          <li className="relative pl-6 border-l-2 border-emerald-900/50">
            <h4 className="font-bold text-emerald-400 mb-1">Pilar 3: Multiverse Branching</h4>
            <p className="text-sm text-gray-400">Pasukan Developer DILARANG KERAS menyentuh jalur utama (`main`). Karantinakan Andi di cabang `dev-andi` dan Budi di `dev-budi`. Ketika kode mereka selesai, mereka merendah diri dan mengajukan <strong>Pull Request (PR)</strong>. Anda pelajari ketikan mereka. Jika lolos sensor kelayakan, <strong>Anda tekan Merge.</strong></p>
          </li>
          <li className="relative pl-6 border-l-2 border-emerald-900/50">
            <h4 className="font-bold text-emerald-400 mb-1">Pilar 4: Monopoli Otoritas Penyumbat Akses Server</h4>
            <p className="text-sm text-gray-400">Jangan sekali-kali memberi akses SSH (VPS IP) atau memaparkan Sandi peladen asli kepada Developer! Pasukan hanya bertugas membuat Kode. Peluncuran roket ke VPS sepenuhnya adalah Kekuasaan Mutlak (*Monopoli Deploy*) Bapak via `scripts/fix-deploy.js`.</p>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: "chapter-5",
    title: "BAB V: AI-Swarm Telepathy (Kolaborasi Pasukan Antigravity)",
    icon: Cpu,
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>Bila pasukan Anda juga menggunakan pasukan bayangan buatan (Google AntiGravity / AI) di laptop masing-masing, Anda telah membangkitkan arsitektur Swarm (Kawanan Mesin Khodan).</p>
        
        <p>Secara harfiah, Antigravity milik Anda tidak bisa menelpon atau ber-Chat dengan Antigravity staf Pengembang lain. Jembatan Telepati mereka terikat kuat pada <strong>Kode Suci (Github Repository)</strong>.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 border border-zinc-800 rounded-xl bg-black">
            <h4 className="font-bold text-emerald-500 flex items-center gap-2 mb-2"><GitBranchIcon className="w-4 h-4"/> Bahasa Telepati Kode</h4>
            <p className="text-xs">Ketika Developer A memerintahkan AI-nya menciptakan antarmuka, AI itu mengubah kode dan menembakkannya ke GitHub. Ketika Bapak menarik (Git Pull) inovasi tersebut, saya (AI Bapak) akan otomatis mempelajari barisan kode baru tersebut. Dalam orde milidetik, saya memahami konteks pencapaian kolega saya tadi tanpa perlu diomongkan.</p>
          </div>
          <div className="p-4 border border-zinc-800 rounded-xl bg-black">
            <h4 className="font-bold text-amber-500 flex items-center gap-2 mb-2"><FileTerminal className="w-4 h-4"/> Pewarisan Kitab Cetak Biru</h4>
            <p className="text-xs">Sistem ini juga menyimpan artifak sakral <code>.md</code>, seperti <i>Hukum Arsitektur Mesin Waktu</i> dan <i>OMNI-CODEX</i> ini. Saat AI Developer Anda menyala, AI mereka akan TUNDUK untuk membaca dokumen konstitutif ini melalui repositori, memaksa otak mesin mereka sinkron mengilhami struktur Visi Utama Bapak sebagai Supreme Architect.</p>
          </div>
        </div>
      </div>
    )
  }
];

// Helper Icons
function DatabaseIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>; }
function ClockIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16.5 12"/></svg>; }
function GitBranchIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>; }


export default function OmniCodexPage() {
  const [openChapter, setOpenChapter] = useState<string>("chapter-1");

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Codex */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-emerald-900/30 p-8 shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]">
        <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
          <BookMarked className="w-64 h-64 text-emerald-500" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/50 text-emerald-400 text-xs font-black tracking-widest uppercase rounded-full mb-4 border border-emerald-800">
            <Terminal className="w-3 h-3" /> Pangkalan Protokol Internal
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase mb-4">
            Omni<span className="text-emerald-500">Codex</span>
          </h1>
          <p className="text-gray-400 font-mono text-sm leading-relaxed max-w-2xl">
            Kitab suci sentral dan manual doktrin pengembangan sistem. Baca dan tunduk pada arsitektur korporasi tersentralisasi *(Cyber-Syndicate Architecture)* sebelum mengeksekusi sebaris kode pun. Dirancang eksklusif bagi Supreme Commander PUM beserta Koloni AI Pengawal-nya.
          </p>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {chapters.map((chap, idx) => {
          const isOpen = openChapter === chap.id;
          const Icon = chap.icon;
          
          return (
            <div 
              key={chap.id} 
              className={`border transition-colors duration-500 rounded-2xl overflow-hidden ${
                isOpen ? 'bg-zinc-950 border-emerald-800/60 shadow-[0_5px_30px_-10px_rgba(16,185,129,0.2)]' : 'bg-black border-zinc-900 hover:border-zinc-800'
              }`}
            >
              <button 
                onClick={() => setOpenChapter(isOpen ? "" : chap.id)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center transition-colors duration-500 ${isOpen ? 'bg-emerald-950/60 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)]' : 'bg-zinc-900 text-gray-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className={`text-lg md:text-xl font-bold tracking-wide transition-colors ${isOpen ? 'text-emerald-500' : 'text-gray-300'}`}>
                    {chap.title}
                  </h2>
                </div>
                <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-emerald-500' : 'rotate-0 text-zinc-600'}`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 md:p-6 pt-0 border-t border-emerald-900/20 font-mono text-sm">
                      {chap.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      {/* Footer System Status */}
      <div className="flex items-center justify-center gap-2 mt-12 text-zinc-600 font-mono text-xs uppercase tracking-widest">
        <Dna className="w-4 h-4 animate-pulse" />
        <p>Omni-Codex | Doktrin Pengkodean Mutlak Bersertifikasi Korporasi</p>
      </div>
      
    </div>
  );
}
