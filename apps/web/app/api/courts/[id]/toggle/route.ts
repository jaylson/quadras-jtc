import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"

type Params = { params: Promise<{ id: string }> }

/** F2-05 – Alternar status ativo/inativo */
export async function PATCH(_req: Request, { params }: Params) {
  const { id } = await params
  const courtId = Number(id)
  const store = getStore()
  const idx = store.courts.findIndex((c) => c.id === courtId)

  if (idx === -1) {
    return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 })
  }

  store.courts[idx] = {
    ...store.courts[idx],
    active: !store.courts[idx].active,
  }

  return NextResponse.json(store.courts[idx])
}
