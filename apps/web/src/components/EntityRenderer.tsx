"use client";

import React from "react";
import { Copy, MapPin, Mail, Phone, DollarSign, Link as LinkIcon } from "lucide-react";

interface EntityRendererProps {
  content: string;
}

// Regex patterns
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const EMAIL_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
const PHONE_REGEX = /(\+?62\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}|\b08\d{8,11}\b)/g;
const CURRENCY_REGEX = /(Rp\s?\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\b\d{1,3}(?:\.\d{3})*(?:,\d{2})?\s?(ribu|juta|miliar|triliun)\b)/gi;

export default function EntityRenderer({ content }: EntityRendererProps) {
  if (!content) return <span className="text-zinc-500 italic">No text content</span>;

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    // Visual feedback could go here
  };

  // Simple tokenization logic
  // We will split by a combined regex and then identify the type
  const combinedRegex = new RegExp(
    `(${URL_REGEX.source})|(${EMAIL_REGEX.source})|(${PHONE_REGEX.source})|(${CURRENCY_REGEX.source})`,
    "gi"
  );

  const parts = content.split(combinedRegex).filter(Boolean);

  // Note: The split with multiple capture groups creates a lot of undefined/empty strings or partial matches.
  // A safer approach is to do replace with a replacer function, but for React elements, we need an array.
  
  // Alternative safer approach:
  let elements: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Need to reset regex state
  const safeRegex = new RegExp(
    `(${URL_REGEX.source})|(${EMAIL_REGEX.source})|(${PHONE_REGEX.source})|(${CURRENCY_REGEX.source})`,
    "gi"
  );

  let match;
  while ((match = safeRegex.exec(content)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      elements.push(<span key={`text-${lastIndex}`}>{content.slice(lastIndex, match.index)}</span>);
    }

    const matchedText = match[0];
    let type = "unknown";
    let Icon = Copy;

    if (matchedText.match(URL_REGEX)) { type = "url"; Icon = LinkIcon; }
    else if (matchedText.match(EMAIL_REGEX)) { type = "email"; Icon = Mail; }
    else if (matchedText.match(PHONE_REGEX)) { type = "phone"; Icon = Phone; }
    else if (matchedText.match(CURRENCY_REGEX)) { type = "currency"; Icon = DollarSign; }

    elements.push(
      <span 
        key={`entity-${match.index}`} 
        className={`inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded text-xs font-bold border border-opacity-50 cursor-pointer transition-colors group
          ${type === 'url' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20' : 
            type === 'email' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20' :
            type === 'phone' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' :
            type === 'currency' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20' :
            'bg-zinc-500/10 text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/20'
          }
        `}
        onClick={(e) => handleCopy(e, matchedText)}
        title="Click to copy"
      >
        <Icon className="w-3 h-3 opacity-70 group-hover:opacity-100" />
        {matchedText}
      </span>
    );

    lastIndex = safeRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    elements.push(<span key={`text-${lastIndex}`}>{content.slice(lastIndex)}</span>);
  }

  return (
    <div className="leading-relaxed whitespace-pre-wrap">
      {elements.length > 0 ? elements : content}
    </div>
  );
}
