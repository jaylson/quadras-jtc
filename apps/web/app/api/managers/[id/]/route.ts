import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { managers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

type Params = { params: Promise<{ id: string }> }

/** F1-12 – Excluir gerente */
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const managerId = Number(id)

  const [deleted] = await db
    .delete(managers)
    .where(eq(managers.id, managerId))
    .returning()

  if (!deleted) {
    return NextResponse.json({ error: "Gerente não encontrado" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
