CREATE TABLE `sms_chat_logs` (
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
	FOREIGN KEY (`target_id`) REFERENCES `sms_chat_targets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sms_chat_targets` (
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
CREATE TABLE `sms_group_logs` (
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
	FOREIGN KEY (`target_id`) REFERENCES `sms_group_targets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sms_group_targets` (
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
CREATE TABLE `sms_story_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`target_id` text NOT NULL,
	`text_content` text,
	`media_url` text,
	`media_type` text,
	`is_archived` integer DEFAULT false NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `sms_story_targets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sms_story_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`story_id` text NOT NULL,
	`target_name` text NOT NULL,
	`notes` text,
	`is_text_only` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
