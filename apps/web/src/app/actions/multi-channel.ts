"use server";

import { db } from "@ultra/db";
import { mcProviders, mcMappings, mcSessions, mcLogs, users } from "@ultra/db/src/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// --- PROVIDERS ---
export async function getProviders() {
  try {
    let providers = await db.select().from(mcProviders).where(eq(mcProviders.isArchived, false)).orderBy(mcProviders.providerType);
    
    // Seed default providers if empty
    if (providers.length === 0) {
      const initialProviders = [
        { id: randomUUID(), providerType: "whatsapp", name: "WhatsApp Enterprise", isActive: false, configPayload: "{}", createdAt: new Date(), updatedAt: new Date() },
        { id: randomUUID(), providerType: "telegram", name: "Telegram Bot API", isActive: false, configPayload: "{}", createdAt: new Date(), updatedAt: new Date() },
        { id: randomUUID(), providerType: "signal", name: "Signal Secure API", isActive: false, configPayload: "{}", createdAt: new Date(), updatedAt: new Date() },
        { id: randomUUID(), providerType: "sms", name: "Twilio SMS Gateway", isActive: false, configPayload: "{}", createdAt: new Date(), updatedAt: new Date() },
        { id: randomUUID(), providerType: "email", name: "SMTP Secure Gateway", isActive: false, configPayload: "{}", createdAt: new Date(), updatedAt: new Date() }
      ];
      await db.insert(mcProviders).values(initialProviders);
      providers = await db.select().from(mcProviders).where(eq(mcProviders.isArchived, false)).orderBy(mcProviders.providerType);
    }
    return providers;
  } catch (error) {
    console.error("Failed to fetch mcProviders", error);
    return [];
  }
}

export async function getArchivedProviders() {
  try {
    return await db.select().from(mcProviders).where(eq(mcProviders.isArchived, true)).orderBy(desc(mcProviders.updatedAt));
  } catch (error) {
    console.error("Failed to fetch archived mcProviders", error);
    return [];
  }
}

export async function getSystemStorage() {
  try {
    const { stdout } = await execAsync('df -h /');
    // Example Output:
    // Filesystem      Size  Used Avail Use% Mounted on
    // /dev/sda1        50G   20G   28G  42% /
    const lines = stdout.trim().split('\n');
    if (lines.length > 1) {
      const parts = lines[1].trim().split(/\s+/);
      if (parts.length >= 5) {
        return {
          total: parts[1],
          used: parts[2],
          available: parts[3],
          usePercent: parseInt(parts[4].replace('%', '')),
          success: true
        };
      }
    }
    return { success: false, message: "Parsing failed" };
  } catch (error) {
    // Fallback for Windows local dev
    return {
      total: "50G",
      used: "20G",
      available: "30G",
      usePercent: 40,
      success: true,
      simulated: true
    };
  }
}

export async function toggleProviderActive(id: string, currentStatus: boolean) {
  try {
    await db.update(mcProviders).set({ isActive: !currentStatus, updatedAt: new Date() }).where(eq(mcProviders.id, id));
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle mcProvider", error);
    return { success: false };
  }
}

export async function updateProviderConfig(id: string, payload: string) {
  try {
    await db.update(mcProviders).set({ configPayload: payload, updatedAt: new Date() }).where(eq(mcProviders.id, id));
    return { success: true };
  } catch (error) {
    console.error("Failed to update mcProvider config", error);
    return { success: false };
  }
}

// --- MAPPINGS ---
export async function getPhoneMappings() {
  try {
    return await db.select({
      id: mcMappings.id,
      userId: mcMappings.userId,
      providerId: mcMappings.providerId,
      channelIdentifier: mcMappings.channelIdentifier,
      ultraPin: mcMappings.ultraPin,
      createdAt: mcMappings.createdAt,
      userName: users.name,
      userRole: users.role,
      providerName: mcProviders.name,
      providerType: mcProviders.providerType
    })
    .from(mcMappings)
    .leftJoin(users, eq(mcMappings.userId, users.id))
    .leftJoin(mcProviders, eq(mcMappings.providerId, mcProviders.id))
    .orderBy(desc(mcMappings.createdAt));
  } catch (error) {
    console.error("Failed to fetch mcMappings", error);
    return [];
  }
}

