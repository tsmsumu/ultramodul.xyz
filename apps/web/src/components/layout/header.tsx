import { Menu, Search, User, LogOut, Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { fetchSandboxUsers, impersonateUser, clearImpersonation } from "@/app/actions/auth";
import { EventBus, EVENTS } from "@/core/event-bus";

export function Header({ toggleSidebar, activeUserId }: { toggleSidebar: () => void, activeUserId: string | null }) {
  const t = useTranslations("home");
  const [users, setUsers] = useState<any[]>([]);
  const [showSandbox, setShowSandbox] = useState(false);
  const [bellTing, setBellTing] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    fetchSandboxUsers().then(setUsers);

    // MENDENGAR SINYAL EVENT DARI UDARA (Pub/Sub)
    const unsubscribe = EventBus.subscribe(EVENTS.NOTIFICATION_ALERT, (payload) => {
      setAlertMsg(payload);
      setBellTing(true);
      setTimeout(() => setBellTing(false), 5000); // Matikan sirine setelah 5 detik.
    });

    return () => unsubscribe(); // Cabut jaringan saat komponen Header dibersihkan
  }, []);

  const handleImpersonate = async (id: string) => {
    await impersonateUser(id);
    window.location.reload();
  };

  const handleClear = async () => {
    await clearImpersonation();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-[#09090b]/80 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 h-16">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <span className="font-semibold text-sm tracking-wide hidden sm:block">
          {t("title")}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Omni-Search..." 
            className="pl-9 pr-4 py-1.5 text-sm bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all w-64"
          />
        </div>
        <div className="relative">
          <button 
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 
              ${bellTing ? "bg-red-500 border-red-300 text-white animate-bounce" : "bg-gray-100 dark:bg-white/5 border-transparent text-gray-500"}
            `}
          >
            <Bell className="w-4 h-4" />
          </button>
          {bellTing && (
            <div className="absolute top-10 right-0 w-64 bg-red-600 text-white text-xs p-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-2 z-50">
               <strong>Signal Received:</strong> {alertMsg}
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowSandbox(!showSandbox)}
            title={activeUserId ? "Sandbox Aktif" : "Auth Sandbox Mode"}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white cursor-pointer transition-all border-2 
              ${activeUserId ? "bg-red-500 border-red-300 animate-pulse" : "bg-indigo-600 border-transparent hover:ring-2 hover:ring-indigo-400"}
            `}
          >
            <User className="w-4 h-4" />
          </button>
          
          {/* SANDBOX DROPDOWN */}
          {showSandbox && (
            <div className="absolute top-10 right-0 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shadow-xl rounded-xl p-2 z-50">
               <div className="px-3 py-2 border-b border-gray-100 dark:border-white/10 mb-2 font-mono text-[10px] text-gray-400 uppercase tracking-wider">
                 Test Sandbox (Impersonation)
               </div>
               
               {activeUserId && (
                 <button onClick={handleClear} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md mb-2">
                   <LogOut className="w-3 h-3" /> Exit Sandbox (Return to Admin)
                 </button>
               )}

               <div className="max-h-40 overflow-y-auto space-y-1">
                 {users.map(u => (
                   <button 
                     key={u.id} 
                     onClick={() => handleImpersonate(u.id)}
                     className={`w-full text-left px-3 py-2 text-xs rounded-md truncate
                       ${activeUserId === u.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold' : 'hover:bg-gray-100 dark:hover:bg-zinc-800'}
                     `}
                   >
                     {u.name} <span className="opacity-50 ml-1">({u.role})</span>
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
