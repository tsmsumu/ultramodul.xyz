import { NextResponse } from "next/server";
import { db } from "@ultra/db";
import { 
  tgChatLogs, tgChatTargets, 
  tgGroupLogs, tgGroupTargets, 
  tgChannelLogs, tgChannelTargets 
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
      const target = await db.select().from(tgGroupTargets).where(
        and(eq(tgGroupTargets.providerId, providerId), eq(tgGroupTargets.groupId, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(tgGroupTargets).values({
          id: targetId,
          providerId,
          groupId: chatId,
          groupName: chatName || `[Auto] Group ${chatId}`,
          notes: 'Auto-Discovered via Telegram Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(tgGroupLogs).values({
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
      const target = await db.select().from(tgChannelTargets).where(
        and(eq(tgChannelTargets.providerId, providerId), eq(tgChannelTargets.channelId, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(tgChannelTargets).values({
          id: targetId,
          providerId,
          channelId: chatId,
          targetName: chatName || `[Auto] Channel ${chatId}`,
          notes: 'Auto-Discovered via Telegram Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(tgChannelLogs).values({
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
      const target = await db.select().from(tgChatTargets).where(
        and(eq(tgChatTargets.providerId, providerId), eq(tgChatTargets.phoneNumber, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(tgChatTargets).values({
          id: targetId,
          providerId,
          phoneNumber: chatId,
          targetName: chatName || `[Auto] Chat ${chatId}`,
          notes: 'Auto-Discovered via Telegram Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(tgChatLogs).values({
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
    console.error("Telegram Monitor Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
