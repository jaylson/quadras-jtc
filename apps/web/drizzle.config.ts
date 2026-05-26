import { defineConfig } from "drizzle-kit"

const databaseUrl =
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DB_URL ??
  process.env.SUPABASE_DATABASE_URL

if (!databaseUrl) {
  throw new Error("Defina DATABASE_URL ou SUPABASE_DB_URL antes de executar comandos do Drizzle")
}

export default defineConfig({
  schema:    "./lib/db/schema.ts",
  out:       "./lib/db/migrations",
  dialect:   "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
})
