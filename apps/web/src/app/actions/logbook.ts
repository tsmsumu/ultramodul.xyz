"use server";

import { db, auditLogs, users } from "@ultra/db";
import { desc } from "@ultra/db";

export async function getAuditLogs() {
  try {
    // Membaca Log dari Drizzle, membalik urutan (yang terbaru di atas)
    const rawLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
    const allUsers = await db.select().from(users);

    return rawLogs.map(log => {
      // Mengawinkan nama aktor yang sesungguhnya (Bukan sekadar ID mesin)
      const actorInfo = log.actorId === "SYSTEM" 
        ? "SYSTEM (Auto)" 
        : allUsers.find(u => u.id === log.actorId)?.name || log.actorId;

      return {
        ...log,
        actorName: actorInfo,
      };
    });
  } catch (error) {
    console.error("Failed fetching Audit Logs", error);
    return [];
  }
}
