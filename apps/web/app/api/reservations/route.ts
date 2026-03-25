import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { reservations, courts, settings, adminBlocks } from "@/lib/db/schema"
import type { NewReservation, Player } from "@/lib/db/schema"
import { getNextAvailableSlot, getCourtStatus, getEffectiveUsage } from "@/lib/utils/courts"
import { and, gte, eq, ne, lt, gt } from "drizzle-orm"

/** F2-10 – Listar reservas ativas e futuras */
export async function GET() {
  const now = new Date()

  // Retorna reservas em uso ou agendadas (não concluídas)
  const active = await db
    .select()
    .from(reservations)
    .where(
        and(
            ne(reservations.status, "concluída"),
            gt(reservations.endTime, now)
        )
    )

  return NextResponse.json(active)
}

/** F2-11 – Criar reserva (check-in Totem) */
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      courtId:  number
      gameType: "simples" | "duplas"
      players:  Player[]
    }

    const [court] = await db.select().from(courts).where(eq(courts.id, body.courtId)).limit(1)
    if (!court) {
      return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 })
    }

    // Obter dados auxiliares
    const [rainSetting] = await db.select().from(settings).where(eq(settings.key, "rain_mode")).limit(1)
    const rainMode = rainSetting?.value === "1"
    
    const now = new Date()
    const reservationsToday = await db.select().from(reservations).where(
        and(
            eq(reservations.courtId, court.id),
            ne(reservations.status, "concluída"),
            gt(reservations.endTime, new Date(now.getTime() - 2 * 60 * 60 * 1000)) // Pegar reservas recentes/futuras
        )
    )

    const blocksToday = await db.select().from(adminBlocks).where(
        eq(adminBlocks.date, now.toISOString().slice(0, 10))
    )

    // Verificar disponibilidade
    const courtStatus = getCourtStatus(court, reservationsToday, blocksToday, rainMode)
    if (courtStatus === "inativa") {
      return NextResponse.json({ error: "Quadra está inativa ou bloqueada no momento" }, { status: 409 })
    }
    if (courtStatus === "bloqueada-chuva") {
      return NextResponse.json({ error: "Quadra bloqueada pelo modo chuva" }, { status: 409 })
    }

    // Validar jogadores
    const players: Player[] = body.players ?? []
    if (body.gameType === "simples" && players.length !== 2) {
      return NextResponse.json({ error: "Simples exige exatamente 2 jogadores" }, { status: 400 })
    }
    if (body.gameType === "duplas" && (players.length < 3 || players.length > 4)) {
      return NextResponse.json({ error: "Duplas exige 3 ou 4 jogadores" }, { status: 400 })
    }
    if (!players[0]?.name?.trim() || !players[0]?.phone?.trim()) {
      return NextResponse.json({ error: "1º jogador: nome e WhatsApp são obrigatórios" }, { status: 400 })
    }

    // F2-13: calcular slot
    const startTime = getNextAvailableSlot(court, reservationsToday, rainMode)
    const durationMinutes = getEffectiveUsage(court, rainMode)
    const endTime = new Date(startTime.getTime() + durationMinutes * 60_000)

    // F2-14: validação de conflito
    const conflicting = reservationsToday.find(r => 
        new Date(r.startTime) < endTime && new Date(r.endTime) > startTime
    )
    if (conflicting) {
      return NextResponse.json({ error: "Conflito de horário detectado — tente novamente" }, { status: 409 })
    }

    // Determinar status da reserva
    const status = startTime <= now ? "em uso" : "agendada"

    const [newReservation] = await db
      .insert(reservations)
      .values({
        courtId:     body.courtId,
        courtName:   court.name,
        playerName:  players.map((p) => p.name).join(", "),
        playerPhone: players[0].phone!,
        players,
        gameType:    body.gameType,
        startTime,
        endTime,
        status,
      })
      .returning()

    return NextResponse.json(newReservation, { status: 201 })
  } catch (e) {
    console.error("Erro ao criar reserva:", e)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}
