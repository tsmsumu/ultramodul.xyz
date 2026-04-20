"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export default function ClientDashboardLayout({ children, layoutType }: { children: React.ReactNode, layoutType: string }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  if (layoutType === "topbar") {
    return (
      <div className="min-h-screen bg-transparent flex flex-col pt-16">
        <header className="fixed top-0 z-40 w-full backdrop-blur-xl bg-white/80 dark:bg-[#0a0a0c]/90 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-6 h-16 shadow-sm">
           <div className="font-bold tracking-wide">UM Platform (Top Navigation)</div>
           <nav className="hidden md:flex gap-6 text-sm font-medium">
             <a href="/iam" className="hover:text-blue-500 transition">IAM Console</a>
             <a href="/mandate" className="hover:text-blue-500 transition">Delegasi Mandat</a>
             <a href="/access" className="hover:text-blue-500 transition">Access Matrix</a>
             <a href="/logbook" className="hover:text-blue-500 transition">Audit Logbook</a>
           </nav>
        </header>
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    );
  }

  // DEFAULT SIDEBAR
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`flex-1 transition-all duration-300 h-[calc(100vh-4rem)] overflow-y-auto ${isSidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}>
          <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
