import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"
import { getDatabaseUrl } from "@/lib/env"

type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>

// Singleton de conexão para evitar múltiplas pools no Next.js dev (hot reload)
declare global {
  // eslint-disable-next-line no-var
  var _postgresClient: postgres.Sql | undefined
  // eslint-disable-next-line no-var
  var _drizzleDb: DrizzleDB | undefined
}

function createClient() {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) {
    return undefined
  }

  // Supabase PostgreSQL
  return postgres(databaseUrl, { prepare: false })
}

const client = globalThis._postgresClient ?? createClient()

if (process.env.NODE_ENV !== "production" && client) {
  globalThis._postgresClient = client
}

function getDb(): DrizzleDB {
  if (!client) {
    throw new Error("Banco nao configurado. Defina DATABASE_URL ou SUPABASE_DB_URL no .env.local")
  }

  if (!globalThis._drizzleDb) {
    globalThis._drizzleDb = drizzle(client, { schema })
  }

  return globalThis._drizzleDb
}

export const db = new Proxy({} as DrizzleDB, {
  get(_target, prop, receiver) {
    const instance = getDb() as any
    const value = Reflect.get(instance, prop, receiver)

    if (typeof value === "function") {
      return value.bind(instance)
    }

    return value
  },
})

export type DB = DrizzleDB
