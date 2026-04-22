const db = require('@libsql/client').createClient({ url: 'file:production.db' });

async function migrate() {
  await db.execute(`ALTER TABLE users ADD COLUMN currencies TEXT NOT NULL DEFAULT '["USD"]'`);
  await db.execute(`CREATE TABLE exchange_rates (id TEXT PRIMARY KEY, pair TEXT UNIQUE NOT NULL, rate REAL NOT NULL, is_auto INTEGER NOT NULL DEFAULT 1, last_updated INTEGER NOT NULL)`);
  console.log("Migration complete.");
}
migrate().catch(console.error);
