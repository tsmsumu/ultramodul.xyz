"use server";

import { db, sqliteClient } from "@ultra/db";
import { sql } from "@ultra/db";
import { createAuditLog } from "@ultra/db/src/logger";

export async function executeRawNexusQuery(query: string) {
  try {
    // SECURITY: Limit to SELECT only to prevent destructive operations from UI
    if (!query.toLowerCase().trim().startsWith("select")) {
      return { success: false, error: "Only SELECT queries are allowed for safety.", data: [] };
    }

    // Execute raw SQL directly via LibSQL Client to get unmapped rows
    const result = await sqliteClient.execute(query);
    
    
    // Log audit
    await createAuditLog({
      action: "NEXUS_EXECUTE_SQL",
      actorId: "SYSTEM_ROOT", // To be replaced with real user context in production auth
      target: "SQLITE",
      metadata: { query }
    });

    // LibSQL rows are custom classes containing both index and keys. 
    // Next.js Server Actions STRIP custom classes! We MUST convert it to a pristine JSON Array of Objects!
    const plainRows = result.rows.map((row: any) => {
      const obj: Record<string, any> = {};
      for (const k of Object.keys(row)) {
        if (isNaN(Number(k))) { // Only take column names, ignore numeric indices
          obj[k] = row[k];
        }
      }
      return obj;
    });

    return { success: true, data: plainRows };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to execute query", data: [] };
  }
}
