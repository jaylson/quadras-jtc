import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { managers } from "@/lib/db/schema"

/** F1-10 – Listar todos os gerentes */
export async function GET() {
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

    const [newManager] = await db
      .insert(managers)
      .values({
        name: body.name.trim(),
        experience: body.experience || "júnior",
        shifts: body.shifts || ["manhã"],
        weekends: body.weekends ?? false,
      })
      .returning()

    return NextResponse.json(newManager, { status: 201 })
  } catch (err) {
    console.error("Erro ao criar gerente:", err)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}
