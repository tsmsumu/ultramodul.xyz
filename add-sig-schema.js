const fs = require('fs');
let c = fs.readFileSync('packages/db/src/schema.ts', 'utf8');

const newSchema = `

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
`;

fs.writeFileSync('packages/db/src/schema.ts', c + newSchema, 'utf8');
