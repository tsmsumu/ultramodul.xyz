"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, GitMerge, Lock, Users, Terminal, Database, Server, GitBranch, ArrowRight, Code, Zap, CheckCircle2, AlertTriangle, Layers, MonitorSmartphone, Key } from "lucide-react";
import { useTranslations } from "next-intl";

type TabId = "PRIME" | "ENV" | "ARCH" | "GIT" | "DEPLOY";

export default function UltraCodexPage() {
  const [activeTab, setActiveTab] = useState<TabId>("PRIME");
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<"en" | "id">("en");

  // Read locale from cookie to sync with system
  useEffect(() => {
    setMounted(true);
    const cookie = document.cookie.split('; ').find(row => row.startsWith('NEXT_LOCALE='));
    if (cookie) {
      setLang(cookie.split('=')[1] as "en" | "id");
    }
  }, []);

  if (!mounted) return null;

  const TABS = [
    { id: "PRIME", icon: ShieldCheck, en: "Prime Directive", ina: "Hukum Mutlak" },
    { id: "ENV", icon: Terminal, en: "Environment Setup", ina: "Persiapan Lokal" },
    { id: "ARCH", icon: Layers, en: "Architecture Strictness", ina: "Standar Arsitektur" },
    { id: "GIT", icon: GitBranch, en: "Multiverse Branching", ina: "Protokol Git" },
    { id: "DEPLOY", icon: Server, en: "Deployment Engine", ina: "Peluncuran Sistem" }
  ];

  const CONTENT = {
    PRIME: {
      en: {
        title: "The Prime Directive: Absolute Zero-Trust",
        desc: "The foundational law of the UltraModul Enterprise Platform. Remote developers are isolated contractors. They never touch the production environment.",
        points: [
          { title: "No VPS Access", detail: "Developers will NEVER receive SSH keys or database passwords to the live server. They operate entirely in local host isolation." },
          { title: "Zero Amnesia", detail: "All technical discussions, decisions, and architectural changes must be documented via GitHub Commit Messages. WhatsApp discussions are considered non-existent." },
          { title: "Data Blindfold", detail: "The local database is completely empty upon cloning. Developers work with dummy data and have zero visibility into real user identities or sensitive corporate records." },
          { title: "The Admin is the Supreme Gatekeeper", detail: "Developers propose changes; the Admin approves and executes. No automated deployment pipeline will bypass the Admin's manual execution." }
        ]
      },
      id: {
        title: "Hukum Mutlak: Isolasi Zero-Trust",
        desc: "Hukum fundamental dari Platform UltraModul. Tim developer jarak jauh adalah kontraktor terisolasi. Mereka haram menyentuh lingkungan produksi.",
        points: [
          { title: "Dilarang Akses VPS", detail: "Developer TIDAK AKAN PERNAH mendapatkan kunci SSH atau password database ke server asli. Mereka bekerja 100% di dalam isolasi localhost." },
          { title: "Anti Amnesia", detail: "Semua diskusi teknis dan keputusan arsitektur wajib didokumentasikan di Pesan Commit GitHub. Obrolan teknis di WhatsApp dianggap tidak sah/tidak ada." },
          { title: "Kebutaan Data", detail: "Database lokal yang mereka unduh sepenuhnya KOSONG. Developer bekerja dengan data bohongan dan tidak memiliki akses sama sekali ke NIK/Identitas pengguna asli." },
          { title: "Admin adalah Penjaga Gerbang Tertinggi", detail: "Developer hanya mengajukan kode; Admin yang menilai dan mengeksekusi. Tidak ada peluncuran otomatis yang bisa memotong Hak Veto Admin." }
        ]
      }
    },
    ENV: {
      en: {
        title: "Phase 1: Environment Hydration",
        desc: "The precise ritual required to spawn the development environment on a local machine. Follow exactly, do not improvise.",
        steps: [
          { code: "git clone https://github.com/tsmsumu/ultramodul.xyz.git", note: "Clone the enterprise repository." },
          { code: "pnpm install", note: "Strictly use PNPM. Using npm or yarn will break the lockfile and instantly fail the PR." },
          { code: "pnpm exec drizzle-kit push", note: "Execute from within packages/db to hydrate the local SQLite schema without sensitive data." },
          { code: "pnpm run dev", note: "Start the Next.js and Turborepo engines locally on port 3000." }
        ],
        alert: "Initial Login: The local DB is empty. Use Identity Code: 1111222233334444 and Password: sss to enter God Mode, then create your own 'Owner' account in the IAM Console."
      },
      id: {
        title: "Fase 1: Ritual Persiapan Lingkungan",
        desc: "Prosedur sangat presisi untuk membangkitkan sistem di laptop lokal. Ikuti tanpa improvisasi sedikitpun.",
        steps: [
          { code: "git clone https://github.com/tsmsumu/ultramodul.xyz.git", note: "Kloning repositori perusahaan." },
          { code: "pnpm install", note: "WAJIB menggunakan PNPM. Penggunaan npm/yarn akan merusak sistem dan kode akan otomatis ditolak." },
          { code: "pnpm exec drizzle-kit push", note: "Jalankan dari dalam folder packages/db untuk membangun kerangka database lokal (tanpa isi)." },
          { code: "pnpm run dev", note: "Nyalakan mesin Next.js dan Turborepo di port 3000." }
        ],
        alert: "Login Pertama: Karena database lokal murni kosong, gunakan Kunci Dewa (Username: 1111222233334444, Pass: sss). Setelah masuk, buat akun 'Owner' asli atas nama Anda di IAM Console."
      }
    },
    ARCH: {
      en: {
        title: "Phase 2: Architectural Strictness",
        desc: "UltraModul is built for extreme performance, aesthetic beauty, and maintainability. Mediocrity is instantly rejected.",
        rules: [
          { title: "No 'any' Types", icon: AlertTriangle, detail: "TypeScript Strict Mode is enforced. Using the 'any' type demonstrates laziness. Type your data strictly or the build will fail." },
          { title: "Shadcn & Tailwind v4", icon: MonitorSmartphone, detail: "Raw CSS is prohibited. Use Tailwind CSS utility classes. All interactive components must be sourced from Shadcn UI for world-class consistency." },
          { title: "Zero Spinner Policy", icon: Zap, detail: "Avoid infinite loading spinners. Use Skeleton loaders and Framer Motion for 0.2s instant micro-interactions." },
          { title: "Universal i18n", icon: Code, detail: "Never hardcode text in JSX. All labels must be routed through next-intl (id.json and en.json) to support English (Default) and Indonesian." }
        ]
      },
      id: {
        title: "Fase 2: Standar Mutlak Arsitektur",
        desc: "UltraModul dibangun untuk performa ekstrem, keindahan estetika, dan kerapian tingkat dunia. Kode amatir akan langsung ditolak.",
        rules: [
          { title: "Haram Menggunakan 'any'", icon: AlertTriangle, detail: "TypeScript Strict diaktifkan paksa. Menulis tipe data 'any' adalah bukti kemalasan. Jika ditemukan, kode akan langsung dibuang." },
          { title: "Tailwind & Shadcn UI", icon: MonitorSmartphone, detail: "Dilarang menulis CSS mentah. Wajib memakai Tailwind. Semua tombol/tabel wajib menggunakan struktur Shadcn UI agar konsisten seperti Google/Vercel." },
          { title: "Anti Loading Muter-muter", icon: Zap, detail: "Jangan biarkan pengguna menunggu layar kosong. Gunakan Skeleton Loading dan transisi instan 0.2 detik dengan Framer Motion." },
          { title: "Wajib Multi-Bahasa (i18n)", icon: Code, detail: "Jangan pernah mengetik teks bahasa Indonesia langsung di dalam komponen HTML. Semuanya wajib ditaruh di id.json dan en.json." }
        ]
      }
    },
    GIT: {
      en: {
        title: "Phase 3: The Multiverse Branching Protocol",
        desc: "All developers operate in isolated timelines. The 'main' branch is sacred and represents the live production server.",
        workflow: [
          "Create Isolation Branch: git checkout -b feat/your-module-name",
          "Develop and test heavily on localhost:3000.",
          "Commit using Conventional Commits: 'feat: add payroll table' or 'fix: resolve IAM bug'.",
          "Push to your branch: git push origin feat/your-module-name",
          "Open a Pull Request (PR) on GitHub.",
          "WAIT. You are forbidden from pressing the Merge button. The Admin will review, approve, and execute the Grand Merge."
        ]
      },
      id: {
        title: "Fase 3: Protokol Percabangan Multiverse (Git)",
        desc: "Semua developer dikarantina di jalur waktunya masing-masing. Jalur 'main' adalah jalur suci yang merepresentasikan server asli.",
        workflow: [
          "Buat Jalur Karantina: git checkout -b feat/nama-modul-anda",
          "Ketik kode dan lakukan tes gila-gilaan HANYA di localhost:3000.",
          "Simpan dengan pesan rapi: 'feat: menambah fitur gaji' atau 'fix: memperbaiki bug IAM'.",
          "Kirim ke awan: git push origin feat/nama-modul-anda",
          "Ajukan Permohonan Penggabungan (Pull Request) di GitHub.",
          "BERHENTI. Anda haram menekan tombol Merge. Hanya Sang Admin (Owner) yang berhak mengecek dan menggabungkan keringat Anda ke sistem utama."
        ]
      }
    },
    DEPLOY: {
      en: {
        title: "Phase 4: The Deployment Engine",
        desc: "Deployment is a one-click automated strike initiated solely by the Supreme Admin from the VPS command center.",
        action: "The developer's job ends at the Pull Request. Once the Admin merges the PR on GitHub, the Admin executes the following highly-classified strike command on the VPS:",
        command: "node scripts/fix-deploy.js",
        result: "This script automatically tears down the old engine, re-clones the exact GitHub state, resolves dependencies, compiles the Next.js production build, executes Database Schemas, and restarts the PM2 and Nginx daemons with zero downtime."
      },
      id: {
        title: "Fase 4: Mesin Peluncuran (Deployment)",
        desc: "Peluncuran kode ke publik adalah serangan presisi 1-klik yang HANYA boleh dan bisa ditekan oleh Admin Tertinggi di Server.",
        action: "Pekerjaan developer SELESAI saat Pull Request disetujui. Setelah Admin menyetujui kode di GitHub, Admin akan menjalankan perintah rahasia negara ini di dalam terminal VPS:",
        command: "node scripts/fix-deploy.js",
        result: "Skrip sakti ini akan otomatis merobohkan mesin lama, menarik kode GitHub yang baru, mengkompilasi file Production Next.js, menekan skema database terbaru tanpa menghapus data lama, dan menghidupkan ulang sistem PM2 & Nginx seketika (Zero Downtime)."
      }
    }
  };

  const c = CONTENT[activeTab][lang];

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-6rem)] flex flex-col font-sans py-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* GLOWING HEADER */}
      <div className="relative overflow-hidden bg-black/90 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl mb-8 group">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-linear-to-bl from-indigo-600/20 via-purple-600/10 to-transparent blur-[80px] rounded-full pointer-events-none group-hover:opacity-100 transition duration-1000" />
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-linear-to-tr from-emerald-600/10 to-transparent blur-[80px] rounded-full pointer-events-none" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-24 h-24 bg-linear-to-br from-indigo-900 to-black border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] shrink-0">
               <Code className="w-12 h-12 text-indigo-400" />
            </div>
            <div className="text-center md:text-left flex-1">
               <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-200 to-indigo-400 tracking-widest uppercase mb-3">
                 The Ultra-Codex
               </h1>
               <p className="text-zinc-400 text-sm md:text-base max-w-3xl leading-relaxed mb-6 font-medium">
                 {lang === 'en' 
                   ? "The definitive, hyper-detailed blueprint for world-class remote orchestration. These strict protocols guarantee absolute zero-trust security, zero-amnesia, and enterprise-grade code precision." 
                   : "Cetak biru paling definitif dan ultra-detail untuk orkestrasi tim jarak jauh kelas dunia. Protokol ini menjamin keamanan mutlak zero-trust, anti-amnesia, dan presisi kode kelas korporat."}
               </p>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-3">
                 <span className="text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                   <ShieldCheck className="w-3 h-3" /> Zero-Trust Active
                 </span>
                 <span className="text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-2">
                   <Server className="w-3 h-3" /> Supreme Admin Controlled
                 </span>
               </div>
            </div>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
         {/* TABS SIDEBAR */}
         <div className="w-full lg:w-72 shrink-0 flex flex-col gap-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button aria-label="Action button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group
                    ${isActive 
                      ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30 text-white' 
                      : 'bg-black/40 hover:bg-white/5 border border-white/5 text-zinc-400 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="text-sm font-bold tracking-wider uppercase">{lang === 'en' ? tab.en : tab.ina}</span>
                  {isActive && (
                    <motion.div layoutId="activeTabIndicator" className="absolute inset-0 bg-white/10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                </button>
              );
            })}
         </div>

         {/* CONTENT CANVAS */}
         <div className="flex-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12 overflow-hidden relative shadow-2xl">
            <AnimatePresence mode="wait">
               <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                 exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                 transition={{ duration: 0.3 }}
                 className="h-full flex flex-col"
               >
                 <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-4">
                   {(c as any).title}
                 </h2>
                 <p className="text-lg text-indigo-300/80 leading-relaxed mb-10 font-medium">
                   {(c as any).desc}
                 </p>

                 {/* PRIME DIRECTIVE POINTS */}
                 {activeTab === 'PRIME' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(c as any).points.map((p: any, i: number) => (
                         <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/30 transition-colors group">
                            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-4 font-black font-mono text-lg border border-indigo-500/20 group-hover:scale-110 transition-transform">{i+1}</div>
                            <h3 className="text-white font-bold mb-2 tracking-wide uppercase text-sm">{p.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">{p.detail}</p>
                         </div>
                      ))}
                    </div>
                 )}

                 {/* ENVIRONMENT STEPS */}
                 {activeTab === 'ENV' && (
                    <div className="space-y-6">
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-white/10 before:to-transparent">
                         {(c as any).steps.map((s: any, i: number) => (
                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                               <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-900 text-indigo-400 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">
                                 {i+1}
                               </div>
                               <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 border border-white/10 p-5 rounded-2xl hover:border-indigo-500/50 transition-colors">
                                 <code className="block text-xs md:text-sm text-emerald-400 bg-black/50 p-3 rounded-xl mb-3 border border-white/5 font-mono break-all">{s.code}</code>
                                 <p className="text-sm text-zinc-400">{s.note}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                      <div className="mt-8 bg-amber-950/30 border border-amber-900/50 rounded-2xl p-6 flex gap-4 items-start">
                         <Key className="w-6 h-6 text-amber-500 shrink-0" />
                         <p className="text-amber-200/80 text-sm leading-relaxed font-medium">{(c as any).alert}</p>
                      </div>
                    </div>
                 )}

                 {/* ARCHITECTURE RULES */}
                 {activeTab === 'ARCH' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {(c as any).rules.map((r: any, i: number) => {
                         const RIcon = r.icon;
                         return (
                           <div key={i} className="bg-linear-to-br from-white/5 to-transparent border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-colors group">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 group-hover:text-indigo-400 transition-colors">
                                   <RIcon className="w-5 h-5" />
                                </div>
                                <h3 className="text-white font-bold tracking-wide uppercase text-sm">{r.title}</h3>
                              </div>
                              <p className="text-zinc-400 text-sm leading-relaxed">{r.detail}</p>
                           </div>
                         )
                       })}
                    </div>
                 )}

                 {/* GIT WORKFLOW */}
                 {activeTab === 'GIT' && (
                    <div className="bg-zinc-950/80 border border-white/5 rounded-3xl p-6 md:p-10 font-mono">
                      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
                         <Terminal className="w-5 h-5 text-zinc-500" />
                         <span className="text-zinc-500 text-sm">bash — supreme_git_protocol.sh</span>
                      </div>
                      <div className="space-y-4">
                         {(c as any).workflow.map((line: string, i: number) => {
                           const isCommand = line.includes("git ");
                           const isWait = line.includes("WAIT") || line.includes("BERHENTI");
                           return (
                             <div key={i} className="flex gap-4 items-start">
                                <span className="text-zinc-600 shrink-0 select-none">{String(i+1).padStart(2, '0')}</span>
                                <span className={`text-sm md:text-base leading-relaxed ${isCommand ? 'text-emerald-400 font-bold' : isWait ? 'text-red-400 font-bold' : 'text-zinc-300'}`}>
                                  {isWait ? <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {line}</span> : line}
                                </span>
                             </div>
                           )
                         })}
                      </div>
                    </div>
                 )}

                 {/* DEPLOYMENT */}
                 {activeTab === 'DEPLOY' && (
                    <div className="flex flex-col h-full justify-center space-y-8">
                       <div className="bg-red-950/20 border border-red-900/30 p-6 md:p-8 rounded-3xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Lock className="w-32 h-32 text-red-500" />
                          </div>
                          <h3 className="text-red-500 font-black tracking-widest uppercase mb-4 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6" /> RESTRICTED ZONE
                          </h3>
                          <p className="text-red-200/80 text-sm md:text-base leading-relaxed relative z-10 font-medium">
                            {(c as any).action}
                          </p>
                       </div>

                       <div className="bg-black border border-indigo-500/30 p-6 rounded-2xl flex items-center justify-between group cursor-text">
                          <code className="text-indigo-400 font-mono font-bold text-lg md:text-xl tracking-wider">{(c as any).command}</code>
                          <div className="w-3 h-8 bg-indigo-500 animate-pulse" />
                       </div>

                       <p className="text-zinc-400 text-sm leading-relaxed text-center px-4 md:px-12">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 inline mr-2 -mt-1" />
                          {(c as any).result}
                       </p>
                    </div>
                 )}

               </motion.div>
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
