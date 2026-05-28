import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import type { NewCourt } from "@/lib/db/schema"
import { hasDatabaseUrl } from "@/lib/env"

/** F2-01 – Listar todas as quadras */
export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(getStore().courts)
  }

  try {
    const { db } = await import("@/lib/db")
    const { courts } = await import("@/lib/db/schema")
    const allCourts = await db.select().from(courts)
    return NextResponse.json(allCourts)
  } catch (err) {
    console.error("Erro ao listar quadras:", err)

    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(getStore().courts)
    }

    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

/** F2-02 – Criar nova quadra */
export async function POST(req: Request) {
  try {
    const body = await req.json() as Omit<NewCourt, "id">

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome da quadra é obrigatório" }, { status: 400 })
    }

    if (!hasDatabaseUrl()) {
      const store = getStore()
      const newCourt = {
        id: store.nextId.courts++,
        name: body.name.trim(),
        type: body.type,
        surface: body.surface,
        active: body.active ?? true,
        deactivateStart: body.deactivateStart ?? null,
        deactivateEnd: body.deactivateEnd ?? null,
        usageMinutesDrySingles: body.usageMinutesDrySingles ?? 60,
        usageMinutesDryDoubles: body.usageMinutesDryDoubles ?? 60,
        usageMinutesRainSingles: body.usageMinutesRainSingles ?? 60,
        usageMinutesRainDoubles: body.usageMinutesRainDoubles ?? 60,
        intervalMinutes: body.intervalMinutes ?? 15,
      }
      store.courts.push(newCourt)
      return NextResponse.json(newCourt, { status: 201 })
    }

    const { db } = await import("@/lib/db")
    const { courts } = await import("@/lib/db/schema")
    
    const [newCourt] = await db
      .insert(courts)
      .values({
        name:             body.name.trim(),
        type:             body.type,
        surface:          body.surface,
        active:           body.active ?? true,
        deactivateStart:  body.deactivateStart ?? null,
        deactivateEnd:    body.deactivateEnd ?? null,
        usageMinutesDrySingles: body.usageMinutesDrySingles ?? 60,
        usageMinutesDryDoubles: body.usageMinutesDryDoubles ?? 60,
        usageMinutesRainSingles: body.usageMinutesRainSingles ?? 60,
        usageMinutesRainDoubles: body.usageMinutesRainDoubles ?? 60,
        intervalMinutes:  body.intervalMinutes ?? 15,
      })
      .returning()

    return NextResponse.json(newCourt, { status: 201 })
  } catch (err) {
    console.error("Erro ao criar quadra:", err)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}
