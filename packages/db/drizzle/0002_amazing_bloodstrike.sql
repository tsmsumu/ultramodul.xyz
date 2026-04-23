CREATE TABLE `wa_chat_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`target_id` text NOT NULL,
	`is_from_me` integer DEFAULT false NOT NULL,
	`sender_number` text NOT NULL,
	`text_content` text,
	`media_url` text,
	`media_type` text,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_id`) REFERENCES `wa_chat_targets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `wa_chat_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`provider_id` text NOT NULL,
	`phone_number` text NOT NULL,
	`target_name` text NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `mc_providers`(`id`) ON UPDATE no action ON DELETE cascade
);
