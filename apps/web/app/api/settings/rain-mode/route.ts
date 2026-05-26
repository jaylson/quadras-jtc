import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import { hasDatabaseUrl } from "@/lib/env"

/**
 * F2-16 – Alternar modo chuva.
 */
export async function PATCH(req: Request) {
  try {
    if (!hasDatabaseUrl()) {
      const store = getStore()

      try {
        const body = await req.json() as { rainMode?: boolean }
        store.rainMode = body.rainMode !== undefined ? body.rainMode : !store.rainMode
      } catch {
        store.rainMode = !store.rainMode
      }

      return NextResponse.json({ rainMode: store.rainMode })
    }

    const { db } = await import("@/lib/db")
    const { settings } = await import("@/lib/db/schema")
    const { eq } = await import("drizzle-orm")

    const [currentSetting] = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "rain_mode"))
      .limit(1)

    let currentMode = currentSetting?.value === "1"
    
    try {
      const body = await req.json() as { rainMode?: boolean }
      currentMode = body.rainMode !== undefined ? body.rainMode : !currentMode
    } catch {
      currentMode = !currentMode
    }

    const nextValue = currentMode ? "1" : "0"

    await db
      .insert(settings)
      .values({ key: "rain_mode", value: nextValue })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: nextValue },
      })

    return NextResponse.json({ rainMode: currentMode })
  } catch (err) {
    console.error("Erro ao alternar modo chuva:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
