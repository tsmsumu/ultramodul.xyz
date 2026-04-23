"use client";

import { useState } from "react";
import { Pen, Check, X, ShieldAlert } from "lucide-react";
import { updatePlatformName } from "@/app/actions/settings";
import { useRouter } from "next/navigation";

export function RenamePlatform({ currentName, isSupreme }: { currentName: string; isSupreme: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isSupreme) {
    return <span className="text-xl font-bold text-white tracking-widest">{currentName}</span>;
  }

  const handleSave = async () => {
    if (newName === currentName) {
      setIsEditing(false);
      return;
    }
    
    setLoading(true);
    const res = await updatePlatformName(newName);
    if (res.success) {
      setIsEditing(false);
      router.refresh();
    } else {
      alert(res.message);
      setNewName(currentName);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") {
                setNewName(currentName);
                setIsEditing(false);
              }
            }}
            disabled={loading}
            className="bg-black/50 border border-indigo-500/50 rounded-lg px-3 py-1 text-xl font-bold text-white tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
          />
          <button 
            disabled={loading}
            onClick={handleSave} 
            className="p-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 rounded-md transition"
          >
            <Check className="w-4 h-4" />
          </button>
          <button 
            disabled={loading}
            onClick={() => { setNewName(currentName); setIsEditing(false); }} 
            className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/40 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <span className="text-xl font-bold text-white tracking-widest">{currentName}</span>
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-indigo-400/50 hover:text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/20 rounded-md transition group relative"
            title="Supreme Mode: Rename Platform"
          >
            <Pen className="w-4 h-4" />
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-950 text-indigo-200 text-[10px] px-2 py-1 rounded border border-indigo-500/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap flex items-center gap-1 shadow-xl pointer-events-none">
              <ShieldAlert className="w-3 h-3 text-amber-400" /> Supreme Mode Only
            </span>
          </button>
        </>
      )}
    </div>
  );
}
