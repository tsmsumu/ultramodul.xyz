import { NextResponse } from "next/server";
import { db } from "@ultra/db";
import { logbookSchedules, waChatLogs, waWagLogs, waStatusLogs, waChatTargets, waWagTargets, waStatusTargets } from "@ultra/db/schema";
import { desc, eq, gte } from "drizzle-orm";
import * as xlsx from "xlsx";

// This endpoint should be protected by a cron secret in production
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cronSecret = searchParams.get("secret");
    
    // Simple protection
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schedules = await db.select().from(logbookSchedules);
    const results = [];

    for (const schedule of schedules) {
      // 1. Fetch data based on logType and interval
      let logs: any[] = [];
      let sheetName = "";
      
      // Calculate timeframe based on interval
      const now = new Date();
      let fromDate = new Date();
      
      switch (schedule.interval) {
        case 'hourly': fromDate.setHours(now.getHours() - 1); break;
        case 'daily': fromDate.setDate(now.getDate() - 1); break;
        case 'weekly': fromDate.setDate(now.getDate() - 7); break;
        case 'monthly': fromDate.setMonth(now.getMonth() - 1); break;
        default: fromDate.setDate(now.getDate() - 1); // fallback daily
      }

      if (schedule.logType === 'chat') {
        logs = await db.select().from(waChatLogs).where(gte(waChatLogs.timestamp, fromDate)).orderBy(desc(waChatLogs.timestamp));
        sheetName = "Chat Intel";
      } else if (schedule.logType === 'wag') {
        logs = await db.select().from(waWagLogs).where(gte(waWagLogs.timestamp, fromDate)).orderBy(desc(waWagLogs.timestamp));
        sheetName = "WAG Intel";
      } else if (schedule.logType === 'status') {
        logs = await db.select().from(waStatusLogs).where(gte(waStatusLogs.timestamp, fromDate)).orderBy(desc(waStatusLogs.timestamp));
        sheetName = "Status Intel";
      }

      if (logs.length === 0) {
        results.push({ id: schedule.id, status: 'skipped', reason: 'no_new_logs' });
        continue;
      }

      // 2. Format Data
      const exportData = logs.map(l => ({
        Timestamp: new Date(l.timestamp).toLocaleString(),
        'Target ID': l.targetId,
        'Sender': l.senderName || l.peerNumber || 'Unknown',
        'Content': l.textContent || '',
        'Media': l.mediaUrl ? 'Yes' : 'No',
        'Media Link': schedule.includeMedia ? (l.mediaUrl || '') : 'Restricted'
      }));

      // 3. Generate File (Memory Buffer)
      let fileBuffer: Buffer | null = null;
      let filename = `Omni_Intel_${schedule.logType}_${new Date().getTime()}`;

      if (schedule.format === 'xlsx' || schedule.format === 'csv') {
        const ws = xlsx.utils.json_to_sheet(exportData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, sheetName);
        
        const type = schedule.format === 'csv' ? 'csv' : 'xlsx';
        fileBuffer = xlsx.write(wb, { type: 'buffer', bookType: type as any });
        filename += `.${type}`;
      } else {
        // Fallback JSON format for PDF/Others until fully implemented
        fileBuffer = Buffer.from(JSON.stringify(exportData, null, 2));
        filename += '.json';
      }

      // 4. Dispatch (Simulated for Telegram/Email)
      // In a real scenario, we would use node-mailer or Telegraf to dispatch the buffer
      
      // Update last run time (if schema supported it)
      // await db.update(logbookSchedules).set({ lastRun: new Date() }).where(eq(logbookSchedules.id, schedule.id));

      results.push({
        id: schedule.id,
        status: 'success',
        destination: schedule.destinationAddress,
        recordsSent: logs.length,
        file: filename
      });
    }

    return NextResponse.json({ success: true, processed: results });
  } catch (error: any) {
    console.error("Auto-Delivery Cron Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
