import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { managers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { NewManager } from "@/lib/db/schema"

type Params = { params: Promise<{ id: string }> }

/** F1-10 – Editar responsável */
export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const managerId = Number(id)

  try {
    const body = await req.json() as Partial<NewManager>
    
    const [updated] = await db
      .update(managers)
      .set({ ...body, id: managerId })
      .where(eq(managers.id, managerId))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Responsável não encontrado" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error("Erro ao editar responsável:", err)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

/** F1-11 – Alternar ativo/inativo */
export async function PATCH(_req: Request, { params }: Params) {
  const { id } = await params
  const managerId = Number(id)

  try {
    const [manager] = await db.select().from(managers).where(eq(managers.id, managerId)).limit(1)
    if (!manager) {
      return NextResponse.json({ error: "Responsável não encontrado" }, { status: 404 })
    }

    const [updated] = await db
      .update(managers)
      .set({ active: !manager.active })
      .where(eq(managers.id, managerId))
      .returning()

    return NextResponse.json(updated)
  } catch (err) {
    console.error("Erro ao alternar responsável:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

/** F1-12 – Remover responsável */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const managerId = Number(id)

  try {
    const [deleted] = await db
      .delete(managers)
      .where(eq(managers.id, managerId))
      .returning()

    if (!deleted) {
      return NextResponse.json({ error: "Responsável não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Erro ao remover responsável:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
