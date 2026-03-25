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

    return {
      court,
      status,                // 'em-uso' | 'disponivel' | 'bloqueada-chuva' | 'inativa'
      activeReservation,
      remainingMinutes,
      rainMode: store.rainMode,
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
