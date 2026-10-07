CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`player_id` text NOT NULL,
	`channel` text NOT NULL,
	`body` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar` text DEFAULT '🧑🏾' NOT NULL,
	`place_id` text DEFAULT 'home' NOT NULL,
	`money` integer DEFAULT 120 NOT NULL,
	`energy` integer DEFAULT 80 NOT NULL,
	`hunger` integer DEFAULT 80 NOT NULL,
	`fun` integer DEFAULT 70 NOT NULL,
	`social` integer DEFAULT 65 NOT NULL,
	`hygiene` integer DEFAULT 80 NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`day` integer DEFAULT 1 NOT NULL,
	`minute` integer DEFAULT 480 NOT NULL,
	`home_tier` integer DEFAULT 0 NOT NULL,
	`job` text DEFAULT 'Finding my way' NOT NULL,
	`jobs_done` integer DEFAULT 0 NOT NULL,
	`chats_sent` integer DEFAULT 0 NOT NULL,
	`visits` integer DEFAULT 0 NOT NULL,
	`last_action_at` integer DEFAULT 0 NOT NULL,
	`last_chat_at` integer DEFAULT 0 NOT NULL,
	`last_seen_at` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT 0 NOT NULL
);
