import { NextResponse } from "next/server";
import { db } from "@ultra/db";
import { 
  sigChatLogs, sigChatTargets, 
  sigGroupLogs, sigGroupTargets, 
  sigStoryLogs, sigStoryTargets 
} from "@ultra/db/src/schema";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { 
      providerId, type, 
      senderNumber, senderName, 
      chatId, chatName, 
      textMessage, mediaType, mediaUrl, 
      timestamp, isFromMe 
    } = payload;

    if (type === 'group') {
      let targetId;
      const target = await db.select().from(sigGroupTargets).where(
        and(eq(sigGroupTargets.providerId, providerId), eq(sigGroupTargets.groupId, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(sigGroupTargets).values({
          id: targetId,
          providerId,
          groupId: chatId,
          groupName: chatName || `[Auto] Group ${chatId}`,
          notes: 'Auto-Discovered via Signal Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(sigGroupLogs).values({
        id: randomUUID(),
        providerId,
        targetId,
        senderNumber: senderNumber || 'Unknown',
        senderName: senderName || 'Unknown',
        textContent: textMessage,
        mediaUrl,
        mediaType,
        timestamp: new Date(timestamp)
      });
    } else if (type === 'channel') {
      let targetId;
      const target = await db.select().from(sigStoryTargets).where(
        and(eq(sigStoryTargets.providerId, providerId), eq(sigStoryTargets.storyId, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(sigStoryTargets).values({
          id: targetId,
          providerId,
          storyId: chatId,
          targetName: chatName || `[Auto] Channel ${chatId}`,
          notes: 'Auto-Discovered via Signal Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(sigStoryLogs).values({
        id: randomUUID(),
        providerId,
        targetId,
        textContent: textMessage,
        mediaUrl,
        mediaType,
        timestamp: new Date(timestamp)
      });
    } else if (type === 'chat') {
      let targetId;
      const target = await db.select().from(sigChatTargets).where(
        and(eq(sigChatTargets.providerId, providerId), eq(sigChatTargets.phoneNumber, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(sigChatTargets).values({
          id: targetId,
          providerId,
          phoneNumber: chatId,
          targetName: chatName || `[Auto] Chat ${chatId}`,
          notes: 'Auto-Discovered via Signal Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(sigChatLogs).values({
        id: randomUUID(),
        providerId,
        targetId,
        isFromMe: isFromMe || false,
        senderNumber: senderNumber || 'Unknown',
        textContent: textMessage,
        mediaUrl,
        mediaType,
        timestamp: new Date(timestamp)
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Signal Monitor Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
