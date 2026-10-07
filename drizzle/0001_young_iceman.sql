ALTER TABLE `players` ADD `pos_lng` real;--> statement-breakpoint
ALTER TABLE `players` ADD `pos_lat` real;--> statement-breakpoint
ALTER TABLE `players` ADD `heading` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `players` ADD `last_move_at` integer DEFAULT 0 NOT NULL;