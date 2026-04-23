"use server";

import { db } from "@ultra/db";
import { wagTargets, waStatusTargets, mcProviders, wagLogs, waStatusLogs } from "@ultra/db/src/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function addWagTarget(providerId: string, groupId: string, groupName: string) {
  try {
    await db.insert(wagTargets).values({
      id: randomUUID(),
      providerId,
      groupId,
      groupName,
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

export async function addStatusTarget(providerId: string, phoneNumber: string, targetName: string) {
  try {
    let clean = phoneNumber.replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);

    await db.insert(waStatusTargets).values({
      id: randomUUID(),
      providerId,
      phoneNumber: clean,
      targetName,
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

export async function getMonitorTargets(providerId: string) {
  const wag = await db.select().from(wagTargets).where(eq(wagTargets.providerId, providerId));
  const status = await db.select().from(waStatusTargets).where(eq(waStatusTargets.providerId, providerId));
  return { wag, status };
}

export async function getWagLogs(providerId: string) {
  return await db.select().from(wagLogs).where(eq(wagLogs.providerId, providerId)).orderBy(desc(wagLogs.timestamp));
}

export async function getStatusLogs(providerId: string) {
  return await db.select().from(waStatusLogs).where(eq(waStatusLogs.providerId, providerId)).orderBy(desc(waStatusLogs.timestamp));
}

export async function syncMonitorTargetsToEngine(providerId: string) {
  try {
    const { wag, status } = await getMonitorTargets(providerId);
    
    // Map to simple array of identifiers for the engine
    const wagTargetsList = wag.map(w => w.groupId);
    const statusTargetsList = status.map(s => s.phoneNumber);

    await fetch(`http://127.0.0.1:3001/config/${providerId}`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        wagTargets: wagTargetsList,
        statusTargets: statusTargetsList
      })
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to sync targets to engine", error);
    return { success: false };
  }
}
