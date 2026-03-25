import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courts } from "@/lib/db/schema"
import type { NewCourt } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

/** F2-01 – Listar todas as quadras */
export async function GET() {
  const allCourts = await db.select().from(courts)
  return NextResponse.json(allCourts)
}

/** F2-02 – Criar nova quadra */
export async function POST(req: Request) {
  try {
    const body = await req.json() as Omit<NewCourt, "id">

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome da quadra é obrigatório" }, { status: 400 })
    }
    
    const [newCourt] = await db
      .insert(courts)
      .values({
        name:             body.name.trim(),
        type:             body.type,
        surface:          body.surface,
        active:           body.active ?? true,
        deactivateStart:  body.deactivateStart ?? null,
        deactivateEnd:    body.deactivateEnd ?? null,
        usageMinutesDry:  body.usageMinutesDry ?? 60,
        usageMinutesRain: body.usageMinutesRain ?? 60,
        intervalMinutes:  body.intervalMinutes ?? 15,
      })
      .returning()

    return NextResponse.json(newCourt, { status: 201 })
  } catch (err) {
    console.error("Erro ao criar quadra:", err)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}
