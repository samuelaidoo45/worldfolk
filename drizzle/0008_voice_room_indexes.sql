CREATE INDEX `voice_sessions_room` ON `voice_sessions` (`room_id`,`last_seen`);--> statement-breakpoint
CREATE INDEX `voice_sessions_id` ON `voice_sessions` (`session_id`);