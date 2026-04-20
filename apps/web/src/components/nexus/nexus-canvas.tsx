"use client";

import { useCallback, useState, useEffect } from "react";
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, Node, Edge, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DatabaseNode } from "./nodes/database-node";
import { FileNode } from "./nodes/file-node";
import { MetadataNode } from "./nodes/metadata-node";
import { PublishNode } from "./nodes/publish-node";
import { SanitizerNode } from "./nodes/sanitizer-node";
import { SqlNode } from "./nodes/sql-node";
import SlicerNode from "./nodes/slicer-node";
import { OmniDBNode } from "./nodes/omni-db-node";
import { SmartEdge } from "./edges/smart-edge";
import { NexusPanel } from "./nexus-panel";
import { HologramTerminal } from "./hologram-terminal";

// Register Custom Nodes Definition
const nodeTypes = {
  database: DatabaseNode,
  file: FileNode,
  metadata: MetadataNode,
  publish: PublishNode,
  sanitizer: SanitizerNode,
  sql: SqlNode,
  slicer: SlicerNode,
  omnidb: OmniDBNode
};

const edgeTypes = {
  smartEdge: SmartEdge,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export function NexusCanvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [activeTerminalNode, setActiveTerminalNode] = useState<any | null>(null);

  const onFileIngested = useCallback((id: string, tableName: string) => {
    setNodes((nds) => 
      nds.map(node => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, tableName } };
        }
        return node;
      })
    );
    setActiveTerminalNode({ tableName }); 
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const data = node.data;
    if (data.tableName || data.dbName || data.sqlQuery) {
      setActiveTerminalNode(data);
    } else {
      setActiveTerminalNode(null); 
    }
  }, []);

  const addNode = useCallback((type: string, payload: any, x?: number, y?: number) => {
     const newNode: Node = {
       id: `node_${nodes.length + 1}_${Date.now()}`,
       type,
       position: { x: x ?? 350, y: y ?? (150 + (nodes.length * 50)) },
       data: { ...payload, onFileIngested }
     };
     setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, onFileIngested]);

  // Mendengarkan siaran sakti dari Tali Saraf saat Join Selesai
  useEffect(() => {
    const handleJoinEvent = (e: any) => {
      const payload = e.detail;
      if (typeof payload === 'object') {
        const nodeData = { 
            label: "Virtual View", 
            dbName: payload.tableName,
            isVirtual: true,
            sqlQuery: payload.sqlQuery,
            executionEngine: 'sqlite'
        };
        setActiveTerminalNode(nodeData); 
        // SPAWN VIRTUAL NODE RESULT SECARA OTOMATIS!
        addNode('database', nodeData, payload.sourceX, payload.sourceY);
      } else {
        setActiveTerminalNode({ tableName: payload });
      }
    };
    window.addEventListener('NEXUS_TABLE_JOINED', handleJoinEvent);
    return () => window.removeEventListener('NEXUS_TABLE_JOINED', handleJoinEvent);
  }, [addNode]);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smartEdge', animated: true, style: { stroke: '#4f46e5', strokeWidth: 3 } }, eds)),
    []
  );

  return (
    <div className="w-full h-full relative bg-[#fafafa] dark:bg-[#09090b]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeClick={onNodeClick}
          fitView
          className="dark:bg-[#0a0a0c]"
        >
          <Background color="#0ea5e9" gap={20} size={1} />
          <Controls className="!bg-white/80 dark:!bg-[#111113]/80 backdrop-blur-md !border-gray-200 dark:!border-white/10 !fill-gray-600 dark:!fill-gray-300" />
        </ReactFlow>

        {/* ZENITH HUD: Exit Button */}
        <Link href="/iam" className="absolute top-6 left-6 z-50 flex items-center gap-2 bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer text-gray-700 dark:text-gray-200 hover:text-blue-500">
           <ArrowLeft className="w-4 h-4" />
           <span className="text-xs font-bold tracking-wide">EXIT ZEN MODE</span>
        </Link>
        
        {/* ZENITH HUD: Floating Tools Panel */}
        <div className="absolute top-6 right-6 z-50 w-72 max-h-[80vh] bg-white/70 dark:bg-[#0a0a0c]/70 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] p-2 overflow-y-auto custom-scrollbar flex flex-col gap-2">
           <div className="p-3 pb-1 border-b border-gray-100 dark:border-white/5 mb-2">
             <div className="text-[10px] uppercase font-mono tracking-widest text-blue-500 font-bold">PUM NEXUS ENGINE</div>
             <div className="text-xs text-gray-500 dark:text-gray-400">Zenith Command Center</div>
           </div>
           <NexusPanel onAddNode={addNode} />
        </div>

        {/* TERMINAL SAKTI */}
        <HologramTerminal nodeData={activeTerminalNode} onClose={() => setActiveTerminalNode(null)} />
    </div>
  );
}
