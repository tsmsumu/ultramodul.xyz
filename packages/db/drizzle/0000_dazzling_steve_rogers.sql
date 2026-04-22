CREATE TABLE `access_matrix` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`module_name` text NOT NULL,
	`permissions` text DEFAULT '[]' NOT NULL,
	`time_rule` text DEFAULT '24/7' NOT NULL,
	`granted_by` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `api_endpoints` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`path_slug` text NOT NULL,
	`method` text DEFAULT 'GET' NOT NULL,
	`type` text DEFAULT 'INBOUND' NOT NULL,
	`routing_type` text DEFAULT 'AUTOMATIC' NOT NULL,
	`target_url` text,
	`handler_name` text,
	`is_active` integer DEFAULT true NOT NULL,
	`require_auth` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`app_name` text NOT NULL,
	`token_hash` text NOT NULL,
	`owner_id` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`allowed_origins` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `api_traffic_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`endpoint_id` text,
	`request_path` text NOT NULL,
	`request_method` text NOT NULL,
	`request_payload` text,
	`response_status` integer NOT NULL,
	`latency_ms` integer NOT NULL,
	`ip_address` text,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`actor_id` text NOT NULL,
	`target` text,
	`metadata` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exchange_rates` (
	`id` text PRIMARY KEY NOT NULL,
	`pair` text NOT NULL,
	`rate` real NOT NULL,
	`is_auto` integer DEFAULT true NOT NULL,
	`last_updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mandates` (
	`id` text PRIMARY KEY NOT NULL,
	`delegator_id` text NOT NULL,
	`delegatee_id` text NOT NULL,
	`task_description` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`valid_until` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `matrix_approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`target_user_id` text NOT NULL,
	`module_name` text NOT NULL,
	`proposed_permissions` text NOT NULL,
	`proposed_time_rule` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`maker_id` text NOT NULL,
	`checker_id` text,
	`created_at` integer NOT NULL,
	`resolved_at` integer
);
--> statement-breakpoint
CREATE TABLE `nexus_blueprints` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sql_query` text NOT NULL,
	`source_metadata` text,
	`schema_snapshot` text,
	`author_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `omni_dictionaries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`target_column` text NOT NULL,
	`mapping_data` text NOT NULL,
	`is_global` integer DEFAULT true NOT NULL,
	`author_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `passkeys` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`credential_id` text NOT NULL,
	`public_key` text NOT NULL,
	`counter` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pengaduan_publik` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`topic` text NOT NULL,
	`content` text NOT NULL,
	`channel_source` text DEFAULT 'WEB_PORTAL' NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`admin_note` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `role_matrix` (
	`id` text PRIMARY KEY NOT NULL,
	`role_name` text NOT NULL,
	`module_name` text NOT NULL,
	`permissions` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `system_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` integer NOT NULL,
	`module` text NOT NULL,
	`action_data` text,
	`user_id` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`severity` text NOT NULL,
	`crypto_hash` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `time_machine_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`author_id` text,
	`note` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`branch_code` text DEFAULT 'PUSAT' NOT NULL,
	`emergency_bypass` integer DEFAULT false NOT NULL,
	`emergency_until` integer,
	`layout_template` text DEFAULT 'sidebar' NOT NULL,
	`color_skin` text DEFAULT 'default' NOT NULL,
	`password_hash` text,
	`mfa_enrolled` integer DEFAULT false NOT NULL,
	`mfa_secret` text,
	`phone_number` text,
	`email` text,
	`public_uuid` text,
	`languages` text DEFAULT '["id"]' NOT NULL,
	`currencies` text DEFAULT '["USD"]' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_endpoints_path_slug_unique` ON `api_endpoints` (`path_slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_token_hash_unique` ON `api_keys` (`token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `exchange_rates_pair_unique` ON `exchange_rates` (`pair`);--> statement-breakpoint
CREATE UNIQUE INDEX `nexus_blueprints_name_unique` ON `nexus_blueprints` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `omni_dictionaries_name_unique` ON `omni_dictionaries` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);