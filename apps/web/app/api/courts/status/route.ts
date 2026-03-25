import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import { getCourtStatus, getRemainingMinutes } from "@/lib/utils/courts"

/**
 * F2-18 – Status em tempo real de todas as quadras (para TV e Totem).
 * Implementa RN-03 (cálculo de status) e RN-04 (tempo restante com Math.ceil).
 *
 * Resposta: Court + status calculado + reserva ativa + próximo slot
 */
export async function GET() {
  const store = getStore()
  const now = new Date()

  const result = store.courts.map((court) => {
    const status = getCourtStatus(court, store.reservations, store.rainMode)

    // Reserva ativa agora (para TV mostrar jogadores e tempo restante)
    const activeReservation = store.reservations.find(
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

    const todayReservations = store.reservations
      .filter(
        (r) =>
          r.courtId === court.id &&
          new Date(r.startTime) >= startOfToday &&
          new Date(r.endTime) <= endOfToday
      )
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    // Calcular o próximo horário livre
    // Simplificadamente: se o status for 'disponivel', o próximo horário livre é "Agora"
    // Se estiver ocupado, o próximo horário livre é o endTime da última reserva contínua a partir de agora.
    let nextFreeSlot = "Agora"
    if (status === "em-uso") {
        let currentEnd = activeReservation ? new Date(activeReservation.endTime) : now
        
        // Verifica se tem reservas emendadas e pega o final da última emendada
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
        
        // format HH:mm
        nextFreeSlot = currentEnd.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }

    return {
      court,
      status,                // 'em-uso' | 'disponivel' | 'bloqueada-chuva' | 'inativa'
      activeReservation,
      remainingMinutes,
      rainMode: store.rainMode,
      todayReservations,     // Adicionado para modo cards
      nextFreeSlot,          // Adicionado para modo cards
    }
  })

  // F2-19: ordenação por prioridade (RF-34)
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
}
