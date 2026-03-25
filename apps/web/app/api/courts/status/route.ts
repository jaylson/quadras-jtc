import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courts, reservations, adminBlocks, settings } from "@/lib/db/schema"
import { getCourtStatus, getRemainingMinutes } from "@/lib/utils/courts"
import { and, gte, lte, eq, or } from "drizzle-orm"

/**
 * F2-18 – Status em tempo real de todas as quadras (para TV e Totem).
 * Implementa RN-03 (cálculo de status) e RN-04 (tempo restante com Math.ceil).
 */
export async function GET() {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)

  try {
    // 1. Fetch data from DB
    const [allCourts, allReservations, allBlocks, rainSetting] = await Promise.all([
      db.select().from(courts),
      db.select().from(reservations).where(
        and(
          lte(reservations.startTime, new Date(now.getTime() + 24 * 60 * 60 * 1000)),
          gte(reservations.endTime, new Date(now.getTime() - 24 * 60 * 60 * 1000))
        )
      ),
      db.select().from(adminBlocks).where(
          or(
              eq(adminBlocks.date, dateStr),
              eq(adminBlocks.recurring, "semanal")
          )
      ),
      db.select().from(settings).where(eq(settings.key, "rain_mode")).limit(1)
    ])

    const rainMode = rainSetting[0]?.value === "1"

    const result = allCourts.map((court) => {
      // Calcular status
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

      // Todas as reservas de hoje para essa quadra
      const startOfToday = new Date(now)
      startOfToday.setHours(0, 0, 0, 0)
      const endOfToday = new Date(now)
      endOfToday.setHours(23, 59, 59, 999)

      const todayReservations = allReservations
        .filter(
          (r) =>
            r.courtId === court.id &&
            new Date(r.startTime) >= startOfToday &&
            new Date(r.endTime) <= endOfToday
        )
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
        todayBlocks, // Enviando as travas para a TV
        nextFreeSlot,
      }
    })

    // Ordenação
    const priority: Record<string, number> = {
      "em-uso":         0,
      "disponivel":     1,
      "bloqueada-chuva":2,
      "inativa":        3,
    }

    result.sort((a, b) => {
      const diff = priority[a.status] - priority[b.status]
      return diff !== 0 ? diff : a.court.name.localeCompare(b.court.name)
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error("Erro no status das quadras:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
