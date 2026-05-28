import { defineConfig } from "drizzle-kit"

const rawDatabaseUrl =
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DB_URL ??
  process.env.SUPABASE_DATABASE_URL

if (!rawDatabaseUrl) {
  throw new Error("Defina DATABASE_URL ou SUPABASE_DB_URL antes de executar comandos do Drizzle")
}

let databaseUrl = rawDatabaseUrl

try {
  const parsedUrl = new URL(rawDatabaseUrl)
  const isSupabaseHost = parsedUrl.hostname.includes("supabase.com")

  if (isSupabaseHost && !parsedUrl.searchParams.has("sslmode")) {
    parsedUrl.searchParams.set("sslmode", "require")
    databaseUrl = parsedUrl.toString()
  }
} catch {
  databaseUrl = rawDatabaseUrl
}

export default defineConfig({
  schema:    "./lib/db/schema.ts",
  out:       "./lib/db/migrations",
  dialect:   "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
})
