import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').unique().notNull(), // Universal SSO ID / Business Identity Code
  name: text('name').notNull(),
  role: text('role').notNull().default('user'),
  status: text('status').notNull().default('active'),
  branchCode: text('branch_code').notNull().default('PUSAT'), // Gamma Pillar
  emergencyBypass: integer('emergency_bypass', { mode: 'boolean' }).notNull().default(false), // JIT Pillar
  emergencyUntil: integer('emergency_until', { mode: 'timestamp' }), // Waktu Expired Dewa Sementara
  layoutTemplate: text('layout_template').notNull().default('sidebar'),
  colorSkin: text('color_skin').notNull().default('default'),
  passwordHash: text('password_hash'), // Legacy Password/Temporary Login Fallback
  
  // Future-Proofing: Multi-Factor Auth (MFA) Gateway
  mfaEnrolled: integer('mfa_enrolled', { mode: 'boolean' }).notNull().default(false),
  mfaSecret: text('mfa_secret'),
  
  // Future-Proofing: Multi-Channel Gateway (WA/SMS/Email)
  phoneNumber: text('phone_number'),
  email: text('email'),
  
  // Future-Proofing: API Exchange
  publicUuid: text('public_uuid'), // UUID alias for hiding NIK in API responses

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
export const matrixApprovals = sqliteTable("matrix_approvals", {
  id: text("id").primaryKey(), // UUID
  targetUserId: text("target_user_id").notNull(),
  moduleName: text("module_name").notNull(),
  proposedPermissions: text("proposed_permissions").notNull(), // JSON string e.g. '["VIEW", "MODIFY"]'
  proposedTimeRule: text("proposed_time_rule"), // e.g. '24/7'
  status: text("status", { enum: ['PENDING', 'APPROVED', 'REJECTED'] }).default('PENDING').notNull(),
  makerId: text("maker_id").notNull(), // User UUID yang merequest
  checkerId: text("checker_id"), // User UUID yang memverifikasi
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  resolvedAt: integer('resolved_at', { mode: 'timestamp' }),
});

export const timeMachineNotes = sqliteTable("time_machine_notes", {
  id: text("id").primaryKey(), // Menggunakan Hash Git Commit (UUID eksternal)
  authorId: text("author_id"), // Pembuat catatan (opsional/otomatis)
  note: text("note").notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
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

// Nexus Engine Virtual Datasets (Publish Hub)
export const nexusBlueprints = sqliteTable('nexus_blueprints', {
  id: text('id').primaryKey(),
  name: text('name').unique().notNull(), // e.g. 'Dataset_Gabungan_Penduduk_Miskin'
  description: text('description'),
  sqlQuery: text('sql_query').notNull(), // Raw SQL recipe
  sourceMetadata: text('source_metadata'), // JSON Array of Parquet links or DB refs
  schemaSnapshot: text('schema_snapshot'), // JSON Object of final column schemas
  authorId: text('author_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// Member Public Facing Feature
export const pengaduanPublik = sqliteTable('pengaduan_publik', {
  id: text('id').primaryKey(), // UUID laporan
  reporterId: text('reporter_id').notNull(), // Mengikat aduan ke ID Universal (Bukan anonim)
  topic: text('topic').notNull(), // Kategori laporan (Infrastruktur, Pelayanan, dll)
  content: text('content').notNull(), // Isi detail pengaduan
  channelSource: text('channel_source').notNull().default('WEB_PORTAL'), // Future-proof: WEB_PORTAL, WHATSAPP_API, TELEGRAM
  status: text('status').notNull().default('OPEN'), // OPEN, IN_PROGRESS, RESOLVED, REJECTED
  adminNote: text('admin_note'), // Tanggapan petugas (Verval)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// Future-Proofing: API Exchange Hub
export const apiKeys = sqliteTable('api_keys', {
  id: text('id').primaryKey(),
  appName: text('app_name').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  ownerId: text('owner_id').notNull(), // Relates to users.id
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, REVOKED
  allowedOrigins: text('allowed_origins'), // JSON array of allowed domains for CORS
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});

// Omni-Codex (Universal Rosetta Stone Dictionary)
export const omniDictionaries = sqliteTable('omni_dictionaries', {
  id: text('id').primaryKey(), // UUID
  name: text('name').unique().notNull(), // e.g. "Kamus Master Wilayah BPS 2024"
  description: text('description'),
  targetColumn: text('target_column').notNull(), // Kolom target utama (e.g. "kode_kabupaten", "jenis_lantai")
  mappingData: text('mapping_data').notNull(), // JSON Array dari Obyek: [{ code: '3201', label: 'Kab. Bogor' }]
  isGlobal: integer('is_global', { mode: 'boolean' }).notNull().default(true), // Tersedia untuk semua user?
  authorId: text('author_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});