// --- SESSIONS ---
export async function getLiveSessions() {
  try {
    return await db.select({
      id: mcSessions.id,
      sessionToken: mcSessions.sessionToken,
      ipAddress: mcSessions.ipAddress,
      userAgent: mcSessions.userAgent,
      status: mcSessions.status,
      startedAt: mcSessions.startedAt,
      lastActive: mcSessions.lastActive,
      channelIdentifier: mcMappings.channelIdentifier,
      userName: users.name,
      providerName: mcProviders.name
    })
    .from(mcSessions)
    .leftJoin(mcMappings, eq(mcSessions.mappingId, mcMappings.id))
    .leftJoin(users, eq(mcMappings.userId, users.id))
    .leftJoin(mcProviders, eq(mcMappings.providerId, mcProviders.id))
    .orderBy(desc(mcSessions.lastActive));
  } catch (error) {
    console.error("Failed to fetch mcSessions", error);
    return [];
  }
}

// --- LOGS ---
export async function getForensicLogs() {
  try {
    return await db.select({
      id: mcLogs.id,
      action: mcLogs.action,
      metadata: mcLogs.metadata,
      timestamp: mcLogs.timestamp,
      providerName: mcProviders.name,
      providerType: mcProviders.providerType,
      sessionToken: mcSessions.sessionToken
    })
    .from(mcLogs)
    .leftJoin(mcProviders, eq(mcLogs.providerId, mcProviders.id))
    .leftJoin(mcSessions, eq(mcLogs.sessionId, mcSessions.id))
    .orderBy(desc(mcLogs.timestamp))
    .limit(200);
  } catch (error) {
    console.error("Failed to fetch mcLogs", error);
    return [];
  }
}

