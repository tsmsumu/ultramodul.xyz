import { toggleIdentityStatus, setRandomPassword, deleteIdentity } from "@/app/actions/iam";
import { triggerEmergencyJit } from "@/app/actions/matrix";
import { processBulkExport } from "@/app/actions/export";
import { Lock, Unlock, ShieldAlert, Settings, Siren, Search, CheckSquare, HardDriveDownload, BoxSelect, Key, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { MatrixDrawer } from "./matrix-drawer";
import { OmniEtlModal } from "./omni-etl-modal";

export function DataTable({ initialUsers }: { initialUsers: any[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Matrix Drawer State
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);

  // Omni ETL State
  const [etlOpen, setEtlOpen] = useState(false);

  // Advanced Search Logic
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQ = searchQuery.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(lowerQ) || 
      u.username.includes(searchQuery) || 
      u.role.toLowerCase().includes(lowerQ) ||
      u.branchCode.toLowerCase().includes(lowerQ)
    );
  }, [users, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set()); // Uncheck all
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.id))); // Check all
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const executeExport = async (type: string, format: string, isMetadata: boolean) => {
    const ids = Array.from(selectedIds);
    const result = await processBulkExport(ids, format); // In real app, we handle isMetadata flag.
    if (result.success && result.payload) {
      // Construct native blob download
      const blob = new Blob([result.payload], { type: result.mime });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `UM_EXPORT_${new Date().getTime()}.${result.ext}`;
      a.click();
      window.URL.revokeObjectURL(url);
      setEtlOpen(false);
    } else {
      alert("Format Belum Diaktifkan untuk Front-end Download. Menunggu integrasi DuckDB Wasm.");
    }
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    setLoadingId(id);
    await toggleIdentityStatus(id, currentStatus);
    setLoadingId(null);
    const updated = users.map(u => u.id === id ? { ...u, status: currentStatus === 'active' ? 'blocked' : 'active' } : u);
    setUsers(updated);
  };

  const handleJIT = async (id: string) => {
    if (confirm("Aktifkan Akses Dewa (Bypass JIT) selama 30 menit? Sirine Logbook akan berbunyi!")) {
      setLoadingId(id);
      await triggerEmergencyJit(id, 30);
      setLoadingId(null);
      alert("JIT Aktif. Menu Navigasi akan terbuka semua untuk User ini selama 30 menit ke depan.");
    }
  };

  const handleGeneratePassword = async (id: string, username: string) => {
    if (confirm(`Apakah Anda yakin ingin men-generate password baru untuk NIK ${username}? Sandi lama akan hangus.`)) {
      setLoadingId(id);
      
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
      let pass = "";
      for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
      
      const result = await setRandomPassword(id, pass);
      setLoadingId(null);
      
      if (result.success) {
        try {
          await navigator.clipboard.writeText(pass);
          alert(`SUKSES! Sandi baru untuk NIK ${username} adalah:\n\n${pass}\n\n✔️ Sandi telah OTOMATIS DISALIN (Copied) ke perangkat Anda! Silakan tekan Paste (Ctrl+V) di tempat yang aman.`);
        } catch (e) {
          // Fallback jika browser memblokir clipboard API
          prompt(`SUKSES! Sandi baru NIK ${username} berhasil dibuat.\n\nSilakan block dan COPY (Salin) sandi di kotak bawah ini SEKARANG:`, pass);
        }
      } else {
        alert("Gagal membuat password. Hubungi sysadmin.");
      }
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (confirm(`PERINGATAN KRITIKAL!\n\nAnda akan mengajukan eksekusi pemusnahan permanen untuk NIK ${username} ke Peladen. Lanjutkan?`)) {
      setLoadingId(id);
      const result = await deleteIdentity(id);
      setLoadingId(null);
      if (result.success) {
         alert(`Vonis eksekusi untuk ${username} telah masuk ke dalam Antrean Persidangan (Approval Inbox).`);
      } else {
         alert(result.error || "Gagal mengajukan operasi penghapusan.");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`PERINGATAN KRITIKAL MAJEMUK!\n\nAnda akan mengajukan pemusnahan massal untuk ${selectedIds.size} identitas sekaligus ke Antrean Persidangan. Lanjutkan?`)) {
      setLoadingId("bulk-delete");
      let successCount = 0;
      
      const idsToDelete = Array.from(selectedIds);
      for (const id of idsToDelete) {
         const result = await deleteIdentity(id);
         if (result.success) successCount++;
      }
      
      setLoadingId(null);
      setSelectedIds(new Set());
      alert(`Berhasil melemparkan ${successCount} permohonan pemusnahan masal ke dalam Approval Inbox.`);
    }
  };

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-white/5">
        <ShieldAlert className="w-12 h-12 text-gray-400 mb-4 opacity-50" />
        <h3 className="text-lg font-medium">Belum ada Identitas</h3>
        <p className="text-sm text-gray-500 mt-1">Sistem Matrix saat ini masih kosong.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Omni-Toolbar */}
      <div className="p-4 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-white/[0.01]">
         <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              placeholder="Omni-Search: Cari Nama, NIK, atau Cabang..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm"
            />
         </div>

         <div className="animate-in fade-in zoom-in duration-300 flex items-center gap-3">
           {selectedIds.size > 0 && (
             <>
               <button 
                 onClick={handleBulkDelete}
                 disabled={loadingId !== null}
                 className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 text-sm font-bold transition disabled:opacity-50"
               >
                 <Trash2 className="w-4 h-4" /> Pemusnahan Massal ({selectedIds.size})
               </button>
               <button 
                 onClick={() => setEtlOpen(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 text-sm font-bold transition"
               >
                 <HardDriveDownload className="w-4 h-4" /> Export {selectedIds.size} Identitas
               </button>
             </>
           )}
         </div>
      </div>

      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
          <tr>
            <th className="px-6 py-4 w-10">
              <input 
                type="checkbox" 
                checked={selectedIds.size === filteredUsers.length && filteredUsers.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded appearance-none border border-gray-300 dark:border-gray-600 checked:bg-indigo-600 checked:border-indigo-600 focus:ring-0 cursor-pointer"
              />
            </th>
            <th className="px-6 py-4 font-semibold tracking-wider">Identitas NIK</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Nama Lengkap</th>
            <th className="px-6 py-4 font-medium">Domain Otoritas</th>
            <th className="px-6 py-4 font-medium">Batas Izin (Status)</th>
            <th className="px-6 py-4 font-medium text-right">Tindakan</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {filteredUsers.map((user) => (
            <tr key={user.id} className={`group border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${selectedIds.has(user.id) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
              <td className="px-6 py-4">
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(user.id)}
                  onChange={() => toggleSelectRow(user.id)}
                  className="w-4 h-4 rounded appearance-none border border-gray-300 dark:border-gray-600 checked:bg-indigo-600 checked:border-indigo-600 focus:ring-0 cursor-pointer"
                />
              </td>
              <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-gray-100">
                {user.username}
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 font-sans"><BoxSelect className="w-3 h-3"/> {user.branchCode}</div>
              </td>
              <td className="px-6 py-4 font-medium">{user.name}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border
                  ${user.role === 'admin' ? 'bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/40 dark:border-purple-800/50 dark:text-purple-400 shadow-[0_0_15px_-3px_rgba(168,85,247,0.4)]' : 
                    user.role === 'member' ? 'bg-cyan-100 border-cyan-200 text-cyan-700 dark:bg-cyan-900/40 dark:border-cyan-800/50 dark:text-cyan-400' : 
                    user.role === 'viewer' ? 'bg-gray-100 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300' : 
                    'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/40 dark:border-blue-800/50 dark:text-blue-400'}
                `}>
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border
                  ${user.status === 'active' ? 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400' : 
                    user.status === 'pending' ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)]' : 
                    'bg-red-100 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400'}
                `}>
                  <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : user.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                <button 
                  onClick={() => handleJIT(user.id)}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                  title="Panic Button: JIT Emergency Bypass (30 Mnt)"
                >
                  <Siren className="w-4 h-4" />
                </button>
                <button 
                  disabled={loadingId === user.id}
                  onClick={() => handleGeneratePassword(user.id, user.username)}
                  className="p-2 text-gray-500 hover:text-yellow-600 dark:text-gray-400 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition"
                  title="Generate Password Sementara"
                >
                  <Key className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { setSelectedUser({id: user.id, name: user.name}); setMatrixOpen(true); }}
                  className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
                  title="Atur Hak Akses Matrix"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button 
                  disabled={loadingId === user.id}
                  onClick={() => handleToggle(user.id, user.status)}
                  className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition disabled:opacity-50"
                  title={user.status === 'active' ? 'Kunci Akses (Blokir)' : 'Buka Akses (Approve/Aktifkan)'}
                >
                  {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
                <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1"></div>
                <button 
                  disabled={loadingId === user.id}
                  onClick={() => handleDeleteUser(user.id, user.username)}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50"
                  title="Hapus Identitas Permanen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MATRIX DRAWER RENDERER */}
      <MatrixDrawer 
        isOpen={matrixOpen} 
        onClose={() => setMatrixOpen(false)} 
        userId={selectedUser?.id || null}
        userName={selectedUser?.name || null}
      />

      <OmniEtlModal 
        isOpen={etlOpen}
        onClose={() => setEtlOpen(false)}
        selectedCount={selectedIds.size}
        onExport={executeExport}
      />
    </div>
  );
}
