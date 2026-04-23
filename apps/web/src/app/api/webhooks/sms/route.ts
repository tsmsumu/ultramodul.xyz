import { NextResponse } from "next/server";
import { db } from "@ultra/db";
import { 
  smsChatLogs, smsChatTargets, 
  smsGroupLogs, smsGroupTargets, 
  smsStoryLogs, smsStoryTargets 
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
      const target = await db.select().from(smsGroupTargets).where(
        and(eq(smsGroupTargets.providerId, providerId), eq(smsGroupTargets.groupId, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(smsGroupTargets).values({
          id: targetId,
          providerId,
          groupId: chatId,
          groupName: chatName || `[Auto] Group ${chatId}`,
          notes: 'Auto-Discovered via SMS Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(smsGroupLogs).values({
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
      const target = await db.select().from(smsStoryTargets).where(
        and(eq(smsStoryTargets.providerId, providerId), eq(smsStoryTargets.storyId, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(smsStoryTargets).values({
          id: targetId,
          providerId,
          storyId: chatId,
          targetName: chatName || `[Auto] Channel ${chatId}`,
          notes: 'Auto-Discovered via SMS Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(smsStoryLogs).values({
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
      const target = await db.select().from(smsChatTargets).where(
        and(eq(smsChatTargets.providerId, providerId), eq(smsChatTargets.phoneNumber, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(smsChatTargets).values({
          id: targetId,
          providerId,
          phoneNumber: chatId,
          targetName: chatName || `[Auto] Chat ${chatId}`,
          notes: 'Auto-Discovered via SMS Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(smsChatLogs).values({
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
    console.error("SMS Monitor Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
