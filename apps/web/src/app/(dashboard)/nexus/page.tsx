export default function NexusPage() {
  return (
    <div className="w-full h-[calc(100vh-6rem)] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl bg-white dark:bg-[#0a0a0c] overflow-hidden flex flex-col">
       <div className="p-4 border-b border-gray-100 dark:border-white/10 bg-indigo-50/50 dark:bg-indigo-900/10 flex justify-between items-center z-10 relative">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">🧶 PUM Nexus Engine (PNE)</h1>
            <p className="text-xs text-gray-500 mt-1">Master Scale Data Federation: Connect PostgreSQL, Excel, Parquet, up to DuckDB Wasm.</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-bold">MODE: DRAG & DROP</span>
          </div>
       </div>

       <div className="flex-1 relative w-full h-full">
         <NexusCanvas />
       </div>
    </div>
  );
}

// Client Component untuk React Flow (Mencegah SSR Error)
import { NexusCanvas } from "@/components/nexus/nexus-canvas";
