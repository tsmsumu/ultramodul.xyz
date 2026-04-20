import { NexusCanvas } from "@/components/nexus/nexus-canvas";

export default function NexusPage() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#fafafa] dark:bg-[#09090b]">
      <NexusCanvas />
    </div>
  );
}
