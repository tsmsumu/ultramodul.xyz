"use client";

import { Shield, LayoutDashboard, Key, Users, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Command Center", icon: LayoutDashboard, href: "/dashboard", moduleName: "Dashboard" },
  { name: "IAM Console", icon: Shield, href: "/iam", moduleName: "IAM Console" },
  { name: "Delegasi Mandat", icon: Key, href: "/mandate", moduleName: "Keamanan Mandat" },
  { name: "Active Identity", icon: Users, href: "/access", moduleName: "Active Identity Matrix" },
  { name: "Audit Logbook", icon: BookOpen, href: "/logbook", moduleName: "Audit Logbook Intel" },
];

export function Sidebar({ isOpen, permissions }: { isOpen: boolean, permissions: Record<string, string[]> | null }) {
  const pathname = usePathname();

  const canSee = (moduleName: string) => {
    // Fallback: If no permissions bound (no logged in user active), show all menus for dev preview
    if (!permissions) return true;
    return permissions[moduleName]?.includes("VIEW");
  };

  return (
    <aside 
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white/90 dark:bg-[#09090b]/95 border-r border-gray-200 dark:border-white/10 backdrop-blur-xl transition-all duration-300 z-30 flex flex-col
        ${isOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full lg:w-16 lg:translate-x-0"}
      `}
    >
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (!canSee(item.moduleName)) return null; // GAIB LOGIC: Menu disappears entirely!

          const isActive = pathname?.startsWith(item.href);
          return (
            <NextLink
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group overflow-hidden
                ${isActive 
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"}
              `}
              title={item.name}
            >
              <item.icon className={`min-w-[20px] w-5 h-5 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
              <span className={`whitespace-nowrap transition-opacity duration-200
                ${isOpen ? "opacity-100" : "opacity-0 lg:hidden"}
              `}>
                {item.name}
              </span>
            </NextLink>
          );
        })}
      </nav>
    </aside>
  );
}
