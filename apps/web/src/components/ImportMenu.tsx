import { useState, useRef } from "react";
import { Upload, FileJson, X, Check, Loader2 } from "lucide-react";

interface ImportMenuProps {
  onImport: (data: any[]) => Promise<void>;
  isLoading: boolean;
  type: "chat" | "wag" | "status" | "tgGroup" | "tgChannel" | "tgChat" | "sigGroup" | "sigStory" | "sigChat" | "smsChat" | "smsGroup" | "smsStory"|"sigStory" | "sigChat" | "smsChat" | "smsGroup" | "smsStory";
}

export default function ImportMenu({ onImport, isLoading, type }: ImportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileData, setFileData] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      alert("Ultra Import only supports .json files currently. Please export as JSON first.");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setFileData(json);
        } else {
          alert("Invalid JSON structure. Must be an array of logs.");
          setFileData(null);
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
        setFileData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleExecuteImport = async () => {
    if (!fileData) return;
    
    // Time Filtering Logic
    let filteredData = fileData;
    if (dateFrom || dateTo) {
      const fromTime = dateFrom ? new Date(dateFrom).getTime() : 0;
      const toTime = dateTo ? new Date(dateTo).getTime() : Infinity;
      
      filteredData = fileData.filter(row => {
        let rowTime = 0;
        if (row.date && row.time) {
           rowTime = new Date(`${row.date} ${row.time}`).getTime();
        } else if (row.timestamp) {
           rowTime = new Date(row.timestamp).getTime();
        }
        
        if (!rowTime) return true;
        return rowTime >= fromTime && rowTime <= toTime;
      });
    }

    if (filteredData.length === 0) {
      alert("No data matches the selected date range.");
      return;
    }

    await onImport(filteredData);
    setIsOpen(false);
    setFileData(null);
    setFileName("");
    setDateFrom("");
    setDateTo("");
  };

  const getAccentColor = () => {
    if (type === 'chat') return 'blue';
    if (type === 'wag' || type === 'tgGroup' || type === 'sigGroup') return 'emerald';
    return 'indigo';
  };
  const color = getAccentColor();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
      >
        <Upload className="w-4 h-4" /> Import Data
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className={`bg-${color}-900/20 p-6 border-b border-${color}-500/20 flex justify-between items-center`}>
              <div>
                <h3 className={`text-lg font-bold text-${color}-400 flex items-center gap-2`}>
                  <Upload className="w-5 h-5" /> Smart Import Engine
                </h3>
                <p className="text-xs text-zinc-400 mt-1">Zero-Duplication Re-Integration System</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {!fileData ? (
                <div 
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${dragActive ? `border-${color}-500 bg-${color}-500/10` : 'border-white/10 hover:border-white/20 bg-black/40'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept=".json" onChange={handleChange} className="hidden" />
                  <FileJson className={`w-12 h-12 mx-auto mb-4 ${dragActive ? `text-${color}-400` : 'text-zinc-500'}`} />
                  <h4 className="text-sm font-bold text-white mb-2">Upload JSON Export File</h4>
                  <p className="text-xs text-zinc-500">Drag & drop your previously exported .json file here</p>
                </div>
              ) : (
                <div className={`bg-${color}-500/10 border border-${color}-500/20 rounded-2xl p-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className={`bg-${color}-500/20 p-2 rounded-lg`}>
                      <FileJson className={`w-6 h-6 text-${color}-400`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{fileName}</h4>
                      <p className={`text-xs text-${color}-400`}>{fileData.length} logs detected</p>
                    </div>
                  </div>
                  <button onClick={() => setFileData(null)} className="text-zinc-500 hover:text-red-400 text-xs font-bold px-3 py-1 rounded-lg bg-black/40">Change File</button>
                </div>
              )}

              {fileData && (
                <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Time Filter (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-1">From Date</label>
                      <input type="datetime-local" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500" />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-1">To Date</label>
                      <input type="datetime-local" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-black/40 flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button 
                onClick={handleExecuteImport} 
                disabled={!fileData || isLoading}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${!fileData || isLoading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : `bg-${color}-600 hover:bg-${color}-500 text-white shadow-[0_0_20px_rgba(0,0,0,0.3)]`}`}
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : <><Check className="w-4 h-4" /> Start Zero-Dup Import</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
