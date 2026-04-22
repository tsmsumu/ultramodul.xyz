"use client";
import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Moon, Sun, Languages, Banknote } from "lucide-react";

export default function Home() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    // A simple client-side toggle for demonstration via cookie
    const currentLocale = document.cookie.includes('NEXT_LOCALE=id') ? 'id' : 'en';
    const newLocale = currentLocale === 'en' ? 'id' : 'en';
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const toggleCurrency = () => {
    // A simple client-side toggle for demonstration via cookie
    const currentCurrency = document.cookie.includes('NEXT_CURRENCY=IDR') ? 'IDR' : 'USD';
    const newCurrency = currentCurrency === 'USD' ? 'IDR' : 'USD';
    document.cookie = `NEXT_CURRENCY=${newCurrency}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-linear-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
           {t("home.title")}
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-linear-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none gap-4">
          
          <button aria-label="Action button" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {t("theme.toggle")}
          </button>

          <button aria-label="Action button" 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-100 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/60 transition"
          >
            <Languages size={18} />
            {t("language.toggle")}
          </button>

          <button aria-label="Action button" 
            onClick={toggleCurrency}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-100 rounded-md hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition"
          >
            <Banknote size={18} />
            {mounted ? (document.cookie.includes('NEXT_CURRENCY=IDR') ? 'IDR' : 'USD') : 'USD'}
          </button>

        </div>
      </div>

      <div className="mt-32 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          {t("home.welcome")}
        </h1>
        <p className="text-xl text-neutral-500 dark:text-neutral-400 mb-12">
          {t("home.subtitle")}
        </p>
        
        <div className="flex justify-center flex-col sm:flex-row gap-4">
          <button aria-label="Action button" 
            onClick={() => window.location.href = '/auth'}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-emerald-500/50"
          >
            Enter Gateway
          </button>
          
          <button aria-label="Action button" 
            onClick={() => window.location.href = '/register'}
            className="px-8 py-4 bg-transparent border-2 border-emerald-600/30 hover:border-emerald-500 text-emerald-500 hover:text-emerald-400 font-bold tracking-widest uppercase rounded-xl transition"
          >
            Request Access
          </button>
        </div>
      </div>
    </main>
  );
}
