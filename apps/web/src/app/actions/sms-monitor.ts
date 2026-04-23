"use server";

import { db } from "@ultra/db";
import { smsGroupTargets, smsStoryTargets, smsChatTargets, mcProviders, smsGroupLogs, smsStoryLogs, smsChatLogs, logbookSchedules } from "@ultra/db/src/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function addGroupTarget(providerId: string, groupId: string, groupName: string, isTextOnly: boolean = false) {
  try {
    await db.insert(smsGroupTargets).values({
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
    await db.delete(smsGroupTargets).where(eq(smsGroupTargets.id, targetId));
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

    await db.insert(smsStoryTargets).values({
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
    await db.delete(smsStoryTargets).where(eq(smsStoryTargets.id, targetId));
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

    await db.insert(smsChatTargets).values({
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
    await db.delete(smsChatTargets).where(eq(smsChatTargets.id, targetId));
    await syncMonitorTargetsToEngine(providerId);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getMonitorTargets(providerId: string) {
  const smsGroup = await db.select().from(smsGroupTargets).where(eq(smsGroupTargets.providerId, providerId));
  const story = await db.select().from(smsStoryTargets).where(eq(smsStoryTargets.providerId, providerId));
  const chat = await db.select().from(smsChatTargets).where(eq(smsChatTargets.providerId, providerId));
  return { smsGroup, story, chat };
}

export async function getGroupLogs(providerId: string) {
  return await db.select().from(smsGroupLogs).where(eq(smsGroupLogs.providerId, providerId)).orderBy(desc(smsGroupLogs.timestamp));
}

export async function getStoryLogs(providerId: string) {
  return await db.select().from(smsStoryLogs).where(eq(smsStoryLogs.providerId, providerId)).orderBy(desc(smsStoryLogs.timestamp));
}

export async function getChatLogs(providerId: string) {
  return await db.select().from(smsChatLogs).where(eq(smsChatLogs.providerId, providerId)).orderBy(desc(smsChatLogs.timestamp));
}

export async function syncMonitorTargetsToEngine(providerId: string) {
  try {
    const { smsGroup, story, chat } = await getMonitorTargets(providerId);
    
    // Map to array of objects with id and textOnly flag
    const smsGroupTargetsList = smsGroup.map(w => ({ id: w.groupId, textOnly: w.isTextOnly }));
    const storyTargetsList = story.map(s => ({ id: s.storyId, textOnly: s.isTextOnly }));
    const chatTargetsList = chat.map(c => ({ id: c.phoneNumber, textOnly: c.isTextOnly }));

    await fetch(`http://127.0.0.1:3003/config/${providerId}`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        smsGroupTargets: smsGroupTargetsList,
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

export async function bulkDeleteLogs(logType: 'chat' | 'smsGroup' | 'story', ids: string[]) {
  try {
    if (ids.length === 0) return { success: true };
    const table = logType === 'chat' ? smsChatLogs : logType === 'smsGroup' ? smsGroupLogs : smsStoryLogs;
    await db.delete(table).where(inArray(table.id, ids));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function bulkArchiveLogs(logType: 'chat' | 'smsGroup' | 'story', ids: string[], archive: boolean = true) {
  try {
    if (ids.length === 0) return { success: true };
    const table = logType === 'chat' ? smsChatLogs : logType === 'smsGroup' ? smsGroupLogs : smsStoryLogs;
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

export async function bulkDeleteTargets(type: 'chat' | 'smsGroup' | 'story', targetIds: string[]) {
  try {
    if (targetIds.length === 0) return { success: true };
    if (type === 'chat') {
      await db.delete(smsChatLogs).where(inArray(smsChatLogs.targetId, targetIds));
      await db.delete(smsChatTargets).where(inArray(smsChatTargets.id, targetIds));
    } else if (type === 'smsGroup') {
      await db.delete(smsGroupLogs).where(inArray(smsGroupLogs.targetId, targetIds));
      await db.delete(smsGroupTargets).where(inArray(smsGroupTargets.id, targetIds));
    } else if (type === 'story') {
      await db.delete(smsStoryLogs).where(inArray(smsStoryLogs.targetId, targetIds));
      await db.delete(smsStoryTargets).where(inArray(smsStoryTargets.id, targetIds));
    }
    return { success: true };
  } catch (error) {
    console.error(`Failed to bulk delete ${type} targets`, error);
    return { success: false };
  }
}

export async function importLogbookData(providerId: string, logType: 'chat' | 'smsGroup' | 'story', data: any[]) {
  try {
    if (data.length === 0) return { success: true, imported: 0 };
    let importedCount = 0;

    if (logType === 'chat') {
      const existingTargets = await db.select().from(smsChatTargets).where(eq(smsChatTargets.providerId, providerId));
      const targetMap = new Map(existingTargets.map(t => [t.phoneNumber, t.id]));
      
      const existingLogs = await db.select().from(smsChatLogs).where(eq(smsChatLogs.providerId, providerId));
      const logSet = new Set(existingLogs.map(l => `${l.targetId}_${l.timestamp.getTime()}_${l.textContent}`));

      for (const row of data) {
        if (!row.peerNumber) continue;
        let tId = targetMap.get(row.peerNumber);
        if (!tId) {
          tId = randomUUID();
          await db.insert(smsChatTargets).values({ id: tId, providerId, phoneNumber: row.peerNumber, targetName: row.peerName || row.peerNumber, isTextOnly: false, createdAt: new Date() });
          targetMap.set(row.peerNumber, tId);
        }

        const timestamp = row.date && row.time ? new Date(`${row.date} ${row.time}`) : new Date();
        const hash = `${tId}_${timestamp.getTime()}_${row.content || ''}`;
        if (!logSet.has(hash)) {
          await db.insert(smsChatLogs).values({
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
    } else if (logType === 'smsGroup') {
      const existingTargets = await db.select().from(smsGroupTargets).where(eq(smsGroupTargets.providerId, providerId));
      const targetMap = new Map(existingTargets.map(t => [t.groupId, t.id]));
      
      const existingLogs = await db.select().from(smsGroupLogs).where(eq(smsGroupLogs.providerId, providerId));
      const logSet = new Set(existingLogs.map(l => `${l.targetId}_${l.timestamp.getTime()}_${l.textContent}`));

      for (const row of data) {
        if (!row.groupJid) continue;
        let tId = targetMap.get(row.groupJid);
        if (!tId) {
          tId = randomUUID();
          await db.insert(smsGroupTargets).values({ id: tId, providerId, groupId: row.groupJid, groupName: row.groupName || row.groupJid, isTextOnly: false, createdAt: new Date() });
          targetMap.set(row.groupJid, tId);
        }

        const timestamp = row.date && row.time ? new Date(`${row.date} ${row.time}`) : new Date();
        const hash = `${tId}_${timestamp.getTime()}_${row.content || ''}`;
        if (!logSet.has(hash)) {
          await db.insert(smsGroupLogs).values({
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
      const existingTargets = await db.select().from(smsStoryTargets).where(eq(smsStoryTargets.providerId, providerId));
      const targetMap = new Map(existingTargets.map(t => [t.storyId, t.id]));
      
      const existingLogs = await db.select().from(smsStoryLogs).where(eq(smsStoryLogs.providerId, providerId));
      const logSet = new Set(existingLogs.map(l => `${l.targetId}_${l.timestamp.getTime()}_${l.textContent}`));

      for (const row of data) {
        if (!row.targetNumber) continue;
        let tId = targetMap.get(row.targetNumber);
        if (!tId) {
          tId = randomUUID();
          await db.insert(smsStoryTargets).values({ id: tId, providerId, storyId: row.targetNumber, targetName: row.targetName || row.targetNumber, isTextOnly: false, createdAt: new Date() });
          targetMap.set(row.targetNumber, tId);
        }

        const timestamp = row.date && row.time ? new Date(`${row.date} ${row.time}`) : new Date();
        const hash = `${tId}_${timestamp.getTime()}_${row.content || ''}`;
        if (!logSet.has(hash)) {
          await db.insert(smsStoryLogs).values({
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
