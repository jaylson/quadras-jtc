import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { NewCourt } from "@/lib/db/schema"

type Params = { params: Promise<{ id: string }> }

/** F2-03 – Editar quadra */
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const courtId = Number(id)

  try {
    const body = await req.json() as Partial<NewCourt>

    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json({ error: "Nome da quadra é obrigatório" }, { status: 400 })
    }

    const [updatedCourt] = await db
      .update(courts)
      .set({
        ...body,
        id: courtId,
      })
      .where(eq(courts.id, courtId))
      .returning()

    if (!updatedCourt) {
      return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 })
    }

    return NextResponse.json(updatedCourt)
  } catch (err) {
    console.error("Erro ao editar quadra:", err)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

/** F2-04 – Excluir quadra */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const courtId = Number(id)

  const [deletedCourt] = await db
    .delete(courts)
    .where(eq(courts.id, courtId))
    .returning()

  if (!deletedCourt) {
    return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
