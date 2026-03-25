import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { reservations, courts, settings, adminBlocks } from "@/lib/db/schema"
import type { NewReservation, Player } from "@/lib/db/schema"
import { getNextAvailableSlot, getCourtStatus, getEffectiveUsage } from "@/lib/utils/courts"
import { and, gte, eq, ne, lt, gt, lte } from "drizzle-orm"

/** F2-10 – Listar reservas com filtros opcionais (data, quadra, status) */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const from    = searchParams.get("from")    // YYYY-MM-DD
  const to      = searchParams.get("to")      // YYYY-MM-DD
  const courtId = searchParams.get("courtId") // number

  const where = []

  if (from) {
    // Para garantir que pegamos o dia inteiro em qualquer fuso horário (local vs UTC),
    // expandimos a busca para +/- 24h e depois refinamos se necessário, 
    // ou usamos um range que cubra o dia local [from 00:00, to 23:59]
    // Como o servidor pode estar em UTC, 2026-03-25 00:00 BRT é 2026-03-25 03:00 UTC.
    // E 2026-03-25 23:59 BRT é 2026-03-26 02:59 UTC.
    // Um range de [from - 12h] até [to + 36h] é seguro para qualquer fuso.
    const start = new Date(from + "T00:00:00")
    const searchStart = new Date(start.getTime() - 12 * 60 * 60 * 1000)
    const searchEnd = new Date(start.getTime() + 36 * 60 * 60 * 1000)
    
    where.push(gte(reservations.startTime, searchStart))
    where.push(lte(reservations.startTime, searchEnd))
  }
  if (courtId) {
    where.push(eq(reservations.courtId, parseInt(courtId)))
  }

  // Se nenhum filtro de data for passado, mantemos a lógica original de mostrar apenas futuras/em uso
  if (!from && !to) {
    const now = new Date()
    where.push(
      and(
        ne(reservations.status, "concluída"),
        gt(reservations.endTime, now)
      )
    )
  }

  const results = await db
    .select()
    .from(reservations)
    .where(where.length > 0 ? and(...where) : undefined)
    .orderBy(reservations.startTime)

  return NextResponse.json(results)
}

/** F2-11 – Criar reserva (check-in Totem) */
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      courtId:  number
      gameType: "simples" | "duplas"
      category?: "simples" | "duplas" // Alias para Legado/Totem
      players:  Player[]
    }

    const gameType = body.gameType || body.category
    if (!gameType) {
      return NextResponse.json({ error: "O tipo de jogo (gameType) é obrigatório" }, { status: 400 })
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
    if (gameType === "simples" && players.length !== 2) {
      return NextResponse.json({ error: "Simples exige exatamente 2 jogadores" }, { status: 400 })
    }
    if (gameType === "duplas" && (players.length < 3 || players.length > 4)) {
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
        gameType:    gameType,
        startTime,
        endTime,
        status,
      })
      .returning()

    /** F2-20 – Reserva de Preparação Automática (RN-11) */
    if (court.intervalMinutes > 0) {
      const prepEndTime = new Date(endTime.getTime() + court.intervalMinutes * 60_000)
      const prepStatus  = endTime <= now ? "em uso" : "agendada"
      
      // Gerar um telefone aleatório formatado (XX) 9XXXX-XXXX
      const randomPhone = `(11) 9${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}`

      await db.insert(reservations).values({
        courtId:     body.courtId,
        courtName:   court.name,
        playerName:  "Preparação",
        playerPhone: randomPhone,
        players:     [{ name: "Preparação", phone: randomPhone }, { name: "Preparação" }],
        gameType:    "simples",
        startTime:   endTime,
        endTime:     prepEndTime,
        status:      prepStatus,
      })
    }

    return NextResponse.json(newReservation, { status: 201 })
  } catch (e) {
    console.error("Erro ao criar reserva:", e)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}
