"use server";

import { db } from "@ultra/db";
import { sql } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";

export async function executeRawNexusQuery(query: string) {
  try {
    // SECURITY: Limit to SELECT only to prevent destructive operations from UI
    if (!query.toLowerCase().trim().startsWith("select")) {
      return { success: false, error: "Only SELECT queries are allowed for safety.", data: [] };
    }

    // Execute raw SQL
    const result = await db.all(sql.raw(query));
    
    // Log audit
    await createAuditLog({
      action: "NEXUS_EXECUTE_SQL",
      actorId: "SYSTEM_ROOT", // To be replaced with real user context in production auth
      target: "SQLITE",
      metadata: { query }
    });

    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to execute query", data: [] };
  }
}
