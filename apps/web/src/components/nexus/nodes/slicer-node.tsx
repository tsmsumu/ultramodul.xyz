import { Handle, Position } from "@xyflow/react";
import { Scissors } from "lucide-react";
import { useState, useCallback } from "react";

export default function SlicerNode({ data }: any) {
  // Rentang Pemotongan: Default 50%
  const [sliceVal, setSliceVal] = useState(data.slicePercentage || 50);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSliceVal(parseInt(e.target.value));
  }, []);

  return (
    <div className="w-80 rounded-2xl border-2 border-fuchsia-600/50 bg-[#0a0a0a]/90 backdrop-blur-xl shadow-[0_0_40px_rgba(192,38,211,0.15)] group hover:border-fuchsia-500 overflow-hidden transition-colors">
      
      {/* KABEL COLOKAN INPUT (Satu) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-4 h-4 !bg-fuchsia-500 ring-4 ring-[#0a0a0a] border-2 border-white/20 transition-transform hover:scale-125" 
      />

      <div className="p-5">
        {/* Header Node */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-wide">Quantum Slicer</h3>
            <p className="text-xs text-fuchsia-400 font-mono tracking-widest uppercase">The Forge Node</p>
          </div>
        </div>

        {/* Kontrol Utama: Tuas Geometeri (*Proportional Slider*) */}
        <div className="space-y-4">
          <div className="flex items-end justify-between px-1">
            <span className="text-sm font-semibold text-gray-300">Target Sample</span>
            <span className="text-2xl font-black text-fuchsia-400 font-mono">{sliceVal}%</span>
          </div>
          
          <div className="relative pt-1">
            {/* Jalur Rel Slider Berkilau */}
            <input 
              type="range" 
              min="1" 
              max="99" 
              value={sliceVal}
              onChange={onChange}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-fuchsia-500/30"
            />
          </div>
          
          {/* Indikator Fisika Sisa Data (Untuk Handle Kedua) */}
          <div className="flex justify-between text-xs font-mono font-medium opacity-60">
            <span className="text-fuchsia-300">Sampel: {sliceVal}%</span>
            <span className="text-gray-400">Sisa Buangan: {100 - sliceVal}%</span>
          </div>
        </div>
      </div>

      {/* Bagian Bawah: Label Output Port (Dual Outlet) */}
      <div className="flex border-t border-fuchsia-900/30">
        <div className="flex-1 py-2 text-center border-r border-fuchsia-900/30 bg-fuchsia-950/20">
          <span className="text-[10px] uppercase font-black tracking-widest text-fuchsia-400">Sample L1</span>
        </div>
        <div className="flex-1 py-2 text-center bg-zinc-900/50">
          <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">Sisa L2</span>
        </div>
      </div>

      {/* DUAL KABEL COLOKAN OUTPUT (Mazhab Slicer Kombinasi) */}
      {/* 1. Kabel Kiri (Bawaan Sample 10%) */}
      <Handle 
        id="sample-out"
        type="source" 
        position={Position.Bottom} 
        style={{ left: '25%' }}
        className="w-4 h-4 !bg-fuchsia-400 ring-4 ring-[#0a0a0a] border-2 border-white/20" 
      />
      {/* 2. Kabel Kanan (Sisa Data 90%) */}
      <Handle 
        id="remainder-out"
        type="source" 
        position={Position.Bottom} 
        style={{ left: '75%' }}
        className="w-4 h-4 !bg-gray-600 ring-4 ring-[#0a0a0a] border-2 border-white/20" 
      />
    </div>
  );
}
