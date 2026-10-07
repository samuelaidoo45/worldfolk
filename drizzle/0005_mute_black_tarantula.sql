CREATE TABLE `voice_sessions` (
	`player_id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`last_seen` integer NOT NULL,
	`last_signal` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `voice_signals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_session` text NOT NULL,
	`to_session` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `voice_signals_recipient` ON `voice_signals` (`to_session`,`id`);--> statement-breakpoint
CREATE INDEX `voice_signals_expiry` ON `voice_signals` (`created_at`);