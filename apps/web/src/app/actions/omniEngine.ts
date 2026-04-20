"use server";

// @ts-ignore
import pg from 'pg';
// @ts-ignore
import mysql from 'mysql2/promise';
// @ts-ignore
import sql from 'mssql';

// Fallback Logger
import { createAuditLog } from "@ultra/db/src/logger";

function sanitizeRows(rows: any[]) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const obj: Record<string, any> = {};
    for (const key of Object.keys(row)) {
      let val = row[key];
      if (typeof val === 'bigint') {
        val = Number(val);
      } else if (val instanceof ArrayBuffer || val instanceof Buffer || (val && val.buffer && val.buffer instanceof ArrayBuffer)) {
        val = Buffer.from(val).toString('base64');
      }
      obj[key] = val;
    }
    return obj;
  });
}

export async function executeOmniDBQuery(config: any, query: string) {
  try {
    // SECURITY: Limit to SELECT only to prevent destructive operations from UI
    if (!query.toLowerCase().trim().startsWith("select")) {
      return { success: false, error: "Only SELECT queries are allowed for safety.", data: [] };
    }

    let rows: any[] = [];

    // DIALECT: POSTGRESQL
    if (config.engine === 'postgresql') {
      const client = new pg.Client({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
        ssl: false
      });
      await client.connect();
      const res = await client.query(query);
      rows = res.rows;
      await client.end();
    }
    
    // DIALECT: MYSQL
    else if (config.engine === 'mysql') {
      const connection = await mysql.createConnection({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password
      });
      const [results] = await connection.execute(query);
      rows = results as any[];
      await connection.end();
    }

    // DIALECT: MSSQL
    else if (config.engine === 'mssql') {
      const pool = new sql.ConnectionPool({
        user: config.user,
        password: config.password,
        database: config.database,
        server: config.host,
        port: config.port,
        options: {
          encrypt: true, // Recommended for Azure, sometimes needed for modern SQL Server
          trustServerCertificate: true // Always true for generic testing against unknown servers
        }
      });
      await pool.connect();
      const res = await pool.query(query);
      rows = res.recordset;
      await pool.close();
    }
    
    else {
      throw new Error(`Engine ${config.engine} is not yet supported by OmniEngine.`);
    }

    // Sanitize rows to bypass Next.js Server Action serialization bugs (BigInt/Blobs)
    const plainRows = sanitizeRows(rows);

    // Audit Log for Security
    await createAuditLog({
      action: "OMNI_ENGINE_EXECUTE",
      actorId: "SYSTEM_ROOT", // TODO: Auth layer
      target: `${config.engine.toUpperCase()}_${config.host}`,
      metadata: { query, database: config.database } // Passwords never logged
    });

    return { success: true, data: plainRows };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to execute query", data: [] };
  }
}
