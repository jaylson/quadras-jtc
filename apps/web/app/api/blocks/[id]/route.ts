import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { adminBlocks } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { NewAdminBlock } from "@/lib/db/schema"

type Params = { params: Promise<{ id: string }> }

/** F2-08 – Editar trava existente */
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const blockId = Number(id)

  try {
    const body = await req.json() as Partial<NewAdminBlock>

    if (body.title !== undefined && !body.title.trim()) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
    }
    if (body.courtIds !== undefined && body.courtIds.length === 0) {
      return NextResponse.json({ error: "Selecione ao menos uma quadra" }, { status: 400 })
    }

    const [updatedBlock] = await db
      .update(adminBlocks)
      .set({
        ...body,
        id: blockId, // Garantir que o ID não mude
      })
      .where(eq(adminBlocks.id, blockId))
      .returning()

    if (!updatedBlock) {
      return NextResponse.json({ error: "Trava não encontrada" }, { status: 404 })
    }

    return NextResponse.json(updatedBlock)
  } catch (err) {
    console.error("Erro ao editar trava:", err)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

/** F2-09 – Excluir trava */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const blockId = Number(id)

  const [deletedBlock] = await db
    .delete(adminBlocks)
    .where(eq(adminBlocks.id, blockId))
    .returning()

  if (!deletedBlock) {
    return NextResponse.json({ error: "Trava não encontrada" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
