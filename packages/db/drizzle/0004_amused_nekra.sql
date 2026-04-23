CREATE TABLE `logbook_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`log_type` text NOT NULL,
	`interval` text NOT NULL,
	`format` text NOT NULL,
	`destination_type` text NOT NULL,
	`destination_address` text NOT NULL,
	`include_media` integer DEFAULT false NOT NULL,
	`last_sent_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tg_channel_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`target_id` text NOT NULL,
	`text_content` text,
	`media_url` text,
	`media_type` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `tg_channel_targets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tg_channel_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`channel_id` text NOT NULL,
	`target_name` text NOT NULL,
	`notes` text,
	`is_text_only` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tg_chat_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`target_id` text NOT NULL,
	`is_from_me` integer DEFAULT false NOT NULL,
	`sender_number` text NOT NULL,
	`text_content` text,
	`media_url` text,
	`media_type` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `tg_chat_targets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tg_chat_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`phone_number` text NOT NULL,
	`target_name` text NOT NULL,
	`notes` text,
	`is_text_only` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tg_group_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`target_id` text NOT NULL,
	`sender_number` text NOT NULL,
	`sender_name` text,
	`text_content` text,
	`media_url` text,
	`media_type` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `tg_group_targets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tg_group_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`group_id` text NOT NULL,
	`group_name` text NOT NULL,
	`notes` text,
	`is_text_only` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `mc_providers` ADD `is_archived` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `wa_chat_logs` ADD `is_archived` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `wa_status_logs` ADD `is_archived` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `wag_logs` ADD `is_archived` integer DEFAULT false NOT NULL;