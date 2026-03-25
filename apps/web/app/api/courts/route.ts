import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import type { NewCourt } from "@/lib/db/schema"

/** F2-01 – Listar todas as quadras */
export async function GET() {
  const store = getStore()
  return NextResponse.json(store.courts)
}

/** F2-02 – Criar nova quadra */
export async function POST(req: Request) {
  try {
    const body = await req.json() as Omit<NewCourt, "id">

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome da quadra é obrigatório" }, { status: 400 })
    }
    if (!body.type || !["coberta", "descoberta"].includes(body.type)) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
    }
    if (!body.surface || !["saibro", "hard", "grama"].includes(body.surface)) {
      return NextResponse.json({ error: "Superfície inválida" }, { status: 400 })
    }

    const store = getStore()
    const newCourt = {
      id:               store.nextId.courts++,
      name:             body.name.trim(),
      type:             body.type,
      surface:          body.surface,
      active:           body.active ?? true,
      deactivateStart:  body.deactivateStart ?? null,
      deactivateEnd:    body.deactivateEnd ?? null,
      usageMinutesDry:  body.usageMinutesDry ?? 60,
      usageMinutesRain: body.usageMinutesRain ?? 60,
      intervalMinutes:  body.intervalMinutes ?? 15,
    }

    store.courts.push(newCourt)
    return NextResponse.json(newCourt, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}
