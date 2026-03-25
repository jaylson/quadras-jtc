import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import type { NewManager } from "@/lib/db/schema"

const VALID_SHIFTS = ["manha-seg","tarde-seg","noite-seg","manha-fds","tarde-fds","noite-fds"] as const

/** Listar todos os responsáveis */
export async function GET() {
  const store = getStore()
  return NextResponse.json(store.managers)
}

/** Criar novo responsável */
export async function POST(req: Request) {
  try {
    const body = await req.json() as Omit<NewManager, "id">

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ error: "Telefone é obrigatório" }, { status: 400 })
    }
    const shifts = Array.isArray(body.shifts) ? body.shifts : []
    if (shifts.length === 0) {
      return NextResponse.json({ error: "Selecione ao menos um turno" }, { status: 400 })
    }
    const invalidShift = shifts.find((s) => !VALID_SHIFTS.includes(s as typeof VALID_SHIFTS[number]))
    if (invalidShift) {
      return NextResponse.json({ error: `Turno inválido: ${invalidShift}` }, { status: 400 })
    }

    const store = getStore()
    const newManager = {
      id:     store.nextId.managers++,
      name:   body.name.trim(),
      phone:  body.phone.trim(),
      shifts,
      active: body.active ?? true,
    }

    store.managers.push(newManager)
    return NextResponse.json(newManager, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}

