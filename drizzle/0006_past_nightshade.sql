CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`recovery_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_username_unique` ON `accounts` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_player_unique` ON `accounts` (`player_id`);--> statement-breakpoint
CREATE TABLE `auth_rate_limits` (
	`bucket` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `auth_rate_expiry` ON `auth_rate_limits` (`expires_at`);--> statement-breakpoint
ALTER TABLE `players` ADD `session_expires_at` integer DEFAULT 0 NOT NULL;