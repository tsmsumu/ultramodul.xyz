import { NextResponse } from "next/server";
import { db } from "@ultra/db";
import { logbookSchedules, waChatLogs, waStatusLogs, wagLogs, mcProviders } from "@ultra/db/src/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    // Note: In production, verify authorization header for CRON jobs
    
    // Fetch all schedules
    const schedules = await db.select().from(logbookSchedules);
    if (schedules.length === 0) {
      return NextResponse.json({ success: true, message: "No schedules found." });
    }

    const results = [];

    for (const schedule of schedules) {
      // Very basic logic: we just simulate processing here and send a summary message if WA
      if (schedule.destinationType === 'whatsapp') {
        const provider = await db.select().from(mcProviders).where(eq(mcProviders.id, schedule.providerId)).limit(1);
        if (provider.length === 0) continue;

        let totalLogs = 0;
        let summaryText = `*Omni Intelligence Logbook Report*\n\n`;
        summaryText += `Log Type: ${schedule.logType.toUpperCase()}\n`;
        summaryText += `Interval: ${schedule.interval}\n`;
        summaryText += `Format: ${schedule.format.toUpperCase()}\n\n`;

        if (schedule.logType === 'chat') {
          const logs = await db.select().from(waChatLogs).where(eq(waChatLogs.providerId, schedule.providerId));
          totalLogs = logs.length;
        } else if (schedule.logType === 'wag') {
          const logs = await db.select().from(wagLogs).where(eq(wagLogs.providerId, schedule.providerId));
          totalLogs = logs.length;
        } else if (schedule.logType === 'status') {
          const logs = await db.select().from(waStatusLogs).where(eq(waStatusLogs.providerId, schedule.providerId));
          totalLogs = logs.length;
        }

        summaryText += `Total Records Found: ${totalLogs}\n\n`;
        summaryText += `_Note: Full ${schedule.format.toUpperCase()} export is available in the web dashboard._`;

        // Send to wa-engine
        try {
          const res = await fetch(`http://localhost:3001/send/${schedule.providerId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: schedule.destinationAddress,
              message: summaryText
            })
          });
          const result = await res.json();
          results.push({ scheduleId: schedule.id, status: 'sent', result });
        } catch (e) {
          results.push({ scheduleId: schedule.id, status: 'error', error: String(e) });
        }
      } else {
        // Mock email, tg, signal, etc.
        results.push({ scheduleId: schedule.id, status: 'skipped', reason: `Delivery for ${schedule.destinationType} not fully implemented in mock.` });
      }
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
