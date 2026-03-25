import { drizzle } from "drizzle-orm/mysql2"
import mysql from "mysql2/promise"
import * as schema from "./schema"

// Singleton de conexão para evitar múltiplas pools no Next.js dev (hot reload)
declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined
}

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não definida. Configure .env.local")
  }

  return mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Azure MySQL exige SSL
    waitForConnections: true,
    connectionLimit: 10,
  })
}

const pool = globalThis._mysqlPool ?? createPool()

if (process.env.NODE_ENV !== "production") {
  globalThis._mysqlPool = pool
}

export const db = drizzle(pool, { schema, mode: "default" })
export type DB = typeof db
