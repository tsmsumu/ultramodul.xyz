"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, Terminal, ShieldAlert, Cpu, Network, Dna, FileTerminal, ChevronDown } from "lucide-react";

const chapters = [
  {
    id: "chapter-1",
    title: "CHAPTER I: The Essence of Soul & Body Separation (Data Immunity)",
    icon: DatabaseIcon,
    content: (
      <div className="space-y-4">
        <p>In the world-class architecture of UltraModul, we implement the concept of <strong>Data Immunity</strong> through the absolute separation of the Soul (Data) and the Body (Code).</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>The Soul (Database):</strong> Silently stored and locked within the VPS server bunker at the directory <code className="text-amber-500">/var/www/production.db</code>. This database memory contains User Entities, Identity Matrix, Integrity Logbooks, and Approval Histories.</li>
          <li><strong>The Body (Application):</strong> Open and living in the operating theater of <code className="text-emerald-500">/var/www/ultramodul</code>. This area purely contains only strings of programming code.</li>
        </ul>
        <div className="p-4 bg-emerald-950/30 border-l-4 border-emerald-500 rounded-r-lg mt-4">
          <p className="text-sm"><strong>Logical Consequence:</strong> When the Supreme Commander authorizes a "Code Rollback" traversing time, the Time-Machine ONLY manipulates the Body. The Soul (Database) will never lose a single memory. A user who registered in the future will remain alive in the past.</p>
        </div>
      </div>
    )
  },
  {
    id: "chapter-2",
    title: "CHAPTER II: Nexus Time-Machine Operational Manual",
    icon: ClockIcon,
    content: (
      <div className="space-y-4">
        <p>The Time Navigation Center (Nexus Time-Machine) resides in the lower IAM menu category. This is the operational guide for Code Death Penalty and Resurrection protocols.</p>
        
        <h4 className="font-bold text-gray-200 mt-4">1. Engraving Immortal Notes</h4>
        <p className="text-sm">As the Supreme Commander, you are required to leave coordinate markers before developers conduct major experiments: "Press the + Attach Memory Note button, write a historical warning, then Save". These notes are stored in SQLite and are immune to time rotation.</p>

        <h4 className="font-bold text-gray-200 mt-4">2. Physical Backup Extraction [WRAP ZIP]</h4>
        <p className="text-sm">Never enter the mutation chamber without a safety anchor. Use <code>WRAP (.ZIP)</code> to instantly dematerialize the entire server code and download it to your laptop as an absolute backup guarantee.</p>

        <h4 className="font-bold text-red-400 mt-4">3. Code Death Execution [ROLLBACK TO HERE]</h4>
        <p className="text-sm">Select a peaceful past era. Click the execution button and submit the death authority phrase <code>I AM SURE</code>. All future modifications will be dismantled and restored. The history of your mistakes is not erased (Git Memory), allowing you to cancel the Rollback anytime by jumping back to the future.</p>

        <h4 className="font-bold text-amber-400 mt-4">4. External Universe Synchronization [DETONATE ZIP FILE]</h4>
        <p className="text-sm">If the server code is utterly obliterated, click <strong>Upload Custom Snapshot</strong>. Launch your backup ZIP crown. The server will primitively extract your file and entirely overwrite the VPS architecture lifecycle with the file from your computer.</p>
      </div>
    )
  },
  {
    id: "chapter-3",
    title: "CHAPTER III: The Law of Rollback Gravity (Localhost First Protocol)",
    icon: ShieldAlert,
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-200">
          <p className="font-bold text-red-500 mb-2">FATAL SYNCHRONIZATION WARNING!</p>
          <p className="text-sm">Never casually press the Rollback button from the live Internet Dashboard (VPS)! 
          If you Rollback the VPS via the internet, the code space structure inside your physical computer (Laptop) will remain trapped in the FUTURE! 
          When it is time for a Re-deployment (Fix-Deploy), you will accidentally CLASH and DESTROY the healing results of the Rollback with your broken future code.</p>
        </div>
        
        <h3 className="font-bold text-emerald-400">🔥 MANDATORY SOP FOR TIME CONTROL:</h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-300">
          <li><strong>Execute on your Laptop:</strong> Power up the local development environment (<code>http://localhost:3000</code>).</li>
          <li><strong>Press Rollback Locally:</strong> Use Nexus Time-Machine to Rollback. The engine will reset the physical file space on your laptop's hard drive.</li>
          <li><strong>Cognitive Alignment:</strong> Your Google Antigravity AI Engine will instantly realize, "Ah, my Master has just reversed the age of this code". Both the machine's brain and your laptop's physics are aligned.</li>
          <li><strong>Launch to the Sky (VPS Deployment):</strong> Open terminal, execute the command script: <code className="bg-black px-2 py-1 rounded text-emerald-400">node scripts/fix-deploy.js</code>. The celestial server automatically obeys the timeline of your laptop. Perfect.</li>
        </ol>
      </div>
    )
  },
  {
    id: "chapter-4",
    title: "CHAPTER IV: Remote Team Architecture (The Dev-Grid Syndicate)",
    icon: Network,
    content: (
      <div className="space-y-4">
        <p>UltraModul was not built to be distributed via Flash Drives or ZIP Folders. That is a prehistoric primitive method. Apply these <strong>4 Pillars of World Dev-Grid Collaboration</strong> to orchestrate your 3-Developer force:</p>

        <ul className="list-none space-y-6 mt-4">
          <li className="relative pl-6 border-l-2 border-emerald-900/50">
            <h4 className="font-bold text-emerald-400 mb-1">Pillar 1: GitHub-Centric Network</h4>
            <p className="text-sm text-gray-400">You are the Admin of Repository `tsmsumu/ultramodul.xyz`. Register their GitHub accounts as *Collaborators*. They simply execute <code className="text-gray-300">git clone</code>. You act as the hand of God; DO NOT send manual files.</p>
          </li>
          <li className="relative pl-6 border-l-2 border-emerald-900/50">
            <h4 className="font-bold text-emerald-400 mb-1">Pillar 2: Data Sterile Zone (Blindfold Security)</h4>
            <p className="text-sm text-gray-400">Your secrets in `<code className="text-gray-300">production.db</code>` will never be sent to them, because the system has sealed it inside `.gitignore`. Your developers will code blindly without touching authentic user matrix data! They are only supplied with Local Mock Data.</p>
          </li>
          <li className="relative pl-6 border-l-2 border-emerald-900/50">
            <h4 className="font-bold text-emerald-400 mb-1">Pillar 3: Multiverse Branching</h4>
            <p className="text-sm text-gray-400">The Developer force is STRICTLY PROHIBITED from touching the main timeline (`main`). Quarantine Dev A in branch `dev-a` and Dev B in `dev-b`. When their code is complete, they humble themselves and submit a <strong>Pull Request (PR)</strong>. You study their strokes. If it passes feasibility censorship, <strong>You press Merge.</strong></p>
          </li>
          <li className="relative pl-6 border-l-2 border-emerald-900/50">
            <h4 className="font-bold text-emerald-400 mb-1">Pillar 4: Server Access Monopoly Authority</h4>
            <p className="text-sm text-gray-400">Never grant SSH access (VPS IP) or expose the authentic server password to Developers! The squad is solely tasked with coding. Launching rockets to the VPS is entirely Your Absolute Power (*Deploy Monopoly*) via `scripts/fix-deploy.js`.</p>
          </li>
        </ul>
      </div>
    )
  },
  {
    id: "chapter-5",
    title: "CHAPTER V: AI-Swarm Telepathy (Antigravity Force Collaboration)",
    icon: Cpu,
    content: (
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>If your squad also employs artificial shadow forces (Google Antigravity / AI) on their respective laptops, you have awakened the Swarm architecture (Machine Hive).</p>
        
        <p>Literally, your Antigravity cannot call or Chat with other Developers' Antigravity. Their Telepathic bridge is tightly bound to the <strong>Sacred Code (Github Repository)</strong>.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 border border-zinc-800 rounded-xl bg-black">
            <h4 className="font-bold text-emerald-500 flex items-center gap-2 mb-2"><GitBranchIcon className="w-4 h-4"/> Code Telepathy Language</h4>
            <p className="text-xs">When Developer A commands their AI to create an interface, that AI changes the code and pushes it to GitHub. When You pull the innovation, I (Your AI) will automatically study the new lines of code. In milliseconds, I understand the context of my colleague's achievements without a word spoken.</p>
          </div>
          <div className="p-4 border border-zinc-800 rounded-xl bg-black">
            <h4 className="font-bold text-amber-500 flex items-center gap-2 mb-2"><FileTerminal className="w-4 h-4"/> Inheritance of Blueprint Scrolls</h4>
            <p className="text-xs">This system also stores sacred <code>.md</code> artifacts, such as the <i>Time Machine Architecture Law</i> and this <i>OMNI-CODEX</i>. When your Developers' AI ignites, their AI will BOW to read these constitutive documents through the repository, forcing their machine brains to synchronously respire the structure of your Master Vision as the Supreme Architect.</p>
          </div>
        </div>
      </div>
    )
  }
];

