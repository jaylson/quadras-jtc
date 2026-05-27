import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import { hasDatabaseUrl } from "@/lib/env"

/** F2-15 – Obter configurações globais */
export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ rainMode: getStore().rainMode })
  }

  try {
    const { db } = await import("@/lib/db")
    const { settings } = await import("@/lib/db/schema")
    const { eq } = await import("drizzle-orm")
    const [rainSetting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "rain_mode"))
      .limit(1)

    const rainMode = rainSetting?.value === "1"
    return NextResponse.json({ rainMode })
  } catch (err) {
    console.error("Erro ao carregar settings:", err)

    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ rainMode: getStore().rainMode })
    }

    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
