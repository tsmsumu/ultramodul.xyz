import { NextResponse } from "next/server";
import { db } from "@ultra/db";
import { wagLogs, waStatusLogs, waStatusTargets, wagTargets } from "@ultra/db/src/schema";
import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { type, providerId, senderNumber, senderName, textContent, mediaUrl, mediaType, timestamp, groupId } = payload;

    if (type === 'wag') {
      // Find Target ID
      const target = await db.select().from(wagTargets).where(
        and(eq(wagTargets.providerId, providerId), eq(wagTargets.groupId, groupId))
      ).limit(1);

      if (target.length > 0) {
        await db.insert(wagLogs).values({
          id: randomUUID(),
          providerId,
          targetId: target[0].id,
          senderNumber,
          senderName,
          textContent,
          mediaUrl,
          mediaType,
          timestamp: new Date(timestamp)
        });
      }
    } else if (type === 'status') {
      // Find Target ID
      const target = await db.select().from(waStatusTargets).where(
        and(eq(waStatusTargets.providerId, providerId), eq(waStatusTargets.phoneNumber, senderNumber))
      ).limit(1);

      if (target.length > 0) {
        await db.insert(waStatusLogs).values({
          id: randomUUID(),
          providerId,
          targetId: target[0].id,
          textContent,
          mediaUrl,
          mediaType,
          timestamp: new Date(timestamp)
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("WA Monitor Webhook Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
