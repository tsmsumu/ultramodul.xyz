import { NextResponse } from "next/server";
import { db } from "@ultra/db";
import { 
  emailChatLogs, emailChatTargets, 
  emailGroupLogs, emailGroupTargets, 
  emailStoryLogs, emailStoryTargets 
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
      const target = await db.select().from(emailGroupTargets).where(
        and(eq(emailGroupTargets.providerId, providerId), eq(emailGroupTargets.groupId, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(emailGroupTargets).values({
          id: targetId,
          providerId,
          groupId: chatId,
          groupName: chatName || `[Auto] Group ${chatId}`,
          notes: 'Auto-Discovered via Email Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(emailGroupLogs).values({
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
      const target = await db.select().from(emailStoryTargets).where(
        and(eq(emailStoryTargets.providerId, providerId), eq(emailStoryTargets.storyId, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(emailStoryTargets).values({
          id: targetId,
          providerId,
          storyId: chatId,
          targetName: chatName || `[Auto] Channel ${chatId}`,
          notes: 'Auto-Discovered via Email Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(emailStoryLogs).values({
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
      const target = await db.select().from(emailChatTargets).where(
        and(eq(emailChatTargets.providerId, providerId), eq(emailChatTargets.phoneNumber, chatId))
      ).limit(1);

      if (target.length > 0) {
        targetId = target[0].id;
      } else {
        targetId = randomUUID();
        await db.insert(emailChatTargets).values({
          id: targetId,
          providerId,
          phoneNumber: chatId,
          targetName: chatName || `[Auto] Chat ${chatId}`,
          notes: 'Auto-Discovered via Email Live Sync',
          createdAt: new Date()
        });
      }

      await db.insert(emailChatLogs).values({
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
    console.error("Email Monitor Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
