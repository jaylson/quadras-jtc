/**
 * Resolve a URL do banco aceitando aliases para facilitar integração com Supabase.
 */
export function getDatabaseUrl(): string | null {
  const rawUrl =
    process.env.DATABASE_URL ??
    process.env.SUPABASE_DB_URL ??
    process.env.SUPABASE_DATABASE_URL ??
    null

  if (!rawUrl) {
    return null
  }

  try {
    const parsedUrl = new URL(rawUrl)
    const isSupabaseHost = parsedUrl.hostname.includes("supabase.com")

    if (isSupabaseHost && !parsedUrl.searchParams.has("sslmode")) {
      parsedUrl.searchParams.set("sslmode", "require")
      return parsedUrl.toString()
    }

    return parsedUrl.toString()
  } catch {
    return rawUrl
  }
}

export function hasDatabaseUrl(): boolean {
  return Boolean(getDatabaseUrl())
}