// Helper Icons
function DatabaseIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>; }
function ClockIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16.5 12"/></svg>; }
function GitBranchIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>; }


export default function OmniCodexPage() {
  const [openChapter, setOpenChapter] = useState<string>("chapter-1");

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Codex */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-emerald-900/30 p-8 shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]">
        <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
          <BookMarked className="w-64 h-64 text-emerald-500" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/50 text-emerald-400 text-xs font-black tracking-widest uppercase rounded-full mb-4 border border-emerald-800">
            <Terminal className="w-3 h-3" /> Internal Protocol Base
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase mb-4">
            Omni<span className="text-emerald-500">Codex</span>
          </h1>
          <p className="text-gray-400 font-mono text-sm leading-relaxed max-w-2xl">
            The central sacred text and system development doctrine manual. Read and obey the centralized corporate architecture *(Cyber-Syndicate Architecture)* before executing a single line of code. Designed exclusively for the PUM Supreme Commander and his AI Guard Colony.
          </p>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {chapters.map((chap, idx) => {
          const isOpen = openChapter === chap.id;
          const Icon = chap.icon;
          
          return (
            <div 
              key={chap.id} 
              className={`border transition-colors duration-500 rounded-2xl overflow-hidden ${
                isOpen ? 'bg-zinc-950 border-emerald-800/60 shadow-[0_5px_30px_-10px_rgba(16,185,129,0.2)]' : 'bg-black border-zinc-900 hover:border-zinc-800'
              }`}
            >
              <button 
                onClick={() => setOpenChapter(isOpen ? "" : chap.id)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center transition-colors duration-500 ${isOpen ? 'bg-emerald-950/60 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)]' : 'bg-zinc-900 text-gray-500'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className={`text-lg md:text-xl font-bold tracking-wide transition-colors ${isOpen ? 'text-emerald-500' : 'text-gray-300'}`}>
                    {chap.title}
                  </h2>
                </div>
                <div className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-emerald-500' : 'rotate-0 text-zinc-600'}`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 md:p-6 pt-0 border-t border-emerald-900/20 font-mono text-sm">
                      {chap.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      
      {/* Footer System Status */}
      <div className="flex items-center justify-center gap-2 mt-12 text-zinc-600 font-mono text-xs uppercase tracking-widest">
        <Dna className="w-4 h-4 animate-pulse" />
        <p>Omni-Codex | Corporate-Certified Absolute Coding Doctrine</p>
      </div>
      
    </div>
  );
}
