"use client";

import { Shield, LayoutDashboard, Key, Users, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ModuleRegistry } from "@/core/module-registry";
import NextLink from "next/link";

export function Sidebar({ isOpen, permissions }: { isOpen: boolean, permissions: Record<string, string[]> | null }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tCat = useTranslations("categories");

  const canSee = (moduleName: string) => {
    // Fallback: If no permissions bound (no logged in user active), show all menus for dev preview
    if (!permissions) return true;
    if (permissions["ALL_ACCESS_JIT"]) return true; // JIT Emergency Aktif
    return permissions[moduleName]?.includes("VIEW");
  };

  const groupedModules = ModuleRegistry.reduce((acc, mod) => {
    const cat = mod.category || "hub";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(mod);
    return acc;
  }, {} as Record<string, typeof ModuleRegistry>);

  const categoryOrder = ["hub", "iam", "data", "infra"];

  return (
    <aside 
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white/90 dark:bg-[#09090b]/95 border-r border-gray-200 dark:border-white/10 backdrop-blur-xl transition-all duration-300 z-30 flex flex-col
        ${isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-16 lg:translate-x-0"}
      `}
    >
      <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto custom-scrollbar">
        {categoryOrder.map(cat => {
           const mods = groupedModules[cat] || [];
           // Cek apakah ada satupun modul di kategori ini yang boleh dilihat
           const visibleMods = mods.filter(mod => canSee(mod.id));
           if (visibleMods.length === 0) return null;

           return (
             <div key={cat} className="space-y-1">
               {/* Sembunyikan Header Kategori jika menu menyempit */}
               <div className={`px-3 pt-2 pb-1 text-[10px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase transition-opacity duration-300 ${isOpen ? "opacity-100" : "lg:opacity-0"}`}>
                 {tCat(cat as any)}
               </div>
               
               {visibleMods.map((mod) => {
                 const isActive = pathname?.startsWith(mod.path);
                 const Icon = mod.icon;
                 return (
                   <NextLink
                     key={mod.id}
                     href={mod.path}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative overflow-hidden
                       ${isActive 
                         ? "bg-indigo-600 dark:bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                         : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                       }
                     `}
                   >
                     <div className="relative z-10 flex items-center justify-center">
                       <Icon className={`w-5 h-5 ${isActive ? "text-white" : "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"}`} />
                     </div>
                     <span className={`relative z-10 whitespace-nowrap transition-opacity duration-300 ${isOpen ? "opacity-100" : "lg:opacity-0"}`}>
                       {t(mod.id as any)}
                     </span>
                   </NextLink>
                 );
               })}
             </div>
           );
        })}
      </nav>
    </aside>
  );
}
