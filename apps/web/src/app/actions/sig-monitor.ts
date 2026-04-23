"use server";

import { db } from "@ultra/db";
import { sigGroupTargets, sigStoryTargets, sigChatTargets, mcProviders, sigGroupLogs, sigStoryLogs, sigChatLogs, logbookSchedules } from "@ultra/db/src/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function addGroupTarget(providerId: string, groupId: string, groupName: string, isTextOnly: boolean = false) {
  try {
    await db.insert(sigGroupTargets).values({
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
    await db.delete(sigGroupTargets).where(eq(sigGroupTargets.id, targetId));
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function addStoryTarget(providerId: string, storyId: string, targetName: string, isTextOnly: boolean = false) {
  try {
    let clean = storyId.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);

    await db.insert(sigStoryTargets).values({
      id: randomUUID(),
      providerId,
      storyId: clean,
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

export async function removeStoryTarget(providerId: string, targetId: string) {
  try {
    await db.delete(sigStoryTargets).where(eq(sigStoryTargets.id, targetId));
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function addChatTarget(providerId: string, storyId: string, targetName: string, isTextOnly: boolean = false) {
  try {
    let clean = storyId.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);

    await db.insert(sigChatTargets).values({
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
    await db.delete(sigChatTargets).where(eq(sigChatTargets.id, targetId));
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getMonitorTargets(providerId: string) {
  const sigGroup = await db.select().from(sigGroupTargets).where(eq(sigGroupTargets.providerId, providerId));
  const story = await db.select().from(sigStoryTargets).where(eq(sigStoryTargets.providerId, providerId));
  const chat = await db.select().from(sigChatTargets).where(eq(sigChatTargets.providerId, providerId));
  return { sigGroup, story, chat };
}

export async function getGroupLogs(providerId: string) {
  return await db.select().from(sigGroupLogs).where(eq(sigGroupLogs.providerId, providerId)).orderBy(desc(sigGroupLogs.timestamp));
}

export async function getStoryLogs(providerId: string) {
  return await db.select().from(sigStoryLogs).where(eq(sigStoryLogs.providerId, providerId)).orderBy(desc(sigStoryLogs.timestamp));
}

export async function getChatLogs(providerId: string) {
  return await db.select().from(sigChatLogs).where(eq(sigChatLogs.providerId, providerId)).orderBy(desc(sigChatLogs.timestamp));
}

export async function syncMonitorTargetsToEngine(providerId: string) {
  try {
    const { sigGroup, story, chat } = await getMonitorTargets(providerId);
    
    // Map to array of objects with id and textOnly flag
    const sigGroupTargetsList = sigGroup.map(w => ({ id: w.groupId, textOnly: w.isTextOnly }));
    const storyTargetsList = story.map(s => ({ id: s.storyId, textOnly: s.isTextOnly }));
    const chatTargetsList = chat.map(c => ({ id: c.phoneNumber, textOnly: c.isTextOnly }));

    await fetch(`http://127.0.0.1:3003/config/${providerId}`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        sigGroupTargets: sigGroupTargetsList,
        storyTargets: storyTargetsList,
        chatTargets: chatTargetsList
      })
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to sync targets to engine", error);
    return { success: false };
  }
}

export async function bulkDeleteLogs(logType: 'chat' | 'sigGroup' | 'story', ids: string[]) {
  try {
    if (ids.length === 0) return { success: true };
    const table = logType === 'chat' ? sigChatLogs : logType === 'sigGroup' ? sigGroupLogs : sigStoryLogs;
    await db.delete(table).where(inArray(table.id, ids));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function bulkArchiveLogs(logType: 'chat' | 'sigGroup' | 'story', ids: string[], archive: boolean = true) {
  try {
    if (ids.length === 0) return { success: true };
    const table = logType === 'chat' ? sigChatLogs : logType === 'sigGroup' ? sigGroupLogs : sigStoryLogs;
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

export async function bulkDeleteTargets(type: 'chat' | 'sigGroup' | 'story', targetIds: string[]) {
  try {
    if (targetIds.length === 0) return { success: true };
    if (type === 'chat') {
      await db.delete(sigChatLogs).where(inArray(sigChatLogs.targetId, targetIds));
      await db.delete(sigChatTargets).where(inArray(sigChatTargets.id, targetIds));
    } else if (type === 'sigGroup') {
      await db.delete(sigGroupLogs).where(inArray(sigGroupLogs.targetId, targetIds));
      await db.delete(sigGroupTargets).where(inArray(sigGroupTargets.id, targetIds));
    } else if (type === 'story') {
      await db.delete(sigStoryLogs).where(inArray(sigStoryLogs.targetId, targetIds));
      await db.delete(sigStoryTargets).where(inArray(sigStoryTargets.id, targetIds));
    }
    return { success: true };
  } catch (error) {
    console.error(`Failed to bulk delete ${type} targets`, error);
    return { success: false };
  }
}

export async function importLogbookData(providerId: string, logType: 'chat' | 'sigGroup' | 'story', data: any[]) {
  try {
    if (data.length === 0) return { success: true, imported: 0 };
    let importedCount = 0;

    if (logType === 'chat') {
      const existingTargets = await db.select().from(sigChatTargets).where(eq(sigChatTargets.providerId, providerId));
      const targetMap = new Map(existingTargets.map(t => [t.phoneNumber, t.id]));
      
      const existingLogs = await db.select().from(sigChatLogs).where(eq(sigChatLogs.providerId, providerId));
      const logSet = new Set(existingLogs.map(l => `${l.targetId}_${l.timestamp.getTime()}_${l.textContent}`));

      for (const row of data) {
        if (!row.peerNumber) continue;
        let tId = targetMap.get(row.peerNumber);
        if (!tId) {
          tId = randomUUID();
          await db.insert(sigChatTargets).values({ id: tId, providerId, phoneNumber: row.peerNumber, targetName: row.peerName || row.peerNumber, isTextOnly: false, createdAt: new Date() });
          targetMap.set(row.peerNumber, tId);
        }

        const timestamp = row.date && row.time ? new Date(`${row.date} ${row.time}`) : new Date();
        const hash = `${tId}_${timestamp.getTime()}_${row.content || ''}`;
        if (!logSet.has(hash)) {
          await db.insert(sigChatLogs).values({
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
    } else if (logType === 'sigGroup') {
      const existingTargets = await db.select().from(sigGroupTargets).where(eq(sigGroupTargets.providerId, providerId));
      const targetMap = new Map(existingTargets.map(t => [t.groupId, t.id]));
      
      const existingLogs = await db.select().from(sigGroupLogs).where(eq(sigGroupLogs.providerId, providerId));
      const logSet = new Set(existingLogs.map(l => `${l.targetId}_${l.timestamp.getTime()}_${l.textContent}`));

      for (const row of data) {
        if (!row.groupJid) continue;
        let tId = targetMap.get(row.groupJid);
        if (!tId) {
          tId = randomUUID();
          await db.insert(sigGroupTargets).values({ id: tId, providerId, groupId: row.groupJid, groupName: row.groupName || row.groupJid, isTextOnly: false, createdAt: new Date() });
          targetMap.set(row.groupJid, tId);
        }

        const timestamp = row.date && row.time ? new Date(`${row.date} ${row.time}`) : new Date();
        const hash = `${tId}_${timestamp.getTime()}_${row.content || ''}`;
        if (!logSet.has(hash)) {
          await db.insert(sigGroupLogs).values({
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
    } else if (logType === 'story') {
      const existingTargets = await db.select().from(sigStoryTargets).where(eq(sigStoryTargets.providerId, providerId));
      const targetMap = new Map(existingTargets.map(t => [t.storyId, t.id]));
      
      const existingLogs = await db.select().from(sigStoryLogs).where(eq(sigStoryLogs.providerId, providerId));
      const logSet = new Set(existingLogs.map(l => `${l.targetId}_${l.timestamp.getTime()}_${l.textContent}`));

      for (const row of data) {
        if (!row.targetNumber) continue;
        let tId = targetMap.get(row.targetNumber);
        if (!tId) {
          tId = randomUUID();
          await db.insert(sigStoryTargets).values({ id: tId, providerId, storyId: row.targetNumber, targetName: row.targetName || row.targetNumber, isTextOnly: false, createdAt: new Date() });
          targetMap.set(row.targetNumber, tId);
        }

        const timestamp = row.date && row.time ? new Date(`${row.date} ${row.time}`) : new Date();
        const hash = `${tId}_${timestamp.getTime()}_${row.content || ''}`;
        if (!logSet.has(hash)) {
          await db.insert(sigStoryLogs).values({
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
