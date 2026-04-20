"use client";

import { NexusCanvas } from "@/components/nexus/nexus-canvas";
import { ReactFlowProvider } from "@xyflow/react";

export default function NexusPage() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
      <ReactFlowProvider>
        <NexusCanvas />
      </ReactFlowProvider>
    </div>
  );
}
