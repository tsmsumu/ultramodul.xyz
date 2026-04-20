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

export const accessMatrix = sqliteTable('access_matrix', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // Relates to users.id
  moduleName: text('module_name').notNull(), // e.g. "KEUANGAN", "PEGAWAI"
  permissionLevel: text('permission_level').notNull().default('READ'), // READ, WRITE, ADMIN
  grantedBy: text('granted_by').notNull(), // The Admin who granted this
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const mandates = sqliteTable('mandates', {
  id: text('id').primaryKey(),
  delegatorId: text('delegator_id').notNull(), // Yang memberi mandat
  delegateeId: text('delegatee_id').notNull(), // Yang menerima mandat
  taskDescription: text('task_description').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, ACTIVE, REJECTED, REVOKED, EXPIRED
  validUntil: integer('valid_until', { mode: 'timestamp' }), // Tanggal Kadaluarsa
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});
