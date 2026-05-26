import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import { hasDatabaseUrl } from "@/lib/env"

/** F1-10 – Listar todos os gerentes */
export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(getStore().managers)
  }

  const { db } = await import("@/lib/db")
  const { managers } = await import("@/lib/db/schema")
  const allManagers = await db.select().from(managers)
  return NextResponse.json(allManagers)
}

/** F1-11 – Criar novo gerente */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 })
    }

    if (!hasDatabaseUrl()) {
      const store = getStore()
      const newManager = {
        id: store.nextId.managers++,
        name: body.name.trim(),
        phone: body.phone.trim(),
        shifts: body.shifts || [],
        active: true,
      }
      store.managers.push(newManager)
      return NextResponse.json(newManager, { status: 201 })
    }

    const { db } = await import("@/lib/db")
    const { managers } = await import("@/lib/db/schema")

    const [newManager] = await db
      .insert(managers)
      .values({
        name: body.name.trim(),
        phone: body.phone.trim(),
        shifts: body.shifts || [],
        active: true,
      })
      .returning()

    return NextResponse.json(newManager, { status: 201 })
  } catch (err) {
    console.error("Erro ao criar gerente:", err)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}
