"use client";

import { useCallback, useState } from "react";
import { ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges, addEdge, Node, Edge, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DatabaseNode } from "./nodes/database-node";
import { FileNode } from "./nodes/file-node";
import { MetadataNode } from "./nodes/metadata-node";
import { TailorPanel } from "./tailor-panel";

// Register Custom Nodes Definition
const nodeTypes = {
  database: DatabaseNode,
  file: FileNode,
  metadata: MetadataNode,
};

const initialNodes: Node[] = [
  { id: "1", type: "database", position: { x: 100, y: 150 }, data: { label: "PostgreSQL", dbName: "Server Jakarta" } },
  { id: "2", type: "file", position: { x: 100, y: 350 }, data: { label: "Parquet", fileName: "Data Penduduk 2026.parquet" } },
];

const initialEdges: Edge[] = [];

export function TailorCanvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#4f46e5', strokeWidth: 2 } }, eds)),
    []
  );

  const addNode = (type: string, payload: any) => {
     const newNode: Node = {
       id: `node_${nodes.length + 1}_${Date.now()}`,
       type,
       position: { x: 350, y: 150 + (nodes.length * 50) },
       data: payload
     };
     setNodes([...nodes, newNode]);
  };

  return (
    <div className="w-full h-full flex bg-[#fafafa] dark:bg-[#09090b]">
       <div className="flex-1 relative h-full">
         <ReactFlow
           nodes={nodes}
           edges={edges}
           onNodesChange={onNodesChange}
           onEdgesChange={onEdgesChange}
           onConnect={onConnect}
           nodeTypes={nodeTypes}
           fitView
           className="dark:bg-[#0a0a0c]"
         >
           <Background color="#cbd5e1" gap={16} />
           <Controls />
         </ReactFlow>
       </div>
       <div className="w-80 h-full border-l border-gray-200 dark:border-white/10 bg-white dark:bg-[#111113] p-4 flex flex-col gap-4 z-10 shadow-xl overflow-y-auto">
          <TailorPanel onAddNode={addNode} />
       </div>
    </div>
  );
}
