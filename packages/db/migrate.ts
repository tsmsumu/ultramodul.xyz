import { createClient } from '@libsql/client';
import path from 'path';

// Fix relative path for db
const dbPath = path.resolve(__dirname, 'local.db');
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

  console.log("Migration complete.");
}
migrate().catch(console.error);
