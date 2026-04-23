"use server";

import { db } from "@ultra/db";
import { mcProviders, mcMappings, mcSessions, mcLogs, users } from "@ultra/db/src/schema";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

// --- PROVIDERS ---
export async function getProviders() {
  try {
    let providers = await db.select().from(mcProviders).orderBy(mcProviders.providerType);
    
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
      providers = await db.select().from(mcProviders).orderBy(mcProviders.providerType);
    }
    return providers;
  } catch (error) {
    console.error("Failed to fetch mcProviders", error);
    return [];
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
    
    // Delete from DB
    await db.delete(mcProviders).where(eq(mcProviders.id, providerId));
    return { success: true };
  } catch (error) {
    console.error("Failed to delete WA Node", error);
    return { success: false, message: "Error deleting node" };
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


