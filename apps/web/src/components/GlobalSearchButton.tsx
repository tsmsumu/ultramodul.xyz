"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import GlobalSearchModal from "./GlobalSearchModal";

export default function GlobalSearchButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-black/40 hover:bg-white/5 border border-white/10 rounded-xl px-4 py-2 transition-colors group"
      >
        <Search className="w-4 h-4 text-zinc-400 group-hover:text-white" />
        <span className="text-sm text-zinc-400 group-hover:text-white">Search Omni-Matrix...</span>
        <div className="ml-4 flex items-center gap-1">
          <kbd className="bg-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">Ctrl</kbd>
          <span className="text-xs text-zinc-500">+</span>
          <kbd className="bg-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-300">K</kbd>
        </div>
      </button>

      {isOpen && <GlobalSearchModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
