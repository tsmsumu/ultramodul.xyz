import { createClient } from '@libsql/client';
import path from 'path';

// Fix relative path for db
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/var/www/ultramodul/production.db'
  : path.resolve(__dirname, 'local.db');
const db = createClient({ url: `file:${dbPath}` });

async function migrate() {
  try {
    await db.execute(`ALTER TABLE users ADD COLUMN currencies TEXT NOT NULL DEFAULT '["USD"]'`);
    console.log("Added currencies column.");
  } catch (e: any) {
    if (e.message && e.message.includes('duplicate column name')) {
      console.log("Column currencies already exists.");
    } else {
      console.error(e);
    }
  }

  try {
    await db.execute(`CREATE TABLE exchange_rates (id TEXT PRIMARY KEY, pair TEXT UNIQUE NOT NULL, rate REAL NOT NULL, is_auto INTEGER NOT NULL DEFAULT 1, last_updated INTEGER NOT NULL)`);
    console.log("Created exchange_rates table.");
  } catch (e: any) {
    if (e.message && e.message.includes('table exchange_rates already exists')) {
      console.log("Table exchange_rates already exists.");
    } else {
      console.error(e);
    }
  }

  try {
    await db.execute(`CREATE TABLE api_endpoints (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, path_slug TEXT UNIQUE NOT NULL, method TEXT NOT NULL DEFAULT 'GET', type TEXT NOT NULL DEFAULT 'INBOUND', routing_type TEXT NOT NULL DEFAULT 'AUTOMATIC', target_url TEXT, handler_name TEXT, is_active INTEGER NOT NULL DEFAULT 1, require_auth INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
    console.log("Created api_endpoints table.");
  } catch (e: any) {
    if (e.message && e.message.includes('table api_endpoints already exists')) {
      console.log("Table api_endpoints already exists.");
    } else {
      console.error(e);
    }
  }

  try {
    await db.execute(`CREATE TABLE api_traffic_logs (id TEXT PRIMARY KEY, endpoint_id TEXT, request_path TEXT NOT NULL, request_method TEXT NOT NULL, request_payload TEXT, response_status INTEGER NOT NULL, latency_ms INTEGER NOT NULL, ip_address TEXT, timestamp INTEGER NOT NULL)`);
    console.log("Created api_traffic_logs table.");
  } catch (e: any) {
    if (e.message && e.message.includes('table api_traffic_logs already exists')) {
      console.log("Table api_traffic_logs already exists.");
    } else {
      console.error(e);
    }
  }

  try {
    await db.execute(`CREATE TABLE auth_gateway_matrix (id TEXT PRIMARY KEY, type TEXT NOT NULL, provider TEXT NOT NULL UNIQUE, name TEXT NOT NULL, is_active INTEGER NOT NULL DEFAULT 0, config_payload TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
    console.log("Created auth_gateway_matrix table.");
  } catch (e: any) {
    if (e.message && e.message.includes('table auth_gateway_matrix already exists')) {
      console.log("Table auth_gateway_matrix already exists.");
    } else {
      console.error(e);
    }
  }

  console.log("Migration complete.");
}
migrate().catch(console.error);
