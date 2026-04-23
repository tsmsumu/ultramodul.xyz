import { useState, useEffect, useRef } from "react";
import { Radio, CheckCircle2, XCircle, Terminal as TerminalIcon, Trash2, Edit2, Check, Shield, ShieldAlert, ShieldCheck, Eye, Building2, LogOut } from "lucide-react";
import { getWaEngineStatus, getWaEngineQr, sendMessageViaEngine, initWaEngineNode, deleteWhatsAppNode, destroyWhatsAppNode, renameWhatsAppNode, updateWaNodeFirewall, logoutWhatsAppSession, setWaEnginePresence, updateWaNodeHistorySync } from "@/app/actions/multi-channel";
import { useRouter } from "next/navigation";
import StatusMonitorModal from "./status-monitor-modal";
import WagMonitorModal from "./wag-monitor-modal";
import ChatMonitorModal from "./chat-monitor-modal";

export default function WaNodePanel({ provider, isArchived = false }: { provider: any, isArchived?: boolean }) {
  const router = useRouter();
  const [waStatus, setWaStatus] = useState<string>("initializing");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [simTo, setSimTo] = useState("");
  const [simMsg, setSimMsg] = useState("");
  const [simLoading, setSimLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localName, setLocalName] = useState(provider.name);
  const [editName, setEditName] = useState(provider.name);
  const [isStealthMode, setIsStealthMode] = useState(false);

  const [showStatusMonitor, setShowStatusMonitor] = useState(false);
  const [showWagMonitor, setShowWagMonitor] = useState(false);
  const [showChatMonitor, setShowChatMonitor] = useState(false);

  // Firewall States
  const initialConfig = (() => {
    try { return JSON.parse(provider.configPayload || '{}'); } catch(e) { return {}; }
  })();
  const [whitelist, setWhitelist] = useState<string[]>(initialConfig.whitelist || []);
  const [syncHistory, setSyncHistory] = useState<boolean>(initialConfig.syncHistory || false);
  const [syncHistoryChat, setSyncHistoryChat] = useState<boolean>(initialConfig.syncHistoryChat !== false);
  const [historyChatTargets, setHistoryChatTargets] = useState<string>(initialConfig.historyChatTargets || "");
  const [historyChatStart, setHistoryChatStart] = useState<string>(initialConfig.historyChatStart || "");
  const [historyChatEnd, setHistoryChatEnd] = useState<string>(initialConfig.historyChatEnd || "");
  const [historyChatMediaMode, setHistoryChatMediaMode] = useState<string>(initialConfig.historyChatMediaMode || "text_only");

  const [syncHistoryWag, setSyncHistoryWag] = useState<boolean>(initialConfig.syncHistoryWag !== false);
  const [historyWagTargets, setHistoryWagTargets] = useState<string>(initialConfig.historyWagTargets || "");
  const [historyWagStart, setHistoryWagStart] = useState<string>(initialConfig.historyWagStart || "");
  const [historyWagEnd, setHistoryWagEnd] = useState<string>(initialConfig.historyWagEnd || "");
  const [historyWagMediaMode, setHistoryWagMediaMode] = useState<string>(initialConfig.historyWagMediaMode || "text_only");

  const [syncHistoryStatus, setSyncHistoryStatus] = useState<boolean>(initialConfig.syncHistoryStatus !== false);
  const [historyStatusTargets, setHistoryStatusTargets] = useState<string>(initialConfig.historyStatusTargets || "");
  const [historyStatusStart, setHistoryStatusStart] = useState<string>(initialConfig.historyStatusStart || "");
  const [historyStatusEnd, setHistoryStatusEnd] = useState<string>(initialConfig.historyStatusEnd || "");
  const [historyStatusMediaMode, setHistoryStatusMediaMode] = useState<string>(initialConfig.historyStatusMediaMode || "text_only");
  const [wlInput, setWlInput] = useState("");
  const [isSavingWl, setIsSavingWl] = useState(false);

  const handleAddWhitelist = async () => {
    if (!wlInput.trim()) return;
    let clean = wlInput.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    
    if (!clean) return;
    if (whitelist.includes(clean)) {
      setWlInput(""); return;
    }

    const newList = [...whitelist, clean];
    setWhitelist(newList);
    setWlInput("");
    setIsSavingWl(true);
    await updateWaNodeFirewall(provider.id, newList);
    setIsSavingWl(false);
  };

  const saveHistoryConfig = async (options: any) => {
    if (options.syncHistory !== undefined) setSyncHistory(options.syncHistory);
    
    if (options.syncHistoryChat !== undefined) setSyncHistoryChat(options.syncHistoryChat);
    if (options.historyChatTargets !== undefined) setHistoryChatTargets(options.historyChatTargets);
    if (options.historyChatStart !== undefined) setHistoryChatStart(options.historyChatStart);
    if (options.historyChatEnd !== undefined) setHistoryChatEnd(options.historyChatEnd);
    if (options.historyChatMediaMode !== undefined) setHistoryChatMediaMode(options.historyChatMediaMode);

    if (options.syncHistoryWag !== undefined) setSyncHistoryWag(options.syncHistoryWag);
    if (options.historyWagTargets !== undefined) setHistoryWagTargets(options.historyWagTargets);
    if (options.historyWagStart !== undefined) setHistoryWagStart(options.historyWagStart);
    if (options.historyWagEnd !== undefined) setHistoryWagEnd(options.historyWagEnd);
    if (options.historyWagMediaMode !== undefined) setHistoryWagMediaMode(options.historyWagMediaMode);

    if (options.syncHistoryStatus !== undefined) setSyncHistoryStatus(options.syncHistoryStatus);
    if (options.historyStatusTargets !== undefined) setHistoryStatusTargets(options.historyStatusTargets);
    if (options.historyStatusStart !== undefined) setHistoryStatusStart(options.historyStatusStart);
    if (options.historyStatusEnd !== undefined) setHistoryStatusEnd(options.historyStatusEnd);
    if (options.historyStatusMediaMode !== undefined) setHistoryStatusMediaMode(options.historyStatusMediaMode);
    
    await updateWaNodeHistorySync(provider.id, {
      syncHistory: options.syncHistory ?? syncHistory,
      syncHistoryChat: options.syncHistoryChat ?? syncHistoryChat,
      historyChatTargets: options.historyChatTargets ?? historyChatTargets,
      historyChatStart: options.historyChatStart ?? historyChatStart,
      historyChatEnd: options.historyChatEnd ?? historyChatEnd,
      historyChatMediaMode: options.historyChatMediaMode ?? historyChatMediaMode,
      syncHistoryWag: options.syncHistoryWag ?? syncHistoryWag,
      historyWagTargets: options.historyWagTargets ?? historyWagTargets,
      historyWagStart: options.historyWagStart ?? historyWagStart,
      historyWagEnd: options.historyWagEnd ?? historyWagEnd,
      historyWagMediaMode: options.historyWagMediaMode ?? historyWagMediaMode,
      syncHistoryStatus: options.syncHistoryStatus ?? syncHistoryStatus,
      historyStatusTargets: options.historyStatusTargets ?? historyStatusTargets,
      historyStatusStart: options.historyStatusStart ?? historyStatusStart,
      historyStatusEnd: options.historyStatusEnd ?? historyStatusEnd,
      historyStatusMediaMode: options.historyStatusMediaMode ?? historyStatusMediaMode
    });
  };

  const handleRemoveWhitelist = async (num: string) => {
    const newList = whitelist.filter(n => n !== num);
    setWhitelist(newList);
    setIsSavingWl(true);
    await updateWaNodeFirewall(provider.id, newList);
    setIsSavingWl(false);
  };

  const handleRename = async () => {
    if (editName.trim() && editName !== localName) {
      setLocalName(editName); // Optimistic UI update
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
      const res = isArchived ? await destroyWhatsAppNode(provider.id) : await deleteWhatsAppNode(provider.id);
      if (res.success) {
        router.refresh();
      } else {
        alert("Failed to delete node.");
      }
    }
  };

  const handleLogoutSession = async () => {
    if (window.confirm("Apakah Anda yakin ingin Logout? Anda harus melakukan Scan QR ulang untuk menghubungkan WhatsApp.")) {
      const res = await logoutWhatsAppSession(provider.id);
      if (res.success) {
        fetchWaStatus();
      } else {
        alert("Failed to logout session.");
      }
    }
  };

  const handleToggleStealth = async () => {
    const newState = !isStealthMode;
    setIsStealthMode(newState);
    await setWaEnginePresence(provider.id, newState ? 'unavailable' : 'available');
  };

  useEffect(() => {
    fetchWaStatus();
  }, [provider.id]);

  return (
    <div className="flex flex-col gap-6 mb-8 pb-8 border-b border-white/10 last:border-0 last:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Omni WA-Engine Panel */}
      <div className="bg-zinc-950/80 border border-white/5 rounded-3xl p-6 shadow-xl relative">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2 w-full sm:w-auto">
            <Radio className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            {isEditing ? (
              <div className="flex items-center gap-2 max-w-full">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-black/50 border border-white/10 text-white px-2 py-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 w-32 sm:w-auto"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                />
                <button onClick={handleRename} className="text-emerald-400 hover:text-emerald-300 flex-shrink-0">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer truncate" onClick={() => !isArchived && setIsEditing(true)}>
                <span className="truncate">{localName}</span>
                {!isArchived && <Edit2 className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />}
              </div>
            )}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {!isArchived && (
              <>
                {waStatus === 'connected' && (
                  <button onClick={handleLogoutSession} className="text-[10px] px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/30 rounded-lg text-orange-400 font-bold uppercase transition-all flex items-center gap-1">
                    <LogOut className="w-3 h-3" /> Logout
                  </button>
                )}
                <button onClick={handleInitNode} className="text-[10px] px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-lg text-indigo-300 font-bold uppercase transition-all">
                  Start Node
                </button>
                <button onClick={fetchWaStatus} className="text-[10px] px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 font-bold uppercase transition-all">
                  Refresh
                </button>
                <button onClick={handleDeleteNode} className="text-[10px] px-3 py-1.5 bg-red-500/10 hover:bg-red-500/30 rounded-lg text-red-400 font-bold uppercase transition-all flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {isArchived && (
          <button onClick={handleDeleteNode} className="w-full mb-6 py-4 bg-red-600/80 hover:bg-red-500 rounded-xl text-white font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-500">
            <Trash2 className="w-5 h-5" /> Delete & Destroy Archived Node
          </button>
        )}

        {!isArchived && (
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

            {/* Quick Status Notice */}
            {waStatus !== 'connected' && (
              <div className="mb-6 flex flex-col gap-4 w-full">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">History Sync Setting dipindahkan ke panel bawah</span>
                </div>
              </div>
            )}

            {waStatus === 'qr' && qrCode ? (
               <div className="bg-white p-4 rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                 <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48" />
               </div>
            ) : waStatus === 'connected' ? (
             <div className="flex flex-col items-center gap-4">
               <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex items-center justify-center">
                 <CheckCircle2 className="w-16 h-16 text-emerald-400" />
               </div>
               <button 
                 onClick={handleToggleStealth}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                   isStealthMode 
                     ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                     : 'bg-zinc-800/50 text-zinc-400 border border-zinc-700 hover:bg-zinc-800'
                 }`}
               >
                 <Eye className={`w-4 h-4 ${isStealthMode ? 'opacity-50' : ''}`} />
                 {isStealthMode ? 'Stealth Mode (Invisible)' : 'Visible (Online)'}
               </button>
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
        )}

        {/* Intelligence Buttons */}
        {(waStatus === 'connected' || isArchived) && (
          <div className="mt-6 pt-6 border-t border-white/5 flex gap-4">
            <button 
              onClick={() => setShowStatusMonitor(true)}
              className="flex-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase transition-colors"
            >
              <Eye className="w-4 h-4" /> Status Intel
            </button>
            <button 
              onClick={() => setShowChatMonitor(true)}
              className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase transition-colors"
            >
              <TerminalIcon className="w-4 h-4" /> Message Intel
            </button>
            <button 
              onClick={() => setShowWagMonitor(true)}
              className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase transition-colors"
            >
              <Building2 className="w-4 h-4" /> WAG Intel
            </button>
          </div>
        )}
      </div>

      {/* Security Firewall Panel */}
      <div className="bg-zinc-950/80 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden">
        {isSavingWl && <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-pulse" />}
        <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" /> Security Firewall
          </div>
          {whitelist.length > 0 ? (
            <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30">
              <ShieldAlert className="w-3 h-3" /> STRICT MODE
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" /> ALLOW ALL
            </span>
          )}
        </h2>
        
        <div className="flex-1 flex flex-col space-y-4">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              If empty, this node processes all messages. Add numbers below to strictly limit inbound/outbound access to approved numbers only.
            </p>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={wlInput}
                onChange={(e) => setWlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddWhitelist()}
                placeholder="e.g. 0812..."
                className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              <button 
                onClick={handleAddWhitelist}
                disabled={isSavingWl}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase disabled:opacity-50"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {whitelist.map(num => (
                <div key={num} className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-lg">
                  <span className="text-xs text-zinc-300 font-mono">{num}</span>
                  <button onClick={() => handleRemoveWhitelist(num)} className="text-zinc-500 hover:text-red-400">
                    <XCircle className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {whitelist.length === 0 && (
                <span className="text-xs text-zinc-600 italic">No numbers whitelisted.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Simulator Panel */}
      <div className="bg-zinc-950/80 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col">
        <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2 mb-6">
          <TerminalIcon className="w-5 h-5 text-indigo-400" /> Live Message Simulator ({localName})
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

      {/* Full Width History Sync Settings Panel (Only visible when disconnected/initializing to configure BEFORE boot) */}
      {waStatus !== 'connected' && !isArchived && (
        <div className="bg-zinc-950/80 border border-white/5 rounded-3xl shadow-xl w-full flex flex-col mt-2">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/20 rounded-t-3xl">
            <h2 className="text-sm font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <LogOut className="w-5 h-5 text-emerald-400 rotate-180" /> History Sync Configuration
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={syncHistory} onChange={(e) => saveHistoryConfig({ syncHistory: e.target.checked })} />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white shadow-inner"></div>
              <span className="ml-3 text-xs font-bold text-zinc-300 uppercase tracking-widest">
                {syncHistory ? 'Master Sync: ON' : 'Master Sync: OFF'}
              </span>
            </label>
          </div>

          {syncHistory && (
            <div className="p-6 bg-black/40 rounded-b-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CHAT PRIVATE MODULE */}
                <div className="flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-blue-500/30">
                  <div className="p-4 border-b border-white/5 bg-black/30 flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                      <TerminalIcon className="w-4 h-4" /> Chat Private
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={syncHistoryChat} onChange={(e) => saveHistoryConfig({ syncHistoryChat: e.target.checked })} />
                      <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                  {syncHistoryChat && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Target Numbers</label>
                        <input type="text" placeholder="Kosongkan untuk sedot semua..." value={historyChatTargets} onChange={(e) => saveHistoryConfig({ historyChatTargets: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">From</label>
                          <input type="datetime-local" value={historyChatStart} onChange={(e) => saveHistoryConfig({ historyChatStart: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">To</label>
                          <input type="datetime-local" value={historyChatEnd} onChange={(e) => saveHistoryConfig({ historyChatEnd: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Media Download Mode</label>
                        <select value={historyChatMediaMode} onChange={(e) => saveHistoryConfig({ historyChatMediaMode: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-blue-500/50">
                          <option value="text_only">Text Only (Ultra-Fast)</option>
                          <option value="all">Text + Media (Heavy/Slow)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* WAG MODULE */}
                <div className="flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-emerald-500/30">
                  <div className="p-4 border-b border-white/5 bg-black/30 flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <Building2 className="w-4 h-4" /> WA Group
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={syncHistoryWag} onChange={(e) => saveHistoryConfig({ syncHistoryWag: e.target.checked })} />
                      <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                  {syncHistoryWag && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Group IDs</label>
                        <input type="text" placeholder="Kosongkan untuk sedot semua..." value={historyWagTargets} onChange={(e) => saveHistoryConfig({ historyWagTargets: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">From</label>
                          <input type="datetime-local" value={historyWagStart} onChange={(e) => saveHistoryConfig({ historyWagStart: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">To</label>
                          <input type="datetime-local" value={historyWagEnd} onChange={(e) => saveHistoryConfig({ historyWagEnd: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Media Download Mode</label>
                        <select value={historyWagMediaMode} onChange={(e) => saveHistoryConfig({ historyWagMediaMode: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-500/50">
                          <option value="text_only">Text Only (Ultra-Fast)</option>
                          <option value="all">Text + Media (Heavy/Slow)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* STATUS MODULE */}
                <div className="flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-indigo-500/30">
                  <div className="p-4 border-b border-white/5 bg-black/30 flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Status WA
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={syncHistoryStatus} onChange={(e) => saveHistoryConfig({ syncHistoryStatus: e.target.checked })} />
                      <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-500 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                  {syncHistoryStatus && (
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Target Numbers</label>
                        <input type="text" placeholder="Kosongkan untuk sedot semua..." value={historyStatusTargets} onChange={(e) => saveHistoryConfig({ historyStatusTargets: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">From</label>
                          <input type="datetime-local" value={historyStatusStart} onChange={(e) => saveHistoryConfig({ historyStatusStart: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">To</label>
                          <input type="datetime-local" value={historyStatusEnd} onChange={(e) => saveHistoryConfig({ historyStatusEnd: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Media Download Mode</label>
                        <select value={historyStatusMediaMode} onChange={(e) => saveHistoryConfig({ historyStatusMediaMode: e.target.value })} className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-indigo-500/50">
                          <option value="text_only">Text Only (Ultra-Fast)</option>
                          <option value="all">Text + Media (Heavy/Slow)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {showStatusMonitor && (
        <StatusMonitorModal providerId={provider.id} onClose={() => setShowStatusMonitor(false)} />
      )}
      
      {showWagMonitor && (
        <WagMonitorModal providerId={provider.id} onClose={() => setShowWagMonitor(false)} />
      )}
      
      {showChatMonitor && (
        <ChatMonitorModal providerId={provider.id} onClose={() => setShowChatMonitor(false)} />
      )}
    </div>
  );
}
