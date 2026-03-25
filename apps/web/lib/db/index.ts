import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Singleton de conexão para evitar múltiplas pools no Next.js dev (hot reload)
declare global {
  // eslint-disable-next-line no-var
  var _postgresClient: postgres.Sql | undefined
}

function createClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não definida. Configure .env.local")
  }

  // Supabase PostgreSQL
  return postgres(process.env.DATABASE_URL, { prepare: false })
}

const client = globalThis._postgresClient ?? createClient()

if (process.env.NODE_ENV !== "production") {
  globalThis._postgresClient = client
}

export const db = drizzle(client, { schema })
export type DB = typeof db
