import {
  pgTable,
  serial,
  varchar,
  boolean,
  date,
  timestamp,
  json,
  pgEnum,
  text,
  integer,
} from "drizzle-orm/pg-core"

export const courtTypeEnum = pgEnum("type", ["coberta", "descoberta"]);
export const courtSurfaceEnum = pgEnum("surface", ["saibro", "hard", "grama"]);
export const blockCategoryEnum = pgEnum("category", ["aula", "campeonato", "evento", "manutencao", "outro"]);
export const blockRecurringEnum = pgEnum("recurring", ["nenhuma", "semanal"]);
export const gameTypeEnum = pgEnum("game_type", ["simples", "duplas"]);
export const statusEnum = pgEnum("status", ["em uso", "agendada", "concluída"]);

// ─── courts ──────────────────────────────────────────────────
export const courts = pgTable("courts", {
  id:               serial("id").primaryKey(),
  name:             varchar("name", { length: 100 }).notNull(),
  type:             courtTypeEnum("type").notNull(),
  surface:          courtSurfaceEnum("surface").notNull(),
  active:           boolean("active").notNull().default(true),
  deactivateStart:  date("deactivate_start", { mode: "string" }),
  deactivateEnd:    date("deactivate_end", { mode: "string" }),
  usageMinutesDry:  integer("usage_minutes_dry").notNull().default(60),
  usageMinutesRain: integer("usage_minutes_rain").notNull().default(60),
  intervalMinutes:  integer("interval_minutes").notNull().default(15),
})

// ─── admin_blocks ─────────────────────────────────────────────
export const adminBlocks = pgTable("admin_blocks", {
  id:        serial("id").primaryKey(),
  title:     varchar("title", { length: 200 }).notNull(),
  category:  blockCategoryEnum("category").notNull(),
  courtIds:  json("court_ids").$type<number[]>().notNull(),
  date:      date("date", { mode: "string" }).notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(),  // HH:MM
  endTime:   varchar("end_time", { length: 5 }).notNull(),    // HH:MM
  recurring: blockRecurringEnum("recurring").notNull().default("nenhuma"),
  notes:     varchar("notes", { length: 500 }),
})

// ─── reservations ────────────────────────────────────────────
export const reservations = pgTable("reservations", {
  id:          serial("id").primaryKey(),
  courtId:     integer("court_id").notNull().references(() => courts.id),
  courtName:   varchar("court_name", { length: 100 }).notNull(),
  playerName:  varchar("player_name", { length: 500 }).notNull(),
  playerPhone: varchar("player_phone", { length: 20 }).notNull(),
  players:     json("players").$type<Player[]>().notNull(),
  gameType:    gameTypeEnum("game_type").notNull(),
  startTime:   timestamp("start_time").notNull(),
  endTime:     timestamp("end_time").notNull(),
  status:      statusEnum("status").notNull(),
})

// ─── users ────────────────────────────────────────────────────
export const users = pgTable("users", {
  id:           serial("id").primaryKey(),
  username:     varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role:         varchar("role", { length: 20 }).notNull().default("admin"), // 'admin', 'totem', 'tv'
  createdAt:    timestamp("created_at").defaultNow(),
})

// ─── managers ────────────────────────────────────────────────
export const managers = pgTable("managers", {
  id:     serial("id").primaryKey(),
  name:   varchar("name", { length: 100 }).notNull(),
  phone:  varchar("phone", { length: 20 }).notNull(),
  shifts: json("shifts").$type<ManagerShift[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
})

// ─── settings ────────────────────────────────────────────────
export const settings = pgTable("settings", {
  key:   varchar("key", { length: 50 }).primaryKey(),
  value: text("value").notNull(),
  // Chaves usadas: 'rain_mode' → '0' | '1'
})

// ─── Tipos auxiliares ─────────────────────────────────────────
export type Player = {
  name:      string
  phone?:    string
  memberId?: string
}

export type Court          = typeof courts.$inferSelect
export type NewCourt       = typeof courts.$inferInsert
export type AdminBlock     = typeof adminBlocks.$inferSelect
export type NewAdminBlock  = typeof adminBlocks.$inferInsert
export type Reservation    = typeof reservations.$inferSelect
export type NewReservation = typeof reservations.$inferInsert
export type User           = typeof users.$inferSelect
export type Setting        = typeof settings.$inferSelect
export type Manager        = typeof managers.$inferSelect
export type NewManager     = typeof managers.$inferInsert

/**
 * Turnos disponíveis: horário × dia da semana
 * seg-sex = dias úteis | fds = sábado e domingo
 */
export type ManagerShift =
  | "manha-seg"     // Manhã Seg–Sex  06h–12h
  | "tarde-seg"     // Tarde Seg–Sex  12h–18h
  | "noite-seg"     // Noite Seg–Sex  18h–00h
  | "manha-fds"     // Manhã Sáb–Dom  06h–12h
  | "tarde-fds"     // Tarde Sáb–Dom  12h–18h
  | "noite-fds"     // Noite Sáb–Dom  18h–00h
