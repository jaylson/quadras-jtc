import { NextResponse } from "next/server"
import type { Court, Reservation, AdminBlock } from "@/lib/db/schema"
import { getCourtStatus, getRemainingMinutes } from "@/lib/utils/courts"

/**
 * F2-18 – Status em tempo real de todas as quadras (para TV e Totem).
 * Implementa RN-03 (cálculo de status) e RN-04 (tempo restante com Math.ceil).
 */

/** Monta a resposta de status de todas as quadras a partir de qualquer fonte de dados */
function buildCourtsStatus(
  allCourts: Court[],
  allReservations: Reservation[],
  allBlocks: AdminBlock[],
  rainMode: boolean,
  now: Date,
  dateStr: string,
) {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  const result = allCourts.map((court) => {
    const status = getCourtStatus(court, allReservations, allBlocks, rainMode)

    // Reserva ativa agora
    const activeReservation = allReservations.find(
      (r) =>
        r.courtId === court.id &&
        new Date(r.startTime) <= now &&
        new Date(r.endTime) > now
    ) ?? null

    const remainingMinutes = activeReservation
      ? getRemainingMinutes(activeReservation)
      : null

    // Todas as reservas relevantes para exibição no painel de hoje para essa quadra:
    //   1. Reservas que começam hoje (independentemente do horário de término).
    //   2. Reservas ativas agora que começaram antes da meia-noite de hoje
    //      (reservas que cruzam a virada do dia e estão ainda em andamento).
    const todayReservations = allReservations
      .filter((r) => {
        if (r.courtId !== court.id) return false
        const rStart = new Date(r.startTime)
        // Começou hoje
        if (rStart >= startOfToday && rStart <= endOfToday) return true
        // Ou está ativa agora mas começou antes de hoje (cross-midnight)
        if (rStart < startOfToday && new Date(r.endTime) > now) return true
        return false
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    // RF-36: Trazer as travas de hoje para aparecerem na TV
    const todayBlocks = allBlocks.filter(b => {
      if (!b.courtIds.includes(court.id)) return false
      if (b.date === dateStr) return true
      if (b.recurring === "semanal") {
        const blockDay = new Date(b.date).getDay()
        return blockDay === now.getDay() && b.date <= dateStr
      }
      return false
    })

    // Calcular o próximo horário livre
    let nextFreeSlot = "Agora"
    if (status === "em-uso") {
      let currentEnd = activeReservation ? new Date(activeReservation.endTime) : now

      let joined = true
      while (joined) {
        joined = false
        for (const r of todayReservations) {
          const rStart = new Date(r.startTime)
          if (rStart.getTime() === currentEnd.getTime()) {
            currentEnd = new Date(r.endTime)
            joined = true
          }
        }
      }
      nextFreeSlot = currentEnd.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false })
    }

    return {
      court,
      status,
      activeReservation,
      remainingMinutes,
      rainMode,
      todayReservations,
      todayBlocks,
      nextFreeSlot,
    }
  })

  const priority: Record<string, number> = {
    "em-uso":          0,
    "disponivel":      1,
    "bloqueada-chuva": 2,
    "inativa":         3,
  }

  result.sort((a, b) => {
    const diff = priority[a.status] - priority[b.status]
    return diff !== 0 ? diff : a.court.name.localeCompare(b.court.name)
  })

  return result
}

/** Resposta de fallback com dados mockados quando o banco não está disponível */
function buildMockStatus(now: Date, dateStr: string) {
  const addHours = (offset: number) => new Date(now.getTime() + offset * 60 * 60 * 1000)

  const mockCourts: Court[] = [
    { id: 1, name: "Quadra 1", type: "coberta",    surface: "saibro", active: true, usageMinutesDry: 60, usageMinutesRain: 60, intervalMinutes: 15, deactivateStart: null, deactivateEnd: null },
    { id: 2, name: "Quadra 2", type: "coberta",    surface: "hard",   active: true, usageMinutesDry: 60, usageMinutesRain: 60, intervalMinutes: 15, deactivateStart: null, deactivateEnd: null },
    { id: 3, name: "Quadra 3", type: "descoberta", surface: "saibro", active: true, usageMinutesDry: 60, usageMinutesRain: 0,  intervalMinutes: 15, deactivateStart: null, deactivateEnd: null },
    { id: 4, name: "Quadra 4", type: "descoberta", surface: "grama",  active: true, usageMinutesDry: 60, usageMinutesRain: 0,  intervalMinutes: 15, deactivateStart: null, deactivateEnd: null },
  ]

  const mockReservations: Reservation[] = [
    {
      id: 1, courtId: 1, courtName: "Quadra 1",
      playerName: "Ana Silva",
      playerPhone: "11999990001",
      players: [{ name: "Ana Silva", phone: "11999990001", memberId: "1001" }],
      gameType: "simples",
      startTime: addHours(-0.5),
      endTime:   addHours(0.5),
      status: "em uso",
    },
    {
      id: 2, courtId: 2, courtName: "Quadra 2",
      playerName: "João Lima, Maria Costa",
      playerPhone: "11999990010",
      players: [{ name: "João Lima", phone: "11999990010" }, { name: "Maria Costa" }],
      gameType: "duplas",
      startTime: addHours(0.5),
      endTime:   addHours(2),
      status: "agendada",
    },
  ]

  const mockBlocks: AdminBlock[] = [
    {
      id: 1, title: "Aula Iniciantes", category: "aula",
      courtIds: [3], date: dateStr,
      startTime: "08:00", endTime: "10:00",
      recurring: "nenhuma", notes: "Prof. Carlos",
    },
  ]

  return buildCourtsStatus(mockCourts, mockReservations, mockBlocks, false, now, dateStr)
}

export async function GET() {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)

  // Sem banco configurado, retorna dados mockados para facilitar o desenvolvimento
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(buildMockStatus(now, dateStr))
  }

  try {
    // Imports dinâmicos intencionais: lib/db dispara erro em nível de módulo quando
    // DATABASE_URL não está definida, então não pode ser importado estaticamente.
    // O guard acima garante que chegamos aqui apenas quando DATABASE_URL está presente.
    const { db } = await import("@/lib/db")
    const { courts, reservations, adminBlocks, settings } = await import("@/lib/db/schema")
    const { and, gte, lte, eq, or } = await import("drizzle-orm")

    const [allCourts, allReservations, allBlocks, rainSetting] = await Promise.all([
      db.select().from(courts),
      db.select().from(reservations).where(
        and(
          lte(reservations.startTime, new Date(now.getTime() + 24 * 60 * 60 * 1000)),
          gte(reservations.endTime,   new Date(now.getTime() - 24 * 60 * 60 * 1000))
        )
      ),
      db.select().from(adminBlocks).where(
        or(
          eq(adminBlocks.date, dateStr),
          eq(adminBlocks.recurring, "semanal")
        )
      ),
      db.select().from(settings).where(eq(settings.key, "rain_mode")).limit(1),
    ])

    const rainMode = rainSetting[0]?.value === "1"

    return NextResponse.json(buildCourtsStatus(allCourts, allReservations, allBlocks, rainMode, now, dateStr))
  } catch (err) {
    console.error("Erro no status das quadras:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
