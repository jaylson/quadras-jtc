import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import type { NewAdminBlock } from "@/lib/db/schema"

/** F2-06 – Listar travas com filtro de período opcional */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")   // YYYY-MM-DD
  const to   = searchParams.get("to")     // YYYY-MM-DD

  const store = getStore()
  let blocks = store.blocks

  if (from && to) {
    blocks = blocks.filter((b) => b.date >= from && b.date <= to)
  } else if (from) {
    blocks = blocks.filter((b) => b.date >= from)
  }

  // Expandir recorrências semanais para o período solicitado
  if (from && to) {
    const expanded: typeof blocks = []
    const fromDate = new Date(from)
    const toDate   = new Date(to)

    for (const block of store.blocks) {
      if (block.recurring === "semanal") {
        // Gerar instâncias para cada semana dentro do período
        let cursor = new Date(block.date)
        while (cursor <= toDate) {
          const dateStr = cursor.toISOString().slice(0, 10)
          if (dateStr >= from) {
            expanded.push({ ...block, date: dateStr })
          }
          cursor = new Date(cursor.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      } else if (block.date >= from && block.date <= to) {
        expanded.push(block)
      }
    }
    return NextResponse.json(expanded)
  }

  return NextResponse.json(blocks)
}

/** F2-07 – Criar nova trava */
export async function POST(req: Request) {
  try {
    const body = await req.json() as Omit<NewAdminBlock, "id">

    // RN-13: título e pelo menos uma quadra são obrigatórios
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 })
    }
    if (!Array.isArray(body.courtIds) || body.courtIds.length === 0) {
      return NextResponse.json({ error: "Selecione ao menos uma quadra" }, { status: 400 })
    }
    if (!body.date || !body.startTime || !body.endTime) {
      return NextResponse.json({ error: "Data e horários são obrigatórios" }, { status: 400 })
    }

    const store = getStore()
    const newBlock = {
      id:        store.nextId.blocks++,
      title:     body.title.trim(),
      category:  body.category ?? "outro",
      courtIds:  body.courtIds,
      date:      body.date,
      startTime: body.startTime,
      endTime:   body.endTime,
      recurring: body.recurring ?? "nenhuma",
      notes:     body.notes ?? null,
    }

    store.blocks.push(newBlock)
    return NextResponse.json(newBlock, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}
