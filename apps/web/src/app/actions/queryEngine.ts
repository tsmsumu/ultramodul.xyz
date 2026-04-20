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

    // LibSQL named columns may not be enumerable in Object.keys()
    // We strictly use result.columns to extract values from the row proxy.
    const columns = result.columns;
    const plainRows = result.rows.map((row: any) => {
      const obj: Record<string, any> = {};
      columns.forEach((col: string) => {
         let val = row[col];
         // Aman dari pelahap NextJS Server Action dan JSON.stringify!
         if (typeof val === 'bigint') {
           val = Number(val); // Turunkan kasta BigInt ke Number (aman untuk timestamp)
         } else if (val instanceof ArrayBuffer || val instanceof Buffer || (val && val.buffer && val.buffer instanceof ArrayBuffer)) {
           // Jika LibSQL menganggap sesuatu sbg Blob, jadikan String!
           val = Buffer.from(val).toString('base64');
         }
         obj[col] = val;
      });
      return obj;
    });

    return { success: true, data: plainRows };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to execute query", data: [] };
  }
}
