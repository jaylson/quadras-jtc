import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import type { NewCourt } from "@/lib/db/schema"

type Params = { params: Promise<{ id: string }> }

function findCourt(id: number) {
  const store = getStore()
  const idx = store.courts.findIndex((c) => c.id === id)
  return { store, idx, court: store.courts[idx] }
}

/** F2-03 – Editar quadra existente */
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const courtId = Number(id)
  const { store, idx } = findCourt(courtId)

  if (idx === -1) {
    return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 })
  }

  try {
    const body = await req.json() as Partial<NewCourt>
    store.courts[idx] = { ...store.courts[idx], ...body, id: courtId }
    return NextResponse.json(store.courts[idx])
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

/** F2-04 – Remover quadra */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const courtId = Number(id)
  const { store, idx } = findCourt(courtId)

  if (idx === -1) {
    return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 })
  }

  store.courts.splice(idx, 1)
  return NextResponse.json({ success: true })
}
