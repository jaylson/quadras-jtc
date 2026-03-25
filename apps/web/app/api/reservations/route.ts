import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import type { NewReservation, Player } from "@/lib/db/schema"
import { getNextAvailableSlot, getCourtStatus, getEffectiveUsage } from "@/lib/utils/courts"

/** F2-10 – Listar reservas ativas e futuras */
export async function GET() {
  const store = getStore()
  const now = new Date()

  // Retorna reservas em uso ou agendadas (não concluídas)
  const active = store.reservations.filter(
    (r) => r.status !== "concluída" && new Date(r.endTime) > now
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

    const store = getStore()
    const court = store.courts.find((c) => c.id === body.courtId)

    if (!court) {
      return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 })
    }

    // Verificar disponibilidade (RN-01, RN-02)
    const courtStatus = getCourtStatus(court, store.reservations, store.rainMode)
    if (courtStatus === "inativa") {
      return NextResponse.json({ error: "Quadra está inativa" }, { status: 409 })
    }
    if (courtStatus === "bloqueada-chuva") {
      return NextResponse.json({ error: "Quadra bloqueada pelo modo chuva" }, { status: 409 })
    }

    // Validar jogadores (RN-07, RN-08)
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
    for (let i = 1; i < players.length; i++) {
      if (!players[i]?.name?.trim()) {
        return NextResponse.json({ error: `Nome do jogador ${i + 1} é obrigatório` }, { status: 400 })
      }
    }

    // F2-13: calcular slot (RN-06)
    const startTime = getNextAvailableSlot(court, store.reservations, store.rainMode)
    const durationMinutes = getEffectiveUsage(court, store.rainMode)
    const endTime = new Date(startTime.getTime() + durationMinutes * 60_000)

    // F2-14: validação de conflito (lock otimista)
    const conflict = store.reservations.find(
      (r) =>
        r.courtId === body.courtId &&
        r.status !== "concluída" &&
        new Date(r.startTime) < endTime &&
        new Date(r.endTime) > startTime
    )
    if (conflict) {
      return NextResponse.json({ error: "Conflito de horário detectado — tente novamente" }, { status: 409 })
    }

    // Determinar status da reserva (RN-10)
    const now = new Date()
    const status = startTime <= now ? "em uso" : "agendada"

    const newReservation: NewReservation = {
      id:          store.nextId.reservations++,
      courtId:     body.courtId,
      courtName:   court.name,
      playerName:  players.map((p) => p.name).join(", "),
      playerPhone: players[0].phone!,
      players,
      gameType:    body.gameType,
      startTime,
      endTime,
      status,
    }

    store.reservations.push(newReservation as never)
    return NextResponse.json(newReservation, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
}
