"use client";

import React, { useEffect, useRef } from "react";
import EntityRenderer from "./EntityRenderer";

interface ThreadViewProps {
  logs: any[];
  targetId: string;
  targetName: string;
  highlightLogId?: string;
  onClose: () => void;
}

export default function ThreadView({ logs, targetId, targetName, highlightLogId, onClose }: ThreadViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Filter logs for this specific target and sort chronologically
  const threadLogs = logs
    .filter(l => l.targetId === targetId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    if (scrollRef.current && highlightLogId) {
      const el = document.getElementById(`log-${highlightLogId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Scroll to bottom by default
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [highlightLogId, threadLogs]);

  if (threadLogs.length === 0) return <div className="text-zinc-500 italic p-6">No conversation history found.</div>;

  return (
    <div className="flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] rounded-xl overflow-hidden border border-white/5 relative">
      {/* Background WhatsApp pattern simulation */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-solid-dark-grey.jpg")', backgroundSize: 'cover' }}></div>
      
      {/* Thread Header */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-3 border-b border-[#d1d7db] dark:border-[#222d34] flex items-center gap-3 z-10">
        <button onClick={onClose} className="p-2 mr-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-[#54656f] dark:text-[#aebac1] transition-colors">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"></path></svg>
        </button>
        <div className="w-10 h-10 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300">
          {targetName.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="font-semibold text-[#111b21] dark:text-[#e9edef]">{targetName}</div>
          <div className="text-xs text-[#667781] dark:text-[#8696a0]">Intel Thread View</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-2 z-10 custom-scrollbar">
        {threadLogs.map(l => {
          const isMe = l.isFromMe || l.senderNumber === 'Me'; // Adjust based on data structure
          const isHighlighted = l.id === highlightLogId;
          const timeString = new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateString = new Date(l.timestamp).toLocaleDateString();

          return (
            <div key={l.id} id={`log-${l.id}`} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
              <div 
                className={`max-w-[85%] md:max-w-[65%] rounded-lg px-3 py-2 pb-6 relative shadow-sm
                  ${isMe ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-tr-none' : 'bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-tl-none'}
                  ${isHighlighted ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#efeae2] dark:ring-offset-[#0b141a]' : ''}
                `}
              >
                {!isMe && <div className="text-xs font-bold text-indigo-500 dark:text-indigo-400 mb-1">{l.senderName || targetName}</div>}
                
                {l.mediaUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-black/10">
                    {l.mediaType === 'video' ? (
                      <video src={l.mediaUrl} controls className="max-h-64 object-contain w-full" />
                    ) : (
                      <img src={l.mediaUrl} alt="Media" className="max-h-64 object-contain w-full cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(l.mediaUrl, '_blank')} />
                    )}
                  </div>
                )}
                
                <div className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                  <EntityRenderer content={l.textContent || ''} />
                </div>
                
                <div className="absolute bottom-1 right-2 text-[10px] text-[#667781] dark:text-[#8696a0] flex items-center gap-1">
                  {timeString}
                  {isMe && <span className="text-[#53bdeb]">✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
