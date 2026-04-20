"use server";

import { db, auditLogs } from "@ultra/db";
import { desc, asc, and, ilike, gte, lte, or, sql } from "@ultra/db";

export async function getRealLogs(options: { 
  searchQuery?: string, 
  startDate?: string, 
  endDate?: string,
  limit?: number
}) {
  try {
    let conditions = [];

    if (options.searchQuery) {
       const term = `%${options.searchQuery}%`;
       conditions.push(
         or(
           ilike(auditLogs.action, term),
           ilike(auditLogs.actorId, term),
           ilike(auditLogs.target, term),
           sql`CAST(${auditLogs.metadata} AS TEXT) ILIKE ${term}`
         )
       );
    }

    if (options.startDate) {
       conditions.push(gte(auditLogs.createdAt, new Date(options.startDate)));
    }
    
    if (options.endDate) {
       conditions.push(lte(auditLogs.createdAt, new Date(options.endDate)));
    }

    const maxLimit = options.limit || 500; // Hard max for sanity

    const query = conditions.length > 0
       ? db.select().from(auditLogs).where(and(...conditions)).orderBy(desc(auditLogs.createdAt)).limit(maxLimit)
       : db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(maxLimit);

    return await query;
  } catch (error) {
    console.error("Failed to sequence panopticon logs", error);
    return [];
  }
}
