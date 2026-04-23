"use server";

import { db } from "@ultra/db";
import { wagTargets, waStatusTargets, waChatTargets, mcProviders, wagLogs, waStatusLogs, waChatLogs, logbookSchedules } from "@ultra/db/src/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function addWagTarget(providerId: string, groupId: string, groupName: string, isTextOnly: boolean = false) {
  try {
    await db.insert(wagTargets).values({
      id: randomUUID(),
      providerId,
      groupId,
      groupName,
      isTextOnly,
      createdAt: new Date()
    });
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function removeWagTarget(providerId: string, targetId: string) {
  try {
    await db.delete(wagTargets).where(eq(wagTargets.id, targetId));
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function addStatusTarget(providerId: string, phoneNumber: string, targetName: string, isTextOnly: boolean = false) {
  try {
    let clean = phoneNumber.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);

    await db.insert(waStatusTargets).values({
      id: randomUUID(),
      providerId,
      phoneNumber: clean,
      targetName,
      isTextOnly,
      createdAt: new Date()
    });
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function removeStatusTarget(providerId: string, targetId: string) {
  try {
    await db.delete(waStatusTargets).where(eq(waStatusTargets.id, targetId));
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function addChatTarget(providerId: string, phoneNumber: string, targetName: string, isTextOnly: boolean = false) {
  try {
    let clean = phoneNumber.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);

    await db.insert(waChatTargets).values({
      id: randomUUID(),
      providerId,
      phoneNumber: clean,
      targetName,
      isTextOnly,
      createdAt: new Date()
    });
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function removeChatTarget(providerId: string, targetId: string) {
  try {
    await db.delete(waChatTargets).where(eq(waChatTargets.id, targetId));
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getMonitorTargets(providerId: string) {
  const wag = await db.select().from(wagTargets).where(eq(wagTargets.providerId, providerId));
  const status = await db.select().from(waStatusTargets).where(eq(waStatusTargets.providerId, providerId));
  const chat = await db.select().from(waChatTargets).where(eq(waChatTargets.providerId, providerId));
  return { wag, status, chat };
}

export async function getWagLogs(providerId: string) {
  return await db.select().from(wagLogs).where(eq(wagLogs.providerId, providerId)).orderBy(desc(wagLogs.timestamp));
}

export async function getStatusLogs(providerId: string) {
  return await db.select().from(waStatusLogs).where(eq(waStatusLogs.providerId, providerId)).orderBy(desc(waStatusLogs.timestamp));
}

export async function getChatLogs(providerId: string) {
  return await db.select().from(waChatLogs).where(eq(waChatLogs.providerId, providerId)).orderBy(desc(waChatLogs.timestamp));
}

export async function syncMonitorTargetsToEngine(providerId: string) {
  try {
    const { wag, status, chat } = await getMonitorTargets(providerId);
    
    // Map to array of objects with id and textOnly flag
    const wagTargetsList = wag.map(w => ({ id: w.groupId, textOnly: w.isTextOnly }));
    const statusTargetsList = status.map(s => ({ id: s.phoneNumber, textOnly: s.isTextOnly }));
    const chatTargetsList = chat.map(c => ({ id: c.phoneNumber, textOnly: c.isTextOnly }));

    await fetch(`http://127.0.0.1:3001/config/${providerId}`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        wagTargets: wagTargetsList,
        statusTargets: statusTargetsList,
        chatTargets: chatTargetsList
      })
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to sync targets to engine", error);
    return { success: false };
  }
}

export async function bulkDeleteLogs(logType: 'chat' | 'wag' | 'status', ids: string[]) {
  try {
    if (ids.length === 0) return { success: true };
    const table = logType === 'chat' ? waChatLogs : logType === 'wag' ? wagLogs : waStatusLogs;
    await db.delete(table).where(inArray(table.id, ids));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function bulkArchiveLogs(logType: 'chat' | 'wag' | 'status', ids: string[], archive: boolean = true) {
  try {
    if (ids.length === 0) return { success: true };
    const table = logType === 'chat' ? waChatLogs : logType === 'wag' ? wagLogs : waStatusLogs;
    // @ts-ignore dynamic table update
    await db.update(table).set({ isArchived: archive }).where(inArray(table.id, ids));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// --- LOGBOOK AUTOMATION SCHEDULER ---
export async function getLogbookSchedules(providerId: string, logType: string) {
  return await db.select().from(logbookSchedules).where(and(eq(logbookSchedules.providerId, providerId), eq(logbookSchedules.logType, logType))).orderBy(desc(logbookSchedules.createdAt));
}

export async function addLogbookSchedule(data: {
  providerId: string,
  logType: string,
  interval: string,
  format: string,
  destinationType: string,
  destinationAddress: string,
  includeMedia: boolean
}) {
  try {
    await db.insert(logbookSchedules).values({
      id: randomUUID(),
      providerId: data.providerId,
      logType: data.logType,
      interval: data.interval,
      format: data.format,
      destinationType: data.destinationType,
      destinationAddress: data.destinationAddress,
      includeMedia: data.includeMedia,
      createdAt: new Date()
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function removeLogbookSchedule(id: string) {
  try {
    await db.delete(logbookSchedules).where(eq(logbookSchedules.id, id));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function bulkDeleteTargets(type: 'chat' | 'wag' | 'status', targetIds: string[]) {
  try {
    if (targetIds.length === 0) return { success: true };
    if (type === 'chat') {
      await db.delete(waChatLogs).where(inArray(waChatLogs.targetId, targetIds));
      await db.delete(waChatTargets).where(inArray(waChatTargets.id, targetIds));
    } else if (type === 'wag') {
      await db.delete(wagLogs).where(inArray(wagLogs.targetId, targetIds));
      await db.delete(wagTargets).where(inArray(wagTargets.id, targetIds));
    } else if (type === 'status') {
      await db.delete(waStatusLogs).where(inArray(waStatusLogs.targetId, targetIds));
      await db.delete(waStatusTargets).where(inArray(waStatusTargets.id, targetIds));
    }
    return { success: true };
  } catch (error) {
    console.error(`Failed to bulk delete ${type} targets`, error);
    return { success: false };
  }
}
