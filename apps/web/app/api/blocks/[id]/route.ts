import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import type { NewAdminBlock } from "@/lib/db/schema"

type Params = { params: Promise<{ id: string }> }

/** F2-08 – Editar trava existente */
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const blockId = Number(id)
  const store = getStore()
  const idx = store.blocks.findIndex((b) => b.id === blockId)

  if (idx === -1) {
    return NextResponse.json({ error: "Trava não encontrada" }, { status: 404 })
  }

  try {
    const body = await req.json() as Partial<NewAdminBlock>

    // RN-13: título e quadra continuam obrigatórios na edição
    if (body.title !== undefined && !body.title.trim()) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
    }
    if (body.courtIds !== undefined && body.courtIds.length === 0) {
      return NextResponse.json({ error: "Selecione ao menos uma quadra" }, { status: 400 })
    }

    store.blocks[idx] = { ...store.blocks[idx], ...body, id: blockId }
    return NextResponse.json(store.blocks[idx])
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

/** F2-09 – Excluir trava */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const blockId = Number(id)
  const store = getStore()
  const idx = store.blocks.findIndex((b) => b.id === blockId)

  if (idx === -1) {
    return NextResponse.json({ error: "Trava não encontrada" }, { status: 404 })
  }

  store.blocks.splice(idx, 1)
  return NextResponse.json({ success: true })
}
