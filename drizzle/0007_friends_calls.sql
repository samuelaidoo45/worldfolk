CREATE TABLE `friend_calls` (
	`id` text PRIMARY KEY NOT NULL,
	`caller` text NOT NULL,
	`callee` text NOT NULL,
	`status` text DEFAULT 'ringing' NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`caller`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`callee`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `friend_calls_caller` ON `friend_calls` (`caller`,`expires_at`);--> statement-breakpoint
CREATE INDEX `friend_calls_callee` ON `friend_calls` (`callee`,`expires_at`);--> statement-breakpoint
CREATE TABLE `friendships` (
	`id` text PRIMARY KEY NOT NULL,
	`player_a` text NOT NULL,
	`player_b` text NOT NULL,
	`requested_by` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`player_a`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_b`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `friendships_pair` ON `friendships` (`player_a`,`player_b`);--> statement-breakpoint
CREATE INDEX `friendships_b` ON `friendships` (`player_b`);--> statement-breakpoint
ALTER TABLE `voice_sessions` ADD `room_id` text DEFAULT 'city' NOT NULL;