ALTER TABLE `wa_chat_targets` ADD `is_text_only` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `wa_status_targets` ADD `is_text_only` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `wag_targets` ADD `is_text_only` integer DEFAULT false NOT NULL;