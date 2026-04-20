"use client";

import { useState } from "react";
import { Settings, Check, LayoutPanelLeft, LayoutPanelTop, Droplet } from "lucide-react";
import { useTheme } from "next-themes";
import { saveUserPreferences } from "@/app/actions/settings";

export function ThemeCustomizer({ currentSkin, currentLayout }: { currentSkin: string, currentLayout: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Optimistic UI States
  const [skin, setSkin] = useState(currentSkin);
  const [layout, setLayout] = useState(currentLayout);

  const applyChanges = async (type: 'skin' | 'layout', value: string) => {
    // Optimistic UI rendering
    if (type === 'skin') {
      setSkin(value);
      document.documentElement.setAttribute('data-skin', value);
      await saveUserPreferences("SYSTEM", { colorSkin: value });
    } else {
      setLayout(value);
      document.documentElement.setAttribute('data-layout', value);
      await saveUserPreferences("SYSTEM", { layoutTemplate: value });
      window.location.reload(); // Hard reload required for layout wrapper shift if simple.
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-3 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-white/10 hover:shadow-xl transition-all z-50 group"
      >
        <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:rotate-45 transition-transform duration-500" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-5 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-white/10 pb-3">
             <h3 className="font-semibold flex items-center gap-2"><Settings className="w-4 h-4"/> Pengaturan Tampilan</h3>
             <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">x</button>
          </div>

          <div className="space-y-6">
            {/* Skin Colors */}
             <div>
                <p className="text-sm font-medium mb-3 flex items-center gap-1"><Droplet className="w-4 h-4"/> Skin Warna Eksklusif</p>
                <div className="grid grid-cols-3 gap-2">
                  {['default', 'ocean', 'crimson'].map((s) => (
                    <button 
                      key={s} onClick={() => applyChanges('skin', s)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition ${skin === s ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border border-gray-300 dark:border-gray-700
                         ${s === 'default' ? 'bg-zinc-900' : s === 'ocean' ? 'bg-blue-800' : 'bg-red-900'}
                      `}></div>
                      <span className="text-[10px] uppercase font-bold text-gray-600 dark:text-gray-400">{s}</span>
                    </button>
                  ))}
                </div>
             </div>

             {/* Layouts */}
             <div>
                <p className="text-sm font-medium mb-3 flex items-center gap-1"><LayoutPanelLeft className="w-4 h-4"/> Struktur Matriks (Layout)</p>
                <div className="grid grid-cols-2 gap-2">
                  {['sidebar', 'topbar'].map((l) => (
                    <button 
                      key={l} onClick={() => applyChanges('layout', l)}
                      className={`flex flex-col items-center gap-2 p-3 text-xs font-medium rounded-xl border transition ${layout === l ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                      {l === 'sidebar' ? <LayoutPanelLeft className="w-6 h-6"/> : <LayoutPanelTop className="w-6 h-6" />}
                      {l === 'sidebar' ? 'Menu Samping' : 'Menu Atas'}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
