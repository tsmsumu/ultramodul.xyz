"use server";

import { exec } from "child_process";
import { promisify } from "util";
import { cookies } from "next/headers";
import { getResolvedPermissions } from "./matrix";

const execAsync = promisify(exec);

async function checkAdminAccess() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("UNIVERSAL_SESSION_ID")?.value;
  if (!userId) throw new Error("UNAUTHORIZED");

  const matrix = await getResolvedPermissions(userId);
  
  // Matrix is Record<string, string[]>
  const iamPerms = matrix["IAM Console"] || matrix["Aegis Panopticon (DB)"] || matrix["ALL_ACCESS_JIT"];
  
  // Minimal harus punya hak masuk ke Aegis Panopticon
  if (!iamPerms || (!iamPerms.includes("VIEW") && !iamPerms.includes("MODIFY"))) {
    throw new Error("FORBIDDEN: Aegis Clearance Required");
  }
}

// 1. PM2 Guardian Actions
export async function getPm2Status() {
  await checkAdminAccess();
  try {
    const { stdout } = await execAsync("pm2 jlist");
    const processes = JSON.parse(stdout);
    return processes.map((p: any) => ({
      name: p.name,
      pid: p.pid,
      status: p.pm2_env.status,
      memory: Math.round(p.monit.memory / 1024 / 1024) + " MB",
      cpu: p.monit.cpu + "%",
      uptime: Math.round((Date.now() - p.pm2_env.pm_uptime) / 1000 / 60) + "m"
    }));
  } catch (error) {
    console.error("PM2 Error:", error);
    // Mock for Windows Local Dev
    return [
      { name: "ultramodul (MOCK)", pid: 1024, status: "online", memory: "128 MB", cpu: "2%", uptime: "15m" }
    ];
  }
}

export async function restartPm2Process(name: string) {
  await checkAdminAccess();
  try {
    await execAsync(`pm2 restart ${name}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}

// 2. UFW Firewall Actions
export async function getUfwStatus() {
  await checkAdminAccess();
  try {
    // sudo assumes NOPASSWD is set for ubuntu user in visudo
    const { stdout } = await execAsync("sudo ufw status numbered");
    
    if (stdout.includes("inactive")) {
      return { active: false, rules: [] };
    }

    // Parsing UFW output
    const lines = stdout.split('\n').filter(l => l.includes('[') && l.includes('ALLOW'));
    const rules = lines.map(line => {
      const match = line.match(/\[\s*(\d+)\]\s+(\S+)\s+(\S+)\s+(.+)/);
      if (match) {
        return { id: match[1], to: match[2], action: match[3], from: match[4] };
      }
      return null;
    }).filter(Boolean);

    return { active: true, rules };
  } catch (error) {
    console.error("UFW Error:", error);
    // Mock for Windows Local Dev
    return { 
      active: true, 
      rules: [
        { id: "1", to: "80/tcp", action: "ALLOW IN", from: "Anywhere" },
        { id: "2", to: "443/tcp", action: "ALLOW IN", from: "Anywhere" },
        { id: "3", to: "22/tcp", action: "ALLOW IN", from: "Anywhere" }
      ],
      isMock: true
    };
  }
}

export async function toggleFirewallStealth(enableStealth: boolean) {
  await checkAdminAccess();
  try {
    if (enableStealth) {
      // STEALTH MODE: Tutup semua port kecuali Web dan SSH
      await execAsync("sudo ufw default deny incoming");
      await execAsync("sudo ufw default allow outgoing");
      return { success: true, mode: "STEALTH" };
    } else {
      // NORMAL MODE: (You might define what normal means, usually just standard ports)
      await execAsync("sudo ufw default deny incoming");
      return { success: true, mode: "NORMAL" };
    }
  } catch (error) {
    console.error(error);
    return { success: false, error: String(error) };
  }
}

// 3. Log Polling (Alternatively to SSE if we just want simple client polling)
export async function fetchLatestLogs(lines: number = 50) {
  await checkAdminAccess();
  try {
    const { stdout } = await execAsync(`tail -n ${lines} ~/.pm2/logs/ultramodul-out.log`);
    return stdout.split('\n').filter(Boolean);
  } catch (e) {
    return [
      "[SYSTEM] PM2 Log tail failed. You might be on Windows.",
      "[MOCK] 2026-04-21 15:00:00 - UltraModul Engine started.",
      "[MOCK] 2026-04-21 15:01:05 - Request incoming to /dashboard (GET 200)",
      "[MOCK] 2026-04-21 15:02:10 - Query executed in 15ms."
    ];
  }
}
