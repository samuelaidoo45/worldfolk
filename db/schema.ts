import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  playerId: text("player_id").notNull().references(() => players.id),
  channel: text("channel").notNull(),
  body: text("body").notNull(),
  createdAt: integer("created_at").notNull(),
});
