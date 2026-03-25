import {
  mysqlTable,
  int,
  varchar,
  boolean,
  date,
  datetime,
  timestamp,
  json,
  mysqlEnum,
  text,
} from "drizzle-orm/mysql-core"

// ─── courts ──────────────────────────────────────────────────
export const courts = mysqlTable("courts", {
  id:               int("id").primaryKey().autoincrement(),
  name:             varchar("name", { length: 100 }).notNull(),
  type:             mysqlEnum("type", ["coberta", "descoberta"]).notNull(),
  surface:          mysqlEnum("surface", ["saibro", "hard", "grama"]).notNull(),
  active:           boolean("active").notNull().default(true),
  deactivateStart:  date("deactivate_start", { mode: "string" }),
  deactivateEnd:    date("deactivate_end", { mode: "string" }),
  usageMinutesDry:  int("usage_minutes_dry").notNull().default(60),
  usageMinutesRain: int("usage_minutes_rain").notNull().default(60),
  intervalMinutes:  int("interval_minutes").notNull().default(15),
})

// ─── admin_blocks ─────────────────────────────────────────────
export const adminBlocks = mysqlTable("admin_blocks", {
  id:        int("id").primaryKey().autoincrement(),
  title:     varchar("title", { length: 200 }).notNull(),
  category:  mysqlEnum("category", [
    "aula",
    "campeonato",
    "evento",
    "manutencao",
    "outro",
  ]).notNull(),
  courtIds:  json("court_ids").$type<number[]>().notNull(),
  date:      date("date", { mode: "string" }).notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(),  // HH:MM
  endTime:   varchar("end_time", { length: 5 }).notNull(),    // HH:MM
  recurring: mysqlEnum("recurring", ["nenhuma", "semanal"]).notNull().default("nenhuma"),
  notes:     varchar("notes", { length: 500 }),
})

// ─── reservations ────────────────────────────────────────────
export const reservations = mysqlTable("reservations", {
  id:          int("id").primaryKey().autoincrement(),
  courtId:     int("court_id").notNull().references(() => courts.id),
  courtName:   varchar("court_name", { length: 100 }).notNull(),
  playerName:  varchar("player_name", { length: 500 }).notNull(),
  playerPhone: varchar("player_phone", { length: 20 }).notNull(),
  players:     json("players").$type<Player[]>().notNull(),
  gameType:    mysqlEnum("game_type", ["simples", "duplas"]).notNull(),
  startTime:   datetime("start_time").notNull(),
  endTime:     datetime("end_time").notNull(),
  status:      mysqlEnum("status", ["em uso", "agendada", "concluída"]).notNull(),
})

// ─── users ────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id:           int("id").primaryKey().autoincrement(),
  username:     varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt:    timestamp("created_at").defaultNow(),
})

// ─── settings ────────────────────────────────────────────────
export const settings = mysqlTable("settings", {
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

export type Court         = typeof courts.$inferSelect
export type NewCourt      = typeof courts.$inferInsert
export type AdminBlock    = typeof adminBlocks.$inferSelect
export type NewAdminBlock = typeof adminBlocks.$inferInsert
export type Reservation   = typeof reservations.$inferSelect
export type NewReservation = typeof reservations.$inferInsert
export type User          = typeof users.$inferSelect
export type Setting       = typeof settings.$inferSelect
