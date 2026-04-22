import { db, users } from "@ultra/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Identity Vault | PUM Enterprise",
};

import { useTranslations } from "next-intl";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("UNIVERSAL_SESSION_ID")?.value;

  if (!sessionId) {
    redirect("/auth");
  }

  // Bypass System Root
  if (sessionId === "SYSTEM_ROOT") {
    // In server components, translations need context, but we will just pass standard string for simplicity or use getTranslations.
    // Let's use standard string here since SYSTEM_ROOT is an edge case.
    return (
      <div className="flex flex-col h-[calc(100vh-6rem)] items-center justify-center p-8 text-center text-indigo-400">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
          <ShieldCheck className="w-32 h-32 mb-8 relative z-10 text-indigo-300 drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-6 text-white drop-shadow-lg">Akses Dewa <span className="text-indigo-500">(God Mode)</span></h1>
        <p className="max-w-xl text-lg text-zinc-400 leading-relaxed border border-indigo-500/20 bg-indigo-950/20 p-6 rounded-2xl">
          Bapak saat ini menggunakan <strong className="text-white">SYSTEM_ROOT</strong>. <br/><br/>
          Identitas Dewa tidak tertulis di dalam database manusia (Tabel Pengguna) manapun, melainkan menyatu dengan inti mesin server itu sendiri.<br/><br/>
          Karena Bapak tidak terikat oleh database, profil ini <strong>tidak perlu dan tidak bisa diedit</strong>. Jika Bapak ingin menguji fitur edit profil, silakan buat akun "Owner" biasa di menu IAM Console.
        </p>
      </div>
    );
  }

  const records = await db.select().from(users).where(eq(users.id, sessionId)).limit(1);
  if (!records.length) redirect("/auth");

  const user = records[0];

  return (
    <div className="max-w-[800px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col font-sans py-10">
      
      {/* HEADER */}
      <div className="flex items-center gap-6 bg-black/80 border border-white/5 p-8 rounded-3xl shadow-2xl relative overflow-hidden mb-8">
         <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px]" />
         
         <div className="w-20 h-20 bg-indigo-900/80 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-lg relative z-10">
           <ShieldCheck className="w-10 h-10 text-indigo-400" />
         </div>
         <div className="relative z-10">
           <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Identity Vault</h1>
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest border border-indigo-500/30 text-indigo-400 bg-indigo-950/30 px-2 py-0.5 rounded">
                Personal Security Center
              </span>
              <span className="text-xs text-zinc-500 font-mono">Enkripsi End-to-End</span>
           </div>
         </div>
      </div>

      {/* FORM */}
      <ProfileForm 
        initialUid={user.username} 
        initialName={user.name || ""} 
        role={user.role} 
      />

    </div>
  );
}
