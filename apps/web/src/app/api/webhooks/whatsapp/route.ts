import { NextResponse } from "next/server";
import { db } from "@ultra/db";
import { mcLogs } from "@ultra/db/src/schema";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { providerId, remoteJid, pushName, textMessage, timestamp } = body;

    if (providerId) {
      await db.insert(mcLogs).values({
        id: randomUUID(),
        providerId: providerId,
        action: 'MESSAGE_RECEIVED',
        metadata: `From: ${pushName} (${remoteJid}) | Msg: ${textMessage}`,
        timestamp: new Date(timestamp || Date.now())
      });
    }

    return NextResponse.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
