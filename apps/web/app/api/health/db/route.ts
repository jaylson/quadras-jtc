import { NextResponse } from "next/server"
import { hasDatabaseUrl } from "@/lib/env"

/**
 * Health check do banco para monitoramento e diagnóstico rápido.
 */
export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      {
        status: "degraded",
        database: "not-configured",
        message: "Defina DATABASE_URL ou SUPABASE_DB_URL para habilitar o banco",
      },
      { status: 503 },
    )
  }

  try {
    const { db } = await import("@/lib/db")
    const { sql } = await import("drizzle-orm")

    await db.execute(sql`select 1`)

    return NextResponse.json({
      status: "ok",
      database: "up",
      provider: "supabase-postgres",
    })
  } catch (error) {
    console.error("[health/db] Falha de conexao:", error)
    return NextResponse.json(
      {
        status: "down",
        database: "unreachable",
      },
      { status: 503 },
    )
  }
}
