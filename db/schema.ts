import { integer, real, sqliteTable, text, index, uniqueIndex } from "drizzle-orm/sqlite-core";

export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull().default("🧑🏾"),
  placeId: text("place_id").notNull().default("home"),
  posLng: real("pos_lng"),
  posLat: real("pos_lat"),
  heading: integer("heading").notNull().default(0),
  driving: integer("driving").notNull().default(0),
  lastMoveAt: integer("last_move_at").notNull().default(0),
  sessionToken: text("session_token"),
  lifeJson: text("life_json").notNull().default("{}"),
  revision: integer("revision").notNull().default(0),
  money: integer("money").notNull().default(120),
  energy: integer("energy").notNull().default(80),
  hunger: integer("hunger").notNull().default(80),
  fun: integer("fun").notNull().default(70),
  social: integer("social").notNull().default(65),
  hygiene: integer("hygiene").notNull().default(80),
  xp: integer("xp").notNull().default(0),
  day: integer("day").notNull().default(1),
  minute: integer("minute").notNull().default(480),
  homeTier: integer("home_tier").notNull().default(0),
  job: text("job").notNull().default("Finding my way"),
  jobsDone: integer("jobs_done").notNull().default(0),
  chatsSent: integer("chats_sent").notNull().default(0),
  visits: integer("visits").notNull().default(0),
  lastActionAt: integer("last_action_at").notNull().default(0),
  lastChatAt: integer("last_chat_at").notNull().default(0),
  lastSeenAt: integer("last_seen_at").notNull().default(0),
  createdAt: integer("created_at").notNull().default(0),
}, table => [uniqueIndex("players_session_token_unique").on(table.sessionToken)]);

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id),
  channel: text("channel").notNull(),
  body: text("body").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const propertyInvites = sqliteTable("property_invites", {
  id: text("id").primaryKey(),
  propertyId: text("property_id").notNull(),
  ownerId: text("owner_id").notNull().references(() => players.id),
  codeHash: text("code_hash").notNull(),
  guestId: text("guest_id"),
  expiresAt: integer("expires_at").notNull(),
}, table => [uniqueIndex("property_invites_code_unique").on(table.codeHash),index("property_invites_property_guest").on(table.propertyId,table.guestId),index("property_invites_owner_expiry").on(table.ownerId,table.expiresAt)]);

export const voiceSessions = sqliteTable('voice_sessions', {
  playerId: text('player_id').primaryKey().references(() => players.id),
  sessionId: text('session_id').notNull(),
  lastSeen: integer('last_seen').notNull(),
  lastSignal: integer('last_signal').notNull().default(0),
});
export const voiceSignals = sqliteTable('voice_signals', {
  id: integer('id').primaryKey({autoIncrement:true}),
  fromSession: text('from_session').notNull(),
  toSession: text('to_session').notNull(),
  payload: text('payload').notNull(),
  createdAt: integer('created_at').notNull(),
}, table => [index('voice_signals_recipient').on(table.toSession,table.id),index('voice_signals_expiry').on(table.createdAt)]);
