CREATE TABLE `ad_events` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `ad_campaigns`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`actor_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ad_events_campaign` ON `ad_events` (`campaign_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `platform_admins` (
	`player_id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `ad_campaigns` ADD `amount_minor` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `ad_campaigns` ADD `duration_hours` integer DEFAULT 24 NOT NULL;--> statement-breakpoint
ALTER TABLE `ad_campaigns` ADD `contact` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `ad_campaigns` ADD `payment_reference` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `ad_campaigns` ADD `review_note` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `ad_campaigns` ADD `approved_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `ad_campaigns` ADD `approved_by` text;--> statement-breakpoint
ALTER TABLE `ad_campaigns` ADD `payment_confirmed_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `ad_campaigns` ADD `payment_confirmed_by` text;--> statement-breakpoint
ALTER TABLE `ad_campaigns` ADD `published_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- Return game credits charged under the former model, once during this migration.
UPDATE players SET money=money+500*(SELECT COUNT(*) FROM ad_campaigns WHERE player_id=players.id),revision=revision+1 WHERE id IN (SELECT player_id FROM ad_campaigns);
--> statement-breakpoint
UPDATE ad_campaigns SET status='pending_review',expires_at=0,amount_minor=CASE WHEN audience='business' THEN 10000 ELSE 5000 END,review_note='Advertising now requires admin approval and real payment. Previous game-credit charges were refunded.';
