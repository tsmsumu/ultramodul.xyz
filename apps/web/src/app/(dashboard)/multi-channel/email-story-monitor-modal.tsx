import { useState, useEffect } from "react";
import { X, Search, Plus, Trash2, Printer, Download, Image as ImageIcon, Video, Eye } from "lucide-react";
import { getMonitorTargets, getStoryLogs, addStoryTarget, removeStoryTarget, bulkDeleteLogs, bulkArchiveLogs, bulkDeleteTargets, importLogbookData } from "@/app/actions/email-monitor";
import ExportMenu from "@/components/ExportMenu";
import ImportMenu from "@/components/ImportMenu";
import AutoDeliverySettings from "@/components/AutoDeliverySettings";
import EntityRenderer from "@/components/EntityRenderer";
import LogAnalytics from "@/components/LogAnalytics";
import ThreadView from "@/components/ThreadView";

export default function EmailStoryMonitorModal({ providerId, onClose }: { providerId: string, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'targets' | 'logs' | 'delivery' | 'analytics'>('logs');
  const [targets, setTargets] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  // Advanced Logbook States
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedTargetRows, setSelectedTargetRows] = useState<string[]>([]);
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [logTab, setLogTab] = useState<'active' | 'archived'>('active');

  // Form states
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isTextOnly, setIsTextOnly] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTargetQuery, setSearchTargetQuery] = useState("");
  
  // Thread State
  const [activeThread, setActiveThread] = useState<{ targetId: string, targetName: string, highlightLogId?: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { story } = await getMonitorTargets(providerId);
    setTargets(story);
    const logData = await getStoryLogs(providerId);
    setLogs(logData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [providerId]);

  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !name) return;
    await addStoryTarget(providerId, phone, name, isTextOnly);
    setPhone("");
    setName("");
    setIsTextOnly(false);
    fetchData();
  };

  const handleRemoveTarget = async (id: string) => {
    await removeStoryTarget(providerId, id);
    fetchData();
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    if (window.confirm(`Delete ${selectedRows.length} logs permanently?`)) {
      await bulkDeleteLogs('story', selectedRows);
      setSelectedRows([]);
      fetchData();
    }
  };

  const handleBulkArchive = async (archive: boolean) => {
    if (selectedRows.length === 0) return;
    await bulkArchiveLogs('story', selectedRows, archive);
    setSelectedRows([]);
    fetchData();
  };

  const handleBulkDeleteTargets = async () => {
    if (selectedTargetRows.length === 0) return;
    if (window.confirm(`Delete ${selectedTargetRows.length} Status targets and all their associated logs? This action cannot be undone.`)) {
      await bulkDeleteTargets('story', selectedTargetRows);
      setSelectedTargetRows([]);
      fetchData();
    }
  };

  const handleSelectAllTargets = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedTargetRows(targets.map(t => t.id));
    else setSelectedTargetRows([]);
  };

  const handleImportData = async (data: any[]) => {
    setImporting(true);
    const res = await importLogbookData(providerId, 'story', data);
    if (res.success) {
      alert(`Ultra Import Success! Integreated ${res.imported} logs. Duplicates were automatically rejected.`);
      fetchData();
    } else {
      alert("Failed to import data.");
    }
    setImporting(false);
  };

  const toggleTargetRow = (id: string) => {
    setSelectedTargetRows(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
  };

  const handlePrint = () => {
    window.print();
  };



  const filteredLogs = logs.filter(l => {
    const isArchivedTarget = logTab === 'archived';
    if ((l.isArchived ? true : false) !== isArchivedTarget) return false;

    // Time Filter (From/To Date)
    const logTime = new Date(l.timestamp).getTime();
    const fromTime = filterDateFrom ? new Date(filterDateFrom).getTime() : 0;
    const toTime = filterDateTo ? new Date(filterDateTo).getTime() : Infinity;
    
    if (logTime < fromTime || logTime > toTime) return false;

    return l.textContent?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const exportOptions = {
    filename: `Omni_Status_Logbook_${new Date().toISOString().split('T')[0]}`,
    title: "Omni Intelligence - Status WA Monitor",
    columns: [
      { header: "Date", key: "date" },
      { header: "Time", key: "time" },
      { header: "Target Name", key: "targetName" },
      { header: "Content", key: "content" },
      { header: "Has Media", key: "hasMedia" },
    ],
    data: filteredLogs.map(l => {
      const dt = new Date(l.timestamp);
      const targetObj = targets.find(t => t.id === l.targetId);
      return {
        date: dt.toLocaleDateString(),
        time: dt.toLocaleTimeString(),
        targetName: targetObj?.targetName || 'Unknown Target',
        content: l.textContent || '',
        hasMedia: l.mediaUrl ? 'Yes' : 'No'
      };
    })
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedRows(filteredLogs.map(l => l.id));
    else setSelectedRows([]);
  };

  const toggleRow = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl print:h-auto print:border-none print:shadow-none">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Eye className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Status WA Monitor</h2>
              <p className="text-xs text-zinc-400">Ultra-Recon Intelligence Logbook</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 border-b border-white/10 gap-6 print:hidden">
          <button 
            onClick={() => setActiveTab('logs')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'logs' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            📖 Logbook
          </button>
          <button 
            onClick={() => setActiveTab('targets')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'targets' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            🎯 Target List
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            📊 Analytics
          </button>
          <button 
            onClick={() => setActiveTab('delivery')}
            className={`pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'delivery' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            ⏱️ Auto-Delivery
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar print:p-0 print:overflow-visible">
          {loading ? (
            <div className="h-full flex items-center justify-center text-indigo-400 print:hidden">Loading Intel Data...</div>
          ) : (
            <>
              {/* Ultra Interceptor Banner */}
              <div className="mb-6 bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 flex items-start gap-4 print:hidden">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Eye className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-300">Ultra-Stealth Interceptor Active (Phantom Mode)</h4>
                  <p className="text-xs text-indigo-400/80 mt-1">
                    Node ini berjalan dalam mode Real-Time Intercept. Status ditarik dan diarsipkan secara instan <b>hanya setelah Node ini terhubung</b>. Karena sifat rahasia Phantom Mode, tidak ada notifikasi baca (Read Receipt) yang dikirim ke target.
                  </p>
                </div>
              </div>

              {/* DELIVERY TAB */}
              {activeTab === 'delivery' && (
                <AutoDeliverySettings providerId={providerId} logType="status" />
              )}

              {/* ANALYTICS TAB */}
              {activeTab === 'analytics' && (
                <LogAnalytics logs={filteredLogs} targets={targets} type="emailStory" />
              )}

              {/* TARGETS TAB */}
              {activeTab === 'targets' && (
                <div className="space-y-6 print:hidden">
                  <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Add New Target</h3>
                    <form onSubmit={handleAddTarget} className="flex gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <label className="text-xs text-zinc-400 uppercase tracking-wider">Phone Number</label>
                        <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="0812..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none" required />
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-xs text-zinc-400 uppercase tracking-wider">Person Name</label>
                        <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Mr. Target" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none" required />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <input type="checkbox" id="textOnly" checked={isTextOnly} onChange={e=>setIsTextOnly(e.target.checked)} className="w-4 h-4 rounded bg-black/40 border-white/10 text-indigo-500 focus:ring-indigo-500" />
                        <label htmlFor="textOnly" className="text-xs text-zinc-400">Text Only (No Media)</label>
                      </div>
                      <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 h-[46px]">
                        <Plus className="w-4 h-4" /> Add Target
                      </button>
                    </form>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-zinc-900/30 flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        {selectedTargetRows.length > 0 ? (
                          <div className="bg-indigo-900/20 px-4 py-2 border border-indigo-500/20 flex items-center gap-4 rounded-lg w-full justify-between">
                            <span className="text-sm font-bold text-indigo-400">{selectedTargetRows.length} targets selected</span>
                            <button onClick={handleBulkDeleteTargets} className="text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-1.5 rounded font-bold flex items-center gap-2 transition-colors border border-red-500/20">
                              <Trash2 className="w-3 h-3" /> Delete Selected
                            </button>
                          </div>
                        ) : (
                          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            Status WA Targets
                          </div>
                        )}
                      </div>
                      
                      <div className="relative w-full">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50" />
                        <input 
                          type="text" 
                          placeholder="Cari target Status WA berdasarkan Nama atau Nomor..." 
                          value={searchTargetQuery}
                          onChange={e=>setSearchTargetQuery(e.target.value)}
                          className="w-full bg-black/60 border border-indigo-500/30 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600 shadow-inner"
                        />
                      </div>
                    </div>
                    <table className="w-full text-left text-sm text-zinc-300">
                      <thead className="bg-zinc-900/80 text-xs uppercase text-zinc-500">
                        <tr>
                          <th className="px-6 py-4 w-10">
                            <input type="checkbox" onChange={handleSelectAllTargets} checked={targets.length > 0 && selectedTargetRows.length === targets.length} className="w-4 h-4 rounded bg-black/40 border-white/10 text-indigo-500 focus:ring-indigo-500" />
                          </th>
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Phone Number</th>
                          <th className="px-6 py-4">Added On</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {targets.filter(t => t.targetName?.toLowerCase().includes(searchTargetQuery.toLowerCase()) || t.phoneNumber?.includes(searchTargetQuery)).map(t => (
                          <tr key={t.id} className={`hover:bg-white/[0.02] ${selectedTargetRows.includes(t.id) ? 'bg-indigo-500/5' : ''}`}>
                            <td className="px-6 py-4">
                              <input type="checkbox" checked={selectedTargetRows.includes(t.id)} onChange={() => toggleTargetRow(t.id)} className="w-4 h-4 rounded bg-black/40 border-white/10 text-indigo-500 focus:ring-indigo-500" />
                            </td>
                            <td className="px-6 py-4 font-bold text-white">
                              {t.targetName}
                              {t.isTextOnly && <span className="ml-2 text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">TEXT ONLY</span>}
                            </td>
                            <td className="px-6 py-4 font-mono">{t.phoneNumber}</td>
                            <td className="px-6 py-4">{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleRemoveTarget(t.id)} className="text-zinc-500 hover:text-red-400">
                                <Trash2 className="w-4 h-4 inline" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {targets.length === 0 && (
                          <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500 italic">No targets monitored.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* LOGS TAB */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 print:hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                          <button onClick={() => { setLogTab('active'); setSelectedRows([]); }} className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${logTab === 'active' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-white'}`}>Active</button>
                          <button onClick={() => { setLogTab('archived'); setSelectedRows([]); }} className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${logTab === 'archived' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}>Archived</button>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <input type="datetime-local" value={filterDateFrom} onChange={e=>setFilterDateFrom(e.target.value)} className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-2 text-xs text-zinc-300 focus:outline-none" title="From Date" />
                          <span className="text-zinc-600">-</span>
                          <input type="datetime-local" value={filterDateTo} onChange={e=>setFilterDateTo(e.target.value)} className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-2 text-xs text-zinc-300 focus:outline-none" title="To Date" />
                          {(filterDateFrom || filterDateTo) && (
                            <button onClick={() => { setFilterDateFrom(""); setFilterDateTo(""); }} className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-bold transition-colors">
                              All Time
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <ImportMenu type="emailStory" isLoading={importing} onImport={handleImportData} />
                        <ExportMenu options={exportOptions} />
                        <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                          <Printer className="w-4 h-4" /> Print Report
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative w-full">
                      <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50" />
                      <input 
                        type="text" 
                        placeholder="Ketik untuk mencari log Status WA..." 
                        value={searchQuery}
                        onChange={e=>setSearchQuery(e.target.value)}
                        className="w-full bg-black/60 border border-indigo-500/30 rounded-xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600 shadow-inner"
                      />
                    </div>
                  </div>

                  {selectedRows.length > 0 && (
                    <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-xl print:hidden">
                      <span className="text-sm font-bold text-indigo-400">{selectedRows.length} logs selected</span>
                      <div className="flex gap-2">
                        {logTab === 'active' ? (
                          <button onClick={() => handleBulkArchive(true)} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-bold">Move to Archive</button>
                        ) : (
                          <button onClick={() => handleBulkArchive(false)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold">Unarchive Selected</button>
                        )}
                        <button onClick={handleBulkDelete} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded text-xs font-bold flex items-center gap-1">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="hidden print:block mb-8">
                    <h1 className="text-2xl font-bold text-black border-b border-black pb-2 mb-4">Laporan Pemantauan Status WhatsApp</h1>
                    <p className="text-sm text-gray-600">Dicetak pada: {new Date().toLocaleString()}</p>
                  </div>

                  {activeThread ? (
                    <div className="h-[600px] print:hidden">
                      <ThreadView 
                        logs={logs} 
                        targetId={activeThread.targetId} 
                        targetName={activeThread.targetName} 
                        highlightLogId={activeThread.highlightLogId} 
                        onClose={() => setActiveThread(null)} 
                      />
                    </div>
                  ) : (
                  <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden print:border-black print:bg-white">
                    <table className="w-full text-left text-sm text-zinc-300 print:text-black">
                      <thead className="bg-zinc-900/80 text-xs uppercase text-zinc-500 print:bg-gray-100 print:text-black">
                        <tr>
                          <th className="px-6 py-4 w-10 print:hidden">
                            <input type="checkbox" checked={filteredLogs.length > 0 && selectedRows.length === filteredLogs.length} onChange={handleSelectAll} className="rounded bg-black/40 border-white/10" />
                          </th>
                          <th className="px-6 py-4">Date & Time</th>
                          <th className="px-6 py-4">Content</th>
                          <th className="px-6 py-4">Media</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 print:divide-gray-300">
                        {filteredLogs.map(l => {
                          const targetObj = targets.find(t => t.id === l.targetId);
                          return (
                            <tr key={l.id} className={`hover:bg-white/[0.02] ${selectedRows.includes(l.id) ? 'bg-white/[0.05]' : ''}`}>
                              <td className="px-6 py-4 print:hidden">
                                <input type="checkbox" checked={selectedRows.includes(l.id)} onChange={() => toggleRow(l.id)} className="rounded bg-black/40 border-white/10" />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button onClick={() => setActiveThread({ targetId: l.targetId, targetName: targetObj?.targetName || 'Unknown Target', highlightLogId: l.id })} className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-white px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/30 rounded border border-indigo-500/20 transition-colors mb-2 block">
                                  Thread
                                </button>
                                <div className="font-bold text-white print:text-black">{new Date(l.timestamp).toLocaleDateString()}</div>
                                <div className="text-xs text-zinc-500 print:text-gray-600">{new Date(l.timestamp).toLocaleTimeString()}</div>
                                <div className="text-xs text-indigo-400 mt-1 font-bold">{targetObj?.targetName || 'Unknown Target'}</div>
                              </td>
                              <td className="px-6 py-4">
                                <EntityRenderer content={l.textContent} />
                              </td>
                              <td className="px-6 py-4">
                                {l.mediaUrl ? (
                                  <div className="flex flex-col gap-2 print:hidden">
                                    {l.mediaType === 'image' ? (
                                      <div className="relative group">
                                        <img src={l.mediaUrl} alt="Status Media" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                                        <a href={l.mediaUrl} target="_blank" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                          <ImageIcon className="w-6 h-6 text-white" />
                                        </a>
                                      </div>
                                    ) : (
                                      <div className="relative group">
                                        <video src={l.mediaUrl} className="w-24 h-24 object-cover rounded-lg border border-white/10" muted />
                                        <a href={l.mediaUrl} target="_blank" className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                          <Video className="w-6 h-6 text-white" />
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-zinc-500 italic">Text Only</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {filteredLogs.length === 0 && (
                          <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500 italic">No status logs recorded yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
