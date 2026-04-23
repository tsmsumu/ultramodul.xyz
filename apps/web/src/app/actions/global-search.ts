"use server";

import { db } from "@ultra/db";
import { waChatLogs, waWagLogs, waStatusLogs, waChatTargets, waWagTargets, waStatusTargets } from "@ultra/db/schema";
import { like, or, desc, eq } from "drizzle-orm";

export async function globalSearchLogs(query: string) {
  if (!query || query.length < 3) return [];

  const searchPattern = `%${query}%`;

  // 1. Search Chat Logs
  const chats = await db.select({
    id: waChatLogs.id,
    timestamp: waChatLogs.timestamp,
    textContent: waChatLogs.textContent,
    mediaUrl: waChatLogs.mediaUrl,
    type: waChatLogs.id, // placeholder
    targetId: waChatLogs.targetId,
    senderName: waChatLogs.peerNumber, // using peerNumber as fallback
  })
  .from(waChatLogs)
  .where(like(waChatLogs.textContent, searchPattern))
  .orderBy(desc(waChatLogs.timestamp))
  .limit(20);

  // Get Target Names for chats
  const chatResults = await Promise.all(chats.map(async (c) => {
    const t = await db.query.waChatTargets.findFirst({ where: eq(waChatTargets.id, c.targetId) });
    return { ...c, type: 'chat', sourceName: t?.targetName || t?.phoneNumber || 'Unknown' };
  }));

  // 2. Search WAG Logs
  const wags = await db.select({
    id: waWagLogs.id,
    timestamp: waWagLogs.timestamp,
    textContent: waWagLogs.textContent,
    mediaUrl: waWagLogs.mediaUrl,
    type: waWagLogs.id,
    targetId: waWagLogs.targetId,
    senderName: waWagLogs.senderName,
  })
  .from(waWagLogs)
  .where(like(waWagLogs.textContent, searchPattern))
  .orderBy(desc(waWagLogs.timestamp))
  .limit(20);

  const wagResults = await Promise.all(wags.map(async (w) => {
    const t = await db.query.waWagTargets.findFirst({ where: eq(waWagTargets.id, w.targetId) });
    return { ...w, type: 'wag', sourceName: t?.groupName || t?.groupId || 'Unknown Group' };
  }));

  // 3. Search Status Logs
  const statuses = await db.select({
    id: waStatusLogs.id,
    timestamp: waStatusLogs.timestamp,
    textContent: waStatusLogs.textContent,
    mediaUrl: waStatusLogs.mediaUrl,
    type: waStatusLogs.id,
    targetId: waStatusLogs.targetId,
    senderName: waStatusLogs.id, // placeholder
  })
  .from(waStatusLogs)
  .where(like(waStatusLogs.textContent, searchPattern))
  .orderBy(desc(waStatusLogs.timestamp))
  .limit(20);

  const statusResults = await Promise.all(statuses.map(async (s) => {
    const t = await db.query.waStatusTargets.findFirst({ where: eq(waStatusTargets.id, s.targetId) });
    return { ...s, type: 'status', sourceName: t?.targetName || t?.phoneNumber || 'Unknown Status', senderName: t?.targetName };
  }));

  // Combine and sort
  const combined = [...chatResults, ...wagResults, ...statusResults]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50);

  return combined;
}
