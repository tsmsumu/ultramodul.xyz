import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// For local edge/hybrid SQLite
export const sqliteClient = createClient({
  url: process.env.NODE_ENV === 'production' 
    ? 'file:/var/www/ultramodul/production.db' 
    : process.env.DATABASE_URL || 'file:local.db',
});

export const db = drizzle(sqliteClient, { schema });

// Export everything else
export * from './schema';
export * from 'drizzle-orm';
