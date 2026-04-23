"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, MessageSquare, Users, Radio, Image as ImageIcon, Video } from "lucide-react";
import { globalSearchLogs } from "@/app/actions/global-search";
import EntityRenderer from "./EntityRenderer";

export default function GlobalSearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    // Escape key to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const search = async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await globalSearchLogs(query);
        setResults(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(search, 500); // Debounce
    return () => clearTimeout(timer);
  }, [query]);

  const getIconForType = (type: string) => {
    switch(type) {
      case 'chat': return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'wag': case 'tgGroup': return <Users className="w-4 h-4 text-emerald-400" />;
      case 'status': return <Radio className="w-4 h-4 text-indigo-400" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch(type) {
      case 'chat': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'wag': case 'tgGroup': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'status': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-4 border-b border-white/10 bg-zinc-900/50">
          <Search className="w-6 h-6 text-zinc-400 ml-2" />
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search across Chat, WAG, and Status... (min 3 chars)" 
            className="flex-1 bg-transparent border-none outline-none text-white text-xl px-4 placeholder-zinc-600 font-light tracking-wide"
          />
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-[#0b141a]">
          {loading && (
            <div className="p-8 text-center text-zinc-500 flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching Omni-Matrix...</span>
            </div>
          )}

          {!loading && query.length >= 3 && results.length === 0 && (
            <div className="p-12 text-center text-zinc-500">
              No results found across any logbook.
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="flex flex-col gap-2 p-2">
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold px-3 py-2">
                Found {results.length} Intel Records
              </div>
              
              {results.map((r, i) => (
                <div key={`${r.type}-${r.id}-${i}`} className="bg-[#202c33] border border-white/5 rounded-xl p-4 flex gap-4 hover:border-white/20 transition-colors group">
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/5">
                      {getIconForType(r.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${getBadgeColor(r.type)}`}>
                        {r.type}
                      </span>
                      <span className="font-bold text-white text-sm">{r.sourceName}</span>
                      {r.senderName && r.senderName !== r.sourceName && (
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <span className="text-zinc-600">▶</span> {r.senderName}
                        </span>
                      )}
                      <span className="text-xs text-zinc-500 ml-auto whitespace-nowrap">
                        {new Date(r.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-[#e9edef] mt-2 whitespace-pre-wrap leading-relaxed break-words bg-[#111b21] p-3 rounded-lg border border-white/5">
                      <EntityRenderer content={r.textContent || ''} />
                    </div>

                    {r.mediaUrl && (
                      <div className="mt-3">
                        <a href={r.mediaUrl} target="_blank" className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-zinc-300 transition-colors border border-white/10">
                          {r.mediaUrl.match(/\.(mp4|ogg)$/i) ? <Video className="w-4 h-4 text-emerald-400" /> : <ImageIcon className="w-4 h-4 text-blue-400" />}
                          View Attached Media
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && query.length < 3 && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 p-12">
              <Search className="w-16 h-16 opacity-20 mb-4" />
              <p className="text-lg font-light tracking-wide">Enter at least 3 characters to search</p>
              <p className="text-sm mt-2 opacity-50 text-center max-w-md">The Ultra Matrix Command Search will simultaneously scan all Chat, WAG, and Status logbooks in real-time.</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-950 border-t border-white/5 text-[10px] text-zinc-500 flex justify-between uppercase tracking-widest font-bold">
          <span>Omni-Matrix Search Engine</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
