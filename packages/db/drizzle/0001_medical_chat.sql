CREATE TABLE `auth_gateway_matrix` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`config_payload` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mc_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`provider_id` text NOT NULL,
	`action` text NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `mc_sessions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mc_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`channel_identifier` text NOT NULL,
	`ultra_pin` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mc_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_type` text NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`config_payload` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mc_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`mapping_id` text NOT NULL,
	`session_token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` integer NOT NULL,
	`last_active` integer NOT NULL,
	FOREIGN KEY (`mapping_id`) REFERENCES `mc_mappings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wa_status_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`target_id` text NOT NULL,
	`text_content` text,
	`media_url` text,
	`media_type` text,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `wa_status_targets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `wa_status_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`phone_number` text NOT NULL,
	`target_name` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `wag_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`target_id` text NOT NULL,
	`sender_number` text NOT NULL,
	`sender_name` text,
	`text_content` text,
	`media_url` text,
	`media_type` text,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `wag_targets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `wag_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`group_id` text NOT NULL,
	`group_name` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_gateway_matrix_provider_unique` ON `auth_gateway_matrix` (`provider`);--> statement-breakpoint
CREATE UNIQUE INDEX `mc_sessions_session_token_unique` ON `mc_sessions` (`session_token`);