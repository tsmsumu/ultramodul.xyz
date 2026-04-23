import { NextResponse } from "next/server";
import { db } from "@ultra/db";
import { wagLogs, waStatusLogs, waStatusTargets, wagTargets, waChatTargets, waChatLogs } from "@ultra/db/src/schema";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const messages = payload.messages;
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    console.log(`[BULK WEBHOOK] Received ${messages.length} messages for auto-discovery.`);

    // Local Cache to avoid redundant DB queries
    const chatTargetsCache = new Map<string, string>(); // peerNumber -> targetId
    const wagTargetsCache = new Map<string, string>(); // groupId -> targetId
    const statusTargetsCache = new Map<string, string>(); // senderNumber -> targetId

    // Arrays for Bulk Insert
    const chatLogsToInsert = [];
    const wagLogsToInsert = [];
    const statusLogsToInsert = [];

    for (const msg of messages) {
      const { type, providerId, senderNumber, senderName, textContent, mediaUrl, mediaType, timestamp, groupId, isFromMe, peerNumber } = msg;

      if (type === 'chat') {
        let targetId = chatTargetsCache.get(peerNumber);
        
        if (!targetId) {
          const target = await db.select().from(waChatTargets).where(
            and(eq(waChatTargets.providerId, providerId), eq(waChatTargets.phoneNumber, peerNumber))
          ).limit(1);

          if (target.length > 0) {
            targetId = target[0].id;
          } else {
            // Auto-Discovery: Create Target
            targetId = randomUUID();
            await db.insert(waChatTargets).values({
              id: targetId,
              providerId,
              phoneNumber: peerNumber,
              targetName: senderName || `[Auto] ${peerNumber}`,
              notes: 'Auto-Discovered via History Sync',
              createdAt: new Date()
            });
            console.log(`[AUTO-DISCOVERY] Created Chat Target: ${peerNumber}`);
          }
          chatTargetsCache.set(peerNumber, targetId);
        }

        chatLogsToInsert.push({
          id: randomUUID(),
          providerId,
          targetId,
          isFromMe,
          senderNumber,
          textContent,
          mediaUrl,
          mediaType,
          timestamp: new Date(timestamp)
        });

      } else if (type === 'wag') {
        let targetId = wagTargetsCache.get(groupId);

        if (!targetId) {
          const target = await db.select().from(wagTargets).where(
            and(eq(wagTargets.providerId, providerId), eq(wagTargets.groupId, groupId))
          ).limit(1);

          if (target.length > 0) {
            targetId = target[0].id;
          } else {
            // Auto-Discovery: Create Target
            targetId = randomUUID();
            await db.insert(wagTargets).values({
              id: targetId,
              providerId,
              groupId,
              groupName: senderName || `[Auto] Group ${groupId}`,
              notes: 'Auto-Discovered via History Sync',
              createdAt: new Date()
            });
            console.log(`[AUTO-DISCOVERY] Created WAG Target: ${groupId}`);
          }
          wagTargetsCache.set(groupId, targetId);
        }

        wagLogsToInsert.push({
          id: randomUUID(),
          providerId,
          targetId,
          senderNumber,
          senderName,
          textContent,
          mediaUrl,
          mediaType,
          timestamp: new Date(timestamp)
        });

      } else if (type === 'status') {
        let targetId = statusTargetsCache.get(senderNumber);

        if (!targetId) {
          const target = await db.select().from(waStatusTargets).where(
            and(eq(waStatusTargets.providerId, providerId), eq(waStatusTargets.phoneNumber, senderNumber))
          ).limit(1);

          if (target.length > 0) {
            targetId = target[0].id;
          } else {
            // Auto-Discovery: Create Target
            targetId = randomUUID();
            await db.insert(waStatusTargets).values({
              id: targetId,
              providerId,
              phoneNumber: senderNumber,
              targetName: senderName || `[Auto] Status ${senderNumber}`,
              notes: 'Auto-Discovered via History Sync',
              createdAt: new Date()
            });
            console.log(`[AUTO-DISCOVERY] Created Status Target: ${senderNumber}`);
          }
          statusTargetsCache.set(senderNumber, targetId);
        }

        statusLogsToInsert.push({
          id: randomUUID(),
          providerId,
          targetId,
          textContent,
          mediaUrl,
          mediaType,
          timestamp: new Date(timestamp)
        });
      }
    }

    // Execute Bulk Inserts (SQLite chunking might be needed for thousands, but usually ~1000 is fine)
    const CHUNK_SIZE = 500;
    
    for (let i = 0; i < chatLogsToInsert.length; i += CHUNK_SIZE) {
      await db.insert(waChatLogs).values(chatLogsToInsert.slice(i, i + CHUNK_SIZE));
    }
    
    for (let i = 0; i < wagLogsToInsert.length; i += CHUNK_SIZE) {
      await db.insert(wagLogs).values(wagLogsToInsert.slice(i, i + CHUNK_SIZE));
    }
    
    for (let i = 0; i < statusLogsToInsert.length; i += CHUNK_SIZE) {
      await db.insert(waStatusLogs).values(statusLogsToInsert.slice(i, i + CHUNK_SIZE));
    }

    return NextResponse.json({ success: true, count: messages.length });
  } catch (error) {
    console.error("WA Bulk Monitor Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
