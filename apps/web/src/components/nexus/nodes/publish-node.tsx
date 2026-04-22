"use client";

import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import { UploadCloud, CheckCircle2, LockKeyhole } from "lucide-react";
import { useState, useEffect } from "react";

export function PublishNode({ data, id }: any) {
  const [blueprintName, setBlueprintName] = useState("");
  const updateNodeInternals = useUpdateNodeInternals();
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  const handlePublish = () => {
    if (!blueprintName) return alert("Beri nama blueprint terlebih dahulu.");
    // In real app, this calls Server Action to save to LibSQL `nexus_blueprints`
    // using the SQL Query from the connected node.
    console.log("Publishing Nexus Blueprint:", blueprintName);
    setIsPublished(true);
    alert(`Dataset Virtual '${blueprintName}' berhasi dikunci secara abadi di Hub Pusat!`);
  };

  return (
    <div className="w-72 bg-[#09090b] text-white rounded-xl shadow-[0_10px_40px_rgba(168,85,247,0.3)] border border-purple-500/50 p-4 transition-all hover:border-purple-400">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500 border-2 border-black" />
      
      <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-400 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
          <UploadCloud className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">The Endgame</div>
          <div className="font-bold tracking-wide">Publish Hub</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
         <div>
           <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Nama Virtual Dataset</label>
           <input 
             value={blueprintName} 
             onChange={e => setBlueprintName(e.target.value)} 
             placeholder="Contoh: Gabungan_Sensus_Final"
             disabled={isPublished}
             className="w-full bg-black/50 border border-white/10 rounded-md p-2 text-xs text-white focus:outline-none focus:border-purple-500 transition font-mono"
           />
         </div>
         
         <div className="text-[10px] text-gray-400 leading-relaxed bg-white/5 p-2 rounded border border-white/5">
           Hubungkan node *Virtual View* ke modul ini untuk membekukan *"Resep/Blueprint SQL"* aslinya, siap digunakan lintas aplikasi.
         </div>

         {isPublished ? (
            <div className="w-full py-2 bg-emerald-900/40 text-emerald-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border border-emerald-500/30">
               <CheckCircle2 className="w-4 h-4" /> PUBLISHED TO CORE
            </div>
         ) : (
            <button onClick={handlePublish} className="w-full py-2 bg-linear-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-xl shadow-purple-500/20 hover:scale-[1.02]">
               <LockKeyhole className="w-4 h-4" /> BUNGKUS KE DALAM BRANKAS!
            </button>
         )}
      </div>
    </div>
  );
}
