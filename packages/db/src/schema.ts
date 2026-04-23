import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

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
  publicUuid: text('public_uuid'), // UUID alias for hiding UID in API responses

  // Language Preferences (Rosetta Protocol) - Array of language codes like ["id", "en"]
  languages: text('languages').notNull().default('["id"]'),

  // Currency Preferences (Multi Currency Protocol) - Array of currency codes like ["USD", "IDR"]
  currencies: text('currencies').notNull().default('["USD"]'),

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
  userId: text("user_id").notNull(),         // UID / ID Pelaku
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
  topic: text('topic').notNull(), // Kategori laporan (Operasional, Insiden, dll)
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
  name: text('name').unique().notNull(), // e.g. "Universal Metadata Global Dictionary"
  description: text('description'),
  targetColumn: text('target_column').notNull(), // Kolom target utama (e.g. "kode_area", "jenis_sistem")
  mappingData: text('mapping_data').notNull(), // JSON Array dari Obyek: [{ code: 'SYS-01', label: 'Main Subsystem A' }]
  isGlobal: integer('is_global', { mode: 'boolean' }).notNull().default(true), // Tersedia untuk semua user?
  authorId: text('author_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

// Global Exchange Rate Engine
export const exchangeRates = sqliteTable('exchange_rates', {
  id: text('id').primaryKey(),
  pair: text('pair').unique().notNull(), // e.g., "USD_IDR"
  rate: real('rate').notNull(), // SQLite REAL for float
  isAuto: integer('is_auto', { mode: 'boolean' }).notNull().default(true),
  lastUpdated: integer('last_updated', { mode: 'timestamp' }).notNull()
});

// --- API EXCHANGE (Matrix Routing) ---
export const apiEndpoints = sqliteTable('api_endpoints', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g., "Dukcapil NIK Check"
  description: text('description'),
  pathSlug: text('path_slug').unique().notNull(), // e.g., "v1/dukcapil/nik" (without leading slash)
  method: text('method').notNull().default('GET'), // GET, POST, PUT, DELETE, PATCH, ALL
  type: text('type').notNull().default('INBOUND'), // INBOUND, OUTBOUND
  routingType: text('routing_type').notNull().default('AUTOMATIC'), // AUTOMATIC, MANUAL
  targetUrl: text('target_url'), // Used if AUTOMATIC
  handlerName: text('handler_name'), // Used if MANUAL (e.g. "customDukcapilLogic")
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  requireAuth: integer('require_auth', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const apiTrafficLogs = sqliteTable('api_traffic_logs', {
  id: text('id').primaryKey(),
  endpointId: text('endpoint_id'), // Relates to apiEndpoints.id (optional if path not found)
  requestPath: text('request_path').notNull(),
  requestMethod: text('request_method').notNull(),
  requestPayload: text('request_payload'), // Masked payload
  responseStatus: integer('response_status').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  ipAddress: text('ip_address'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull()
});

// --- AUTH / MFA GATEWAY MATRIX ---
export const authGatewayMatrix = sqliteTable('auth_gateway_matrix', {
  id: text('id').primaryKey(), // UUID
  type: text('type').notNull(), // 'SSO', 'MESSAGING', 'E_SIGNATURE'
  provider: text('provider').notNull().unique(), // 'google', 'whatsapp', 'docusign'
  name: text('name').notNull(), // 'Google Workspace SSO'
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  configPayload: text('config_payload').notNull().default('{}'), // JSON Encrypted/Secret Payload
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Table for Global Dynamic System Settings
export const systemSettings = sqliteTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// --- MULTI-CHANNEL GATEWAY ---
export const mcProviders = sqliteTable('mc_providers', {
  id: text('id').primaryKey(), // UUID
  providerType: text('provider_type').notNull(), // 'whatsapp', 'telegram', 'signal', 'sms', 'email'
  name: text('name').notNull(), // e.g. "WhatsApp Official Gateway"
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  configPayload: text('config_payload').notNull().default('{}'), // JSON for webhook, api key
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const mcMappings = sqliteTable('mc_mappings', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  channelIdentifier: text('channel_identifier').notNull(), // e.g. Phone Number, Chat ID, Email
  ultraPin: text('ultra_pin').notNull(), // Security PIN for specific channel actions
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const mcSessions = sqliteTable('mc_sessions', {
  id: text('id').primaryKey(), // UUID
  mappingId: text('mapping_id').notNull().references(() => mcMappings.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').notNull().unique(), // Secure token for the live session
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  status: text('status').notNull().default('active'), // 'active', 'terminated'
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
  lastActive: integer('last_active', { mode: 'timestamp' }).notNull(),
});

export const mcLogs = sqliteTable('mc_logs', {
  id: text('id').primaryKey(), // UUID
  sessionId: text('session_id').references(() => mcSessions.id, { onDelete: 'set null' }),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'MESSAGE_SENT', 'MESSAGE_RECEIVED', 'AUTH_CHALLENGE'
  metadata: text('metadata').notNull().default('{}'), // Message payload or result
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

// --- WA INTELLIGENCE MONITOR ---
export const waStatusTargets = sqliteTable('wa_status_targets', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  phoneNumber: text('phone_number').notNull(),
  targetName: text('target_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const waStatusLogs = sqliteTable('wa_status_logs', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => waStatusTargets.id, { onDelete: 'cascade' }),
  textContent: text('text_content'),
  mediaUrl: text('media_url'), // Local path to downloaded media
  mediaType: text('media_type'), // 'image', 'video'
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const wagTargets = sqliteTable('wag_targets', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  groupId: text('group_id').notNull(), // WhatsApp Group JID
  groupName: text('group_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const wagLogs = sqliteTable('wag_logs', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => wagTargets.id, { onDelete: 'cascade' }),
  senderNumber: text('sender_number').notNull(),
  senderName: text('sender_name'),
  textContent: text('text_content'),
  mediaUrl: text('media_url'), // Local path to downloaded media
  mediaType: text('media_type'), // 'image', 'video'
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const waChatTargets = sqliteTable('wa_chat_targets', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  phoneNumber: text('phone_number').notNull(),
  targetName: text('target_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const waChatLogs = sqliteTable('wa_chat_logs', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => waChatTargets.id, { onDelete: 'cascade' }),
  isFromMe: integer('is_from_me', { mode: 'boolean' }).notNull().default(false), // True if sent by the Node
  senderNumber: text('sender_number').notNull(), // Actual sender (target or node)
  textContent: text('text_content'),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

// --- TELEGRAM INTELLIGENCE MONITOR ---
export const tgChannelTargets = sqliteTable('tg_channel_targets', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  channelId: text('channel_id').notNull(), // Channel username or ID
  targetName: text('target_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const tgChannelLogs = sqliteTable('tg_channel_logs', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => tgChannelTargets.id, { onDelete: 'cascade' }),
  textContent: text('text_content'),
  mediaUrl: text('media_url'), // Local path to downloaded media
  mediaType: text('media_type'), // 'image', 'video'
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const tgGroupTargets = sqliteTable('tg_group_targets', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  groupId: text('group_id').notNull(), // Telegram Group ID
  groupName: text('group_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const tgGroupLogs = sqliteTable('tg_group_logs', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => tgGroupTargets.id, { onDelete: 'cascade' }),
  senderNumber: text('sender_number').notNull(), // Can be username or ID
  senderName: text('sender_name'),
  textContent: text('text_content'),
  mediaUrl: text('media_url'), // Local path to downloaded media
  mediaType: text('media_type'), // 'image', 'video'
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const tgChatTargets = sqliteTable('tg_chat_targets', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  phoneNumber: text('phone_number').notNull(), // Can be username or ID
  targetName: text('target_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const tgChatLogs = sqliteTable('tg_chat_logs', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => tgChatTargets.id, { onDelete: 'cascade' }),
  isFromMe: integer('is_from_me', { mode: 'boolean' }).notNull().default(false), // True if sent by the Node
  senderNumber: text('sender_number').notNull(), // Actual sender (target or node)
  textContent: text('text_content'),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});


// --- ADVANCED LOGBOOK AUTOMATION ---
export const logbookSchedules = sqliteTable('logbook_schedules', {
  id: text('id').primaryKey(), // UUID
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  logType: text('log_type').notNull(), // 'chat', 'wag', 'status'
  interval: text('interval').notNull(), // 'hourly', 'daily', 'weekly', 'monthly', 'yearly'
  format: text('format').notNull(), // 'pdf', 'xlsx', 'docx', 'csv', 'json', 'parquet', 'html', 'txt'
  destinationType: text('destination_type').notNull(), // 'email', 'whatsapp', 'telegram', 'signal', 'sms'
  destinationAddress: text('destination_address').notNull(), // email address or phone number
  includeMedia: integer('include_media', { mode: 'boolean' }).notNull().default(false), // True if includes Image/Video
  lastSentAt: integer('last_sent_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});


// --- SIGNAL INTELLIGENCE MONITOR ---
export const sigStoryTargets = sqliteTable('sig_story_targets', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  storyId: text('story_id').notNull(),
  targetName: text('target_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const sigStoryLogs = sqliteTable('sig_story_logs', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => sigStoryTargets.id, { onDelete: 'cascade' }),
  textContent: text('text_content'),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const sigGroupTargets = sqliteTable('sig_group_targets', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  groupId: text('group_id').notNull(),
  groupName: text('group_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const sigGroupLogs = sqliteTable('sig_group_logs', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => sigGroupTargets.id, { onDelete: 'cascade' }),
  senderNumber: text('sender_number').notNull(),
  senderName: text('sender_name'),
  textContent: text('text_content'),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const sigChatTargets = sqliteTable('sig_chat_targets', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  phoneNumber: text('phone_number').notNull(),
  targetName: text('target_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const sigChatLogs = sqliteTable('sig_chat_logs', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => sigChatTargets.id, { onDelete: 'cascade' }),
  isFromMe: integer('is_from_me', { mode: 'boolean' }).notNull().default(false),
  senderNumber: text('sender_number').notNull(),
  textContent: text('text_content'),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});


// --- SMS INTELLIGENCE MONITOR ---
export const smsStoryTargets = sqliteTable('sms_story_targets', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  storyId: text('story_id').notNull(),
  targetName: text('target_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const smsStoryLogs = sqliteTable('sms_story_logs', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => smsStoryTargets.id, { onDelete: 'cascade' }),
  textContent: text('text_content'),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const smsGroupTargets = sqliteTable('sms_group_targets', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  groupId: text('group_id').notNull(),
  groupName: text('group_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const smsGroupLogs = sqliteTable('sms_group_logs', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => smsGroupTargets.id, { onDelete: 'cascade' }),
  senderNumber: text('sender_number').notNull(),
  senderName: text('sender_name'),
  textContent: text('text_content'),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const smsChatTargets = sqliteTable('sms_chat_targets', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  phoneNumber: text('phone_number').notNull(),
  targetName: text('target_name').notNull(),
  notes: text('notes'),
  isTextOnly: integer('is_text_only', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const smsChatLogs = sqliteTable('sms_chat_logs', {
  id: text('id').primaryKey(),
  providerId: text('provider_id').notNull().references(() => mcProviders.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => smsChatTargets.id, { onDelete: 'cascade' }),
  isFromMe: integer('is_from_me', { mode: 'boolean' }).notNull().default(false),
  senderNumber: text('sender_number').notNull(),
  textContent: text('text_content'),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});
