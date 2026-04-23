import { NextResponse } from "next/server";
import { db } from "@ultra/db";
import { wagLogs, waStatusLogs, waStatusTargets, wagTargets, waChatTargets, waChatLogs } from "@ultra/db/src/schema";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { type, providerId, senderNumber, senderName, textContent, mediaUrl, mediaType, timestamp, groupId } = payload;

    if (type === 'wag') {
      let targetId;
      const target = await db.select().from(wagTargets).where(
        and(eq(wagTargets.providerId, providerId), eq(wagTargets.groupId, groupId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        // Auto-Discovery
        targetId = randomUUID();
        await db.insert(wagTargets).values({
          id: targetId,
          providerId,
          groupId,
          groupName: senderName || `[Auto] Group ${groupId}`,
          notes: 'Auto-Discovered via Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(wagLogs).values({
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
      let targetId;
      const target = await db.select().from(waStatusTargets).where(
        and(eq(waStatusTargets.providerId, providerId), eq(waStatusTargets.phoneNumber, senderNumber))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(waStatusTargets).values({
          id: targetId,
          providerId,
          phoneNumber: senderNumber,
          targetName: senderName || `[Auto] Status ${senderNumber}`,
          notes: 'Auto-Discovered via Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(waStatusLogs).values({
        id: randomUUID(),
        providerId,
        targetId,
        textContent,
        mediaUrl,
        mediaType,
        timestamp: new Date(timestamp)
      });
    } else if (type === 'chat') {
      const { isFromMe, peerNumber } = payload;
      let targetId;
      const target = await db.select().from(waChatTargets).where(
        and(eq(waChatTargets.providerId, providerId), eq(waChatTargets.phoneNumber, peerNumber))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(waChatTargets).values({
          id: targetId,
          providerId,
          phoneNumber: peerNumber,
          targetName: senderName || `[Auto] Chat ${peerNumber}`,
          notes: 'Auto-Discovered via Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(waChatLogs).values({
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WA Monitor Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
