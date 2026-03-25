import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

type Params = { params: Promise<{ id: string }> }

/** F2-05 – Alternar status ativo/inativo da quadra */
export async function PATCH(_req: Request, { params }: Params) {
  const { id } = await params
  const courtId = Number(id)

  try {
    const [court] = await db.select().from(courts).where(eq(courts.id, courtId)).limit(1)
    if (!court) {
      return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 })
    }

    const nextActive = !court.active
    const [updated] = await db
      .update(courts)
      .set({ active: nextActive })
      .where(eq(courts.id, courtId))
      .returning()

    return NextResponse.json(updated)
  } catch (err) {
    console.error("Erro ao alternar quadra:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
