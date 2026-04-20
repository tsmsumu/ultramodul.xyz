import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  nik: text('nik').unique().notNull(), // As requested in past projects
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  status: text('status').notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(), // e.g. "USER_LOGIN", "CREATE_MANDATE"
  actorId: text('actor_id').notNull(),
  target: text('target'), // Optional affected entity
  metadata: text('metadata'), // JSON str for raw data
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
