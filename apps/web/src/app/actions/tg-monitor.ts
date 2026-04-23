"use server";

import { db } from "@ultra/db";
import { tgGroupTargets, tgChannelTargets, tgChatTargets, mcProviders, tgGroupLogs, tgChannelLogs, tgChatLogs, logbookSchedules } from "@ultra/db/src/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function addGroupTarget(providerId: string, groupId: string, groupName: string, isTextOnly: boolean = false) {
  try {
    await db.insert(tgGroupTargets).values({
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

export async function removeGroupTarget(providerId: string, targetId: string) {
  try {
    await db.delete(tgGroupTargets).where(eq(tgGroupTargets.id, targetId));
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function addChannelTarget(providerId: string, channelId: string, targetName: string, isTextOnly: boolean = false) {
  try {
    let clean = channelId.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);

    await db.insert(tgChannelTargets).values({
      id: randomUUID(),
      providerId,
      channelId: clean,
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

export async function removeChannelTarget(providerId: string, targetId: string) {
  try {
    await db.delete(tgChannelTargets).where(eq(tgChannelTargets.id, targetId));
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function addChatTarget(providerId: string, channelId: string, targetName: string, isTextOnly: boolean = false) {
  try {
    let clean = channelId.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);

    await db.insert(tgChatTargets).values({
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
    await db.delete(tgChatTargets).where(eq(tgChatTargets.id, targetId));
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getMonitorTargets(providerId: string) {
  const tgGroup = await db.select().from(tgGroupTargets).where(eq(tgGroupTargets.providerId, providerId));
  const status = await db.select().from(tgChannelTargets).where(eq(tgChannelTargets.providerId, providerId));
  const chat = await db.select().from(tgChatTargets).where(eq(tgChatTargets.providerId, providerId));
  return { tgGroup, status, chat };
}

export async function getGroupLogs(providerId: string) {
  return await db.select().from(tgGroupLogs).where(eq(tgGroupLogs.providerId, providerId)).orderBy(desc(tgGroupLogs.timestamp));
}

export async function getChannelLogs(providerId: string) {
  return await db.select().from(tgChannelLogs).where(eq(tgChannelLogs.providerId, providerId)).orderBy(desc(tgChannelLogs.timestamp));
}

export async function getChatLogs(providerId: string) {
  return await db.select().from(tgChatLogs).where(eq(tgChatLogs.providerId, providerId)).orderBy(desc(tgChatLogs.timestamp));
}

export async function syncMonitorTargetsToEngine(providerId: string) {
  try {
    const { tgGroup, status, chat } = await getMonitorTargets(providerId);
    
    // Map to array of objects with id and textOnly flag
    const tgGroupTargetsList = tgGroup.map(w => ({ id: w.groupId, textOnly: w.isTextOnly }));
    const statusTargetsList = status.map(s => ({ id: s.channelId, textOnly: s.isTextOnly }));
    const chatTargetsList = chat.map(c => ({ id: c.channelId, textOnly: c.isTextOnly }));

    await fetch(`http://127.0.0.1:3001/config/${providerId}`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        tgGroupTargets: tgGroupTargetsList,
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

export async function bulkDeleteLogs(logType: 'chat' | 'tgGroup' | 'status', ids: string[]) {
  try {
    if (ids.length === 0) return { success: true };
    const table = logType === 'chat' ? tgChatLogs : logType === 'tgGroup' ? tgGroupLogs : tgChannelLogs;
    await db.delete(table).where(inArray(table.id, ids));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function bulkArchiveLogs(logType: 'chat' | 'tgGroup' | 'status', ids: string[], archive: boolean = true) {
  try {
    if (ids.length === 0) return { success: true };
    const table = logType === 'chat' ? tgChatLogs : logType === 'tgGroup' ? tgGroupLogs : tgChannelLogs;
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

export async function bulkDeleteTargets(type: 'chat' | 'tgGroup' | 'status', targetIds: string[]) {
  try {
    if (targetIds.length === 0) return { success: true };
    if (type === 'chat') {
      await db.delete(tgChatLogs).where(inArray(tgChatLogs.targetId, targetIds));
      await db.delete(tgChatTargets).where(inArray(tgChatTargets.id, targetIds));
    } else if (type === 'tgGroup') {
      await db.delete(tgGroupLogs).where(inArray(tgGroupLogs.targetId, targetIds));
      await db.delete(tgGroupTargets).where(inArray(tgGroupTargets.id, targetIds));
    } else if (type === 'status') {
      await db.delete(tgChannelLogs).where(inArray(tgChannelLogs.targetId, targetIds));
      await db.delete(tgChannelTargets).where(inArray(tgChannelTargets.id, targetIds));
    }
    return { success: true };
  } catch (error) {
    console.error(`Failed to bulk delete ${type} targets`, error);
    return { success: false };
  }
}

export async function importLogbookData(providerId: string, logType: 'chat' | 'tgGroup' | 'status', data: any[]) {
  try {
    if (data.length === 0) return { success: true, imported: 0 };
    let importedCount = 0;

    if (logType === 'chat') {
      const existingTargets = await db.select().from(tgChatTargets).where(eq(tgChatTargets.providerId, providerId));
      const targetMap = new Map(existingTargets.map(t => [t.phoneNumber, t.id]));
      
      const existingLogs = await db.select().from(tgChatLogs).where(eq(tgChatLogs.providerId, providerId));
      const logSet = new Set(existingLogs.map(l => `${l.targetId}_${l.timestamp.getTime()}_${l.textContent}`));

      for (const row of data) {
        if (!row.peerNumber) continue;
        let tId = targetMap.get(row.peerNumber);
        if (!tId) {
          tId = randomUUID();
          await db.insert(tgChatTargets).values({ id: tId, providerId, channelId: row.peerNumber, targetName: row.peerName || row.peerNumber, isTextOnly: false, createdAt: new Date() });
          targetMap.set(row.peerNumber, tId);
        }

        const timestamp = row.date && row.time ? new Date(`${row.date} ${row.time}`) : new Date();
        const hash = `${tId}_${timestamp.getTime()}_${row.content || ''}`;
        if (!logSet.has(hash)) {
          await db.insert(tgChatLogs).values({
            id: randomUUID(),
            providerId,
            targetId: tId,
            isFromMe: row.direction === 'Outbound',
            senderNumber: row.sender || (row.direction === 'Outbound' ? 'me' : row.peerNumber),
            textContent: row.content || '',
            timestamp,
            isArchived: false
          });
          logSet.add(hash);
          importedCount++;
        }
      }
    } else if (logType === 'tgGroup') {
      const existingTargets = await db.select().from(tgGroupTargets).where(eq(tgGroupTargets.providerId, providerId));
      const targetMap = new Map(existingTargets.map(t => [t.groupId, t.id]));
      
      const existingLogs = await db.select().from(tgGroupLogs).where(eq(tgGroupLogs.providerId, providerId));
      const logSet = new Set(existingLogs.map(l => `${l.targetId}_${l.timestamp.getTime()}_${l.textContent}`));

      for (const row of data) {
        if (!row.groupJid) continue;
        let tId = targetMap.get(row.groupJid);
        if (!tId) {
          tId = randomUUID();
          await db.insert(tgGroupTargets).values({ id: tId, providerId, groupId: row.groupJid, groupName: row.groupName || row.groupJid, isTextOnly: false, createdAt: new Date() });
          targetMap.set(row.groupJid, tId);
        }

        const timestamp = row.date && row.time ? new Date(`${row.date} ${row.time}`) : new Date();
        const hash = `${tId}_${timestamp.getTime()}_${row.content || ''}`;
        if (!logSet.has(hash)) {
          await db.insert(tgGroupLogs).values({
            id: randomUUID(),
            providerId,
            targetId: tId,
            senderNumber: row.sender || '',
            textContent: row.content || '',
            timestamp,
            isArchived: false
          });
          logSet.add(hash);
          importedCount++;
        }
      }
    } else if (logType === 'status') {
      const existingTargets = await db.select().from(tgChannelTargets).where(eq(tgChannelTargets.providerId, providerId));
      const targetMap = new Map(existingTargets.map(t => [t.channelId, t.id]));
      
      const existingLogs = await db.select().from(tgChannelLogs).where(eq(tgChannelLogs.providerId, providerId));
      const logSet = new Set(existingLogs.map(l => `${l.targetId}_${l.timestamp.getTime()}_${l.textContent}`));

      for (const row of data) {
        if (!row.targetNumber) continue;
        let tId = targetMap.get(row.targetNumber);
        if (!tId) {
          tId = randomUUID();
          await db.insert(tgChannelTargets).values({ id: tId, providerId, channelId: row.targetNumber, targetName: row.targetName || row.targetNumber, isTextOnly: false, createdAt: new Date() });
          targetMap.set(row.targetNumber, tId);
        }

        const timestamp = row.date && row.time ? new Date(`${row.date} ${row.time}`) : new Date();
        const hash = `${tId}_${timestamp.getTime()}_${row.content || ''}`;
        if (!logSet.has(hash)) {
          await db.insert(tgChannelLogs).values({
            id: randomUUID(),
            providerId,
            targetId: tId,
            textContent: row.content || '',
            timestamp,
            isArchived: false
          });
          logSet.add(hash);
          importedCount++;
        }
      }
    }

    return { success: true, imported: importedCount };
  } catch (error) {
    console.error("Smart Import Failed:", error);
    return { success: false, message: "Import failed due to server error" };
  }
}
