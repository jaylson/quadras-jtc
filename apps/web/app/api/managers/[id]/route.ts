import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import type { NewManager } from "@/lib/db/schema"

type Params = { params: Promise<{ id: string }> }

function findManager(id: number) {
  const store = getStore()
  const idx = store.managers.findIndex((m) => m.id === id)
  return { store, idx, manager: store.managers[idx] }
}

/** Editar responsável */
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const managerId = Number(id)
  const { store, idx } = findManager(managerId)

  if (idx === -1) {
    return NextResponse.json({ error: "Responsável não encontrado" }, { status: 404 })
  }

  try {
    const body = await req.json() as Partial<NewManager>
    store.managers[idx] = { ...store.managers[idx], ...body, id: managerId }
    return NextResponse.json(store.managers[idx])
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

/** Toggle ativo/inativo */
export async function PATCH(_req: Request, { params }: Params) {
  const { id } = await params
  const managerId = Number(id)
  const { store, idx } = findManager(managerId)

  if (idx === -1) {
    return NextResponse.json({ error: "Responsável não encontrado" }, { status: 404 })
  }

  store.managers[idx].active = !store.managers[idx].active
  return NextResponse.json(store.managers[idx])
}

/** Remover responsável */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const managerId = Number(id)
  const { store, idx } = findManager(managerId)

  if (idx === -1) {
    return NextResponse.json({ error: "Responsável não encontrado" }, { status: 404 })
  }

  store.managers.splice(idx, 1)
  return NextResponse.json({ success: true })
}
