"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Moon, Sun, Languages } from "lucide-react";

export default function Home() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();

  const toggleLanguage = () => {
    // A simple client-side toggle for demonstration via cookie
    const currentLocale = document.cookie.includes('NEXT_LOCALE=id') ? 'id' : 'en';
    const newLocale = currentLocale === 'en' ? 'id' : 'en';
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
           {t("home.title")}
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none gap-4">
          
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            {t("theme.toggle")}
          </button>

          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-100 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/60 transition"
          >
            <Languages size={18} />
            {t("language.toggle")}
          </button>

        </div>
      </div>

      <div className="mt-32 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
          {t("home.welcome")}
        </h1>
        <p className="text-xl text-neutral-500 dark:text-neutral-400">
          {t("home.subtitle")}
        </p>
      </div>
    </main>
  );
}
