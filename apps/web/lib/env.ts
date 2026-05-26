/**
 * Resolve a URL do banco aceitando aliases para facilitar integração com Supabase.
 */
export function getDatabaseUrl(): string | null {
  return (
    process.env.DATABASE_URL ??
    process.env.SUPABASE_DB_URL ??
    process.env.SUPABASE_DATABASE_URL ??
    null
  )
}

export function hasDatabaseUrl(): boolean {
  return Boolean(getDatabaseUrl())
}
