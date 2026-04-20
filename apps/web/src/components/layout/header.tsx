"use client";

import { Menu, Search, User } from "lucide-react";
import { useTranslations } from "next-intl";

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const t = useTranslations("home");

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
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
