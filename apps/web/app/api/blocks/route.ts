import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { adminBlocks } from "@/lib/db/schema"
import { and, gte, lte, eq } from "drizzle-orm"
import type { NewAdminBlock } from "@/lib/db/schema"

/** F2-06 – Listar travas com filtro de período opcional */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get("from")   // YYYY-MM-DD
  const to   = searchParams.get("to")     // YYYY-MM-DD

  const where = []
  if (from) where.push(gte(adminBlocks.date, from))
  if (to)   where.push(lte(adminBlocks.date, to))

  const blocks = await db
    .select()
    .from(adminBlocks)
    .where(where.length > 0 ? and(...where) : undefined)

  // Expandir recorrências semanais para o período solicitado (lógica de apresentação)
  if (from && to) {
    const expanded: typeof blocks = []
    const fromDate = new Date(from)
    const toDate   = new Date(to)

    for (const block of blocks) {
      if (block.recurring === "semanal") {
        // Gerar instâncias para cada semana dentro do período
        let cursor = new Date(block.date)
        
        // Se a data de início da trava é antes do período 'from', vamos adiantar o cursor
        while (cursor < fromDate) {
          cursor.setDate(cursor.getDate() + 7)
        }

        while (cursor <= toDate) {
          const dateStr = cursor.toISOString().slice(0, 10)
          expanded.push({ ...block, date: dateStr })
          cursor.setDate(cursor.getDate() + 7)
        }
      } else {
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

    const [newBlock] = await db
      .insert(adminBlocks)
      .values({
        title:     body.title.trim(),
        category:  body.category ?? "outro",
        courtIds:  body.courtIds,
        date:      body.date,
        startTime: body.startTime,
        endTime:   body.endTime,
        recurring: body.recurring ?? "nenhuma",
        notes:     body.notes ?? null,
      })
      .returning()

    return NextResponse.json(newBlock, { status: 201 })
  } catch (err) {
    console.error("Erro ao criar trava:", err)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}
