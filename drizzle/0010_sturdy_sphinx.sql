CREATE TABLE `ad_campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`brand` text NOT NULL,
	`headline` text NOT NULL,
	`detail` text NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`color` text NOT NULL,
	`audience` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ads_live` ON `ad_campaigns` (`status`,`expires_at`);--> statement-breakpoint
CREATE INDEX `ads_owner` ON `ad_campaigns` (`player_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `ad_reports` (
	`campaign_id` text NOT NULL,
	`player_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `ad_campaigns`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ad_report_unique` ON `ad_reports` (`campaign_id`,`player_id`);--> statement-breakpoint
CREATE TABLE `player_profiles` (
	`player_id` text PRIMARY KEY NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`social_json` text DEFAULT '{}' NOT NULL,
	`photo_key` text,
	`updated_at` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
