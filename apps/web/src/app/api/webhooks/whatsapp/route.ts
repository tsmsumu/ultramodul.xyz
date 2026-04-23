import { NextResponse } from "next/server";
import { db } from "@ultra/db";
import { mcLogs, mcProviders } from "@ultra/db/src/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { remoteJid, pushName, textMessage, timestamp } = body;

    // Find the WhatsApp provider in our DB
    const waProvider = await db.select().from(mcProviders).where(eq(mcProviders.providerType, 'whatsapp')).limit(1);
    
    if (waProvider.length > 0) {
      // Record this message in the Forensik Log
      await db.insert(mcLogs).values({
        id: randomUUID(),
        providerId: waProvider[0].id,
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
