CREATE UNIQUE INDEX `players_session_token_unique` ON `players` (`session_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `property_invites_code_unique` ON `property_invites` (`code_hash`);--> statement-breakpoint
CREATE INDEX `property_invites_property_guest` ON `property_invites` (`property_id`,`guest_id`);--> statement-breakpoint
CREATE INDEX `property_invites_owner_expiry` ON `property_invites` (`owner_id`,`expires_at`);