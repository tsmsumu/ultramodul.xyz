import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  nik: text('nik').unique().notNull(), // As requested in past projects
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  status: text('status').notNull().default('active'),
  branchCode: text('branch_code').notNull().default('PUSAT'), // Gamma Pillar
  emergencyBypass: integer('emergency_bypass', { mode: 'boolean' }).notNull().default(false), // JIT Pillar
  emergencyUntil: integer('emergency_until', { mode: 'timestamp' }), // Waktu Expired Dewa Sementara
  layoutTemplate: text('layout_template').notNull().default('sidebar'),
  colorSkin: text('color_skin').notNull().default('default'),
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
  permissions: text('permissions').notNull().default('[]'), // JSON Array: ["VIEW", "MODIFY", "PRINT", "EXPORT", "UPLOAD"]
  timeRule: text('time_rule').notNull().default('24/7'), // "24/7" atau "WORK_HOURS"
  grantedBy: text('granted_by').notNull(), // The Admin who granted this
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// Alpha Pillar: Maker-Checker System
export const matrixApprovals = sqliteTable('matrix_approvals', {
  id: text('id').primaryKey(),
  targetUserId: text('target_user_id').notNull(),
  moduleName: text('module_name').notNull(),
  proposedPermissions: text('proposed_permissions').notNull(),
  proposedTimeRule: text('proposed_time_rule').notNull().default('24/7'),
  status: text('status').notNull().default('PENDING'), // PENDING, APPROVED, REJECTED
  makerId: text('maker_id').notNull(), // Admin yang mengusulkan
  checkerId: text('checker_id'), // Admin yang menyetujui
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' })
});

export const systemLogs = sqliteTable("system_logs", {
  id: text("id").primaryKey(),
  timestamp: integer("timestamp").notNull(), // Waktu persis kejadian
  module: text("module").notNull(),          // Modul asal: IAM, TAILOR, AUTH, SYSTEM
  actionData: text("action_data"),           // Bentuk JSON kejadian (Matrix, SQL, dll)
  userId: text("user_id").notNull(),         // NIK / ID Pelaku
  ipAddress: text("ip_address"),             // Koordinat IP Address Perekam
  userAgent: text("user_agent"),             // Browser Perekam
  severity: text("severity").notNull(),      // INFO, WARNING, CRITICAL, FATAL
  cryptoHash: text("crypto_hash").notNull()  // Kriptografi SHA-256 Rantai Abadi
});

// Biometric Pillar (WebAuthn / Passkeys)
export const passkeys = sqliteTable('passkeys', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  credentialId: text('credential_id').notNull(),
  publicKey: text('public_key').notNull(),
  counter: integer('counter').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const roleMatrix = sqliteTable('role_matrix', {
  id: text('id').primaryKey(),
  roleName: text('role_name').notNull(), // 'admin', 'user', 'viewer'
  moduleName: text('module_name').notNull(), // e.g. "Keuangan", "IAM Console"
  permissions: text('permissions').notNull().default('[]'), // JSON Array default per module
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
