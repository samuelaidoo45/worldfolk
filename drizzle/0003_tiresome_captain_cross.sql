CREATE TABLE `property_invites` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`code_hash` text NOT NULL,
	`guest_id` text,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `players` ADD `session_token` text;--> statement-breakpoint
ALTER TABLE `players` ADD `life_json` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `revision` integer DEFAULT 0 NOT NULL;