export async function simulateForensicLog(providerId: string, action: string, metadata: string) {
  try {
    await db.insert(mcLogs).values({
      id: randomUUID(),
      providerId,
      action,
      metadata,
      timestamp: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to insert mcLog", error);
    return { success: false };
  }
}


export async function createWhatsAppNode() {
  try {
    const newId = randomUUID();
    await db.insert(mcProviders).values({
      id: newId,
      providerType: "whatsapp",
      name: `WhatsApp Node - ${newId.split('-')[0]}`,
      isActive: false,
      configPayload: "{}",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { success: true, message: "Node Created", id: newId };
  } catch (error) {
    console.error("Failed to create WA Node", error);
    return { success: false, message: "Error creating node" };
  }
}

export async function deleteWhatsAppNode(providerId: string) {
  try {
    // Attempt to logout and delete session on the wa-engine
    try {
      await fetch(`http://127.0.0.1:3001/logout/${providerId}`, { method: 'POST' });
    } catch (e) {
      console.log("Engine logout failed or engine unreachable", e);
    }
    
    // Soft Delete from DB
    await db.update(mcProviders).set({ isArchived: true, updatedAt: new Date() }).where(eq(mcProviders.id, providerId));
    return { success: true };
  } catch (error) {
    console.error("Failed to delete WA Node", error);
    return { success: false, message: "Error deleting node" };
  }
}

export async function logoutWhatsAppSession(providerId: string) {
  try {
    await fetch(`http://127.0.0.1:3001/logout/${providerId}`, { method: 'POST' });
    return { success: true };
  } catch (error) {
    console.error("Failed to logout session", error);
    return { success: false, message: "Error logging out" };
  }
}

export async function initWaEngineNode(providerId: string, name: string = "") {
  try {
    await fetch(`http://127.0.0.1:3001/init/${providerId}`, { 
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function renameWhatsAppNode(providerId: string, newName: string) {
  try {
    // 1. Update Engine Local Name
    try {
      await fetch(`http://127.0.0.1:3001/rename/${providerId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      });
    } catch(e) {
      console.log("Engine rename failed", e);
    }

    // 2. Update Database
    await db.update(mcProviders).set({ name: newName, updatedAt: new Date() }).where(eq(mcProviders.id, providerId));
    return { success: true };
  } catch (error) {
    return { success: false, message: "Error renaming node" };
  }
}

export async function updateWaNodeFirewall(providerId: string, whitelist: string[]) {
  try {
    // 1. Fetch current configPayload from DB
    const provider = await db.select().from(mcProviders).where(eq(mcProviders.id, providerId)).limit(1);
    let payload = {};
    if (provider.length > 0 && provider[0].configPayload) {
      try {
        payload = JSON.parse(provider[0].configPayload);
      } catch (e) {}
    }
    
    payload = { ...payload, whitelist };
    const newPayloadString = JSON.stringify(payload);

    // 2. Update Database
    await db.update(mcProviders).set({ configPayload: newPayloadString, updatedAt: new Date() }).where(eq(mcProviders.id, providerId));

    // 3. Update Engine Local Config
    try {
      await fetch(`http://127.0.0.1:3001/config/${providerId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whitelist })
      });
    } catch(e) {
      console.log("Engine config update failed", e);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update firewall", error);
    return { success: false, message: "Error updating firewall" };
  }
}

export async function updateWaNodeHistorySync(providerId: string, syncHistory: boolean, historyStart?: string, historyEnd?: string, historyMediaMode?: string) {
  try {
    const provider = await db.select().from(mcProviders).where(eq(mcProviders.id, providerId)).limit(1);
    let payload: any = {};
    if (provider.length > 0 && provider[0].configPayload) {
      try {
        payload = JSON.parse(provider[0].configPayload);
      } catch (e) {}
    }
    
    payload = { ...payload, syncHistory, historyStart, historyEnd, historyMediaMode };
    const newPayloadString = JSON.stringify(payload);

    await db.update(mcProviders).set({ configPayload: newPayloadString, updatedAt: new Date() }).where(eq(mcProviders.id, providerId));

    try {
      await fetch(`http://127.0.0.1:3001/config/${providerId}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncHistory, historyStart, historyEnd, historyMediaMode })
      });
    } catch(e) {
      console.log("Engine config update failed", e);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update history sync config", error);
    return { success: false, message: "Error updating history config" };
  }
}

export async function sendMessageViaEngine(providerType: string, providerId: string, to: string, message: string) {
  try {
    if (providerType === "whatsapp") {
      const response = await fetch(`http://127.0.0.1:3001/send/${providerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message })
      });
      const data = await response.json();
      
      await db.insert(mcLogs).values({
        id: randomUUID(),
        providerId: providerId,
        action: data.success ? "MESSAGE_SENT" : "ERROR_SENDING",
        metadata: `To: ${to} | Msg: ${message} | Result: ${JSON.stringify(data)}`,
        timestamp: new Date()
      });
      return data;
    }
    return { success: false, message: "Provider not fully integrated yet" };
  } catch (error: any) {
    console.error("Engine Send Error:", error);
    return { success: false, message: error.message };
  }
}

export async function getWaEngineStatus(providerId: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3001/status/${providerId}`, { cache: 'no-store' });
    const data = await res.json();
    return data;
  } catch (error) {
    return { status: 'offline', hasSession: false };
  }
}

export async function getWaEngineQr(providerId: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3001/qr/${providerId}`, { cache: 'no-store' });
    const data = await res.json();
    return data;
  } catch (error) {
    return { success: false, message: 'Failed to fetch QR' };
  }
}

export async function setWaEnginePresence(providerId: string, presence: 'available' | 'unavailable') {
  try {
    const res = await fetch(`http://127.0.0.1:3001/presence/${providerId}`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ presence })
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: 'Failed to set presence' };
  }
}


