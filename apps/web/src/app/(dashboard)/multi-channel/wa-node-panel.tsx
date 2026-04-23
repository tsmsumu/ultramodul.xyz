import { useState, useEffect, useRef } from "react";
import { Radio, CheckCircle2, XCircle, Terminal as TerminalIcon, Trash2, Edit2, Check } from "lucide-react";
import { getWaEngineStatus, getWaEngineQr, sendMessageViaEngine, initWaEngineNode, deleteWhatsAppNode, renameWhatsAppNode } from "@/app/actions/multi-channel";
import { useRouter } from "next/navigation";

export default function WaNodePanel({ provider }: { provider: any }) {
  const router = useRouter();
  const [waStatus, setWaStatus] = useState<string>("initializing");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [simTo, setSimTo] = useState("");
  const [simMsg, setSimMsg] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(provider.name);

  const handleRename = async () => {
    if (editName.trim() && editName !== provider.name) {
      await renameWhatsAppNode(provider.id, editName);
      router.refresh();
    }
    setIsEditing(false);
  };

  const fetchWaStatus = async () => {
    try {
      const data = await getWaEngineStatus(provider.id);
      setWaStatus(data.status);
      if (data.status === 'qr') {
        const qrData = await getWaEngineQr(provider.id);
        if (qrData.success) setQrCode(qrData.qr);
      } else {
        setQrCode(null);
      }
    } catch (err) {
      setWaStatus('offline');
    }
  };

  const handleInitNode = async () => {
    await initWaEngineNode(provider.id, provider.name);
    fetchWaStatus();
  };

  const handleTestSend = async () => {
    if (!simTo || !simMsg) return;
    setSimLoading(true);
    const res = await sendMessageViaEngine("whatsapp", provider.id, simTo, simMsg);
    alert(res.message || (res.success ? "Sent!" : "Failed"));
    setSimLoading(false);
    setSimMsg("");
  };

  const handleDeleteNode = async () => {
    if (window.confirm("PERINGATAN KRITIS: Apakah Anda yakin ingin menghancurkan WhatsApp Node ini? Semua sesi akan dihapus secara permanen.")) {
      const res = await deleteWhatsAppNode(provider.id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Failed to delete node.");
      }
    }
  };

  useEffect(() => {
    fetchWaStatus();
  }, [provider.id]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 pb-8 border-b border-white/10 last:border-0 last:pb-0">
      {/* Omni WA-Engine Panel */}
      <div className="bg-zinc-950/80 border border-white/5 rounded-3xl p-6 shadow-xl relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-black/50 border border-white/10 text-white px-2 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-32"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
                <button onClick={handleRename} className="text-emerald-400 hover:text-emerald-300">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
                <span>{provider.name}</span>
                <Edit2 className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100" />
              </div>
            )}
          </h2>
          <div className="flex gap-2">
            <button onClick={handleInitNode} className="text-[10px] px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-lg text-indigo-300 font-bold uppercase transition-all">
              Start Node
            </button>
            <button onClick={fetchWaStatus} className="text-[10px] px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-bold uppercase transition-all">
              Refresh
            </button>
            <button onClick={handleDeleteNode} className="text-[10px] px-3 py-1.5 bg-red-500/10 hover:bg-red-500/30 rounded-lg text-red-400 font-bold uppercase transition-all flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-8 border border-white/5 border-dashed rounded-2xl bg-black/40 min-h-[300px]">
          <div className="text-center mb-6">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              waStatus === 'connected' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : 
              waStatus === 'qr' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' : 
              'bg-red-900/30 text-red-400 border-red-500/30'
            }`}>
              STATUS: {waStatus}
            </span>
          </div>

          {waStatus === 'qr' && qrCode ? (
             <div className="bg-white p-4 rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
               <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48" />
             </div>
          ) : waStatus === 'connected' ? (
             <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
               <CheckCircle2 className="w-16 h-16 text-emerald-400" />
             </div>
          ) : (
             <div className="w-32 h-32 rounded-full border-4 border-red-500/30 flex items-center justify-center">
               <XCircle className="w-16 h-16 text-red-400" />
             </div>
          )}
          
          <p className="mt-6 text-xs text-zinc-500 text-center max-w-xs">
            {waStatus === 'qr' ? "Scan this QR Code using the WhatsApp app on your mobile device to link the system." : 
             waStatus === 'connected' ? "WhatsApp Node is fully connected and ready to transmit payloads." :
             "Node is currently unreachable or offline. Click 'Start Node' to boot it up."}
          </p>
        </div>
      </div>

      {/* Test Simulator Panel */}
      <div className="bg-zinc-950/80 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col">
        <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2 mb-6">
          <TerminalIcon className="w-5 h-5 text-indigo-400" /> Live Message Simulator ({provider.name})
        </h2>
        <div className="flex-1 border border-white/5 bg-black/40 p-6 rounded-2xl space-y-4">
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Target Number</label>
            <input 
              type="text" 
              value={simTo}
              onChange={(e) => setSimTo(e.target.value)}
              placeholder="e.g. 0812..., +628..., or 628..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Payload Message</label>
            <textarea 
              value={simMsg}
              onChange={(e) => setSimMsg(e.target.value)}
              placeholder="Hello from Omni Command Center..."
              className="w-full h-32 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>
          <button 
            disabled={simLoading}
            onClick={() => {
              if (waStatus !== 'connected') {
                alert("Mesin belum terhubung! Silakan pastikan Barcode sudah di-scan, lalu klik tombol 'Refresh Status' di atas terlebih dahulu.");
                return;
              }
              handleTestSend();
            }}
            className={`w-full py-3 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
              waStatus !== 'connected' 
                ? 'bg-zinc-700 hover:bg-zinc-600 cursor-not-allowed opacity-80' 
                : 'bg-indigo-600 hover:bg-indigo-500'
            } ${simLoading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {simLoading ? "Firing Payload..." : (waStatus !== 'connected' ? "Engine Not Ready (LOCKED)" : "Fire Payload")}
          </button>
        </div>
      </div>
    </div>
  );
}
