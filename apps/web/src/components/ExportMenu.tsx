import { useState } from "react";
import { Download, ChevronDown, FileText, FileSpreadsheet, FileJson, FileCode2, FileType2 } from "lucide-react";
import { exportData, ExportFormat, ExportOptions } from "@/lib/exportUtils";

export default function ExportMenu({ options }: { options: ExportOptions }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsOpen(false);
    await exportData(format, options);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
      >
        <Download className="w-4 h-4" /> Export Ultra <ChevronDown className="w-3 h-3 ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
            <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-400" /> PDF Document
            </button>
            <button onClick={() => handleExport('xlsx')} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-400 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-green-400" /> Excel (.xlsx)
            </button>
            <button onClick={() => handleExport('docx')} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Word (.docx)
            </button>
            <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-400 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-yellow-400" /> CSV
            </button>
            <button onClick={() => handleExport('json')} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-400 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-orange-400" /> JSON Data
            </button>
            <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-400 flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-purple-400" /> HTML Page
            </button>
            <button onClick={() => handleExport('txt')} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-indigo-500/20 hover:text-indigo-400 flex items-center gap-2">
              <FileType2 className="w-4 h-4 text-gray-400" /> Plain Text (.txt)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
