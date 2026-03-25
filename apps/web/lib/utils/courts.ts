import type { Court, Reservation, AdminBlock } from "@/lib/db/schema"

/**
 * Formata um Date para HH:MM no locale pt-BR.
 * @param date - Data/hora a formatar
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Formata um Date para DD/MM/AAAA no locale pt-BR.
 * @param date - Data a formatar
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day:   "2-digit",
    month: "2-digit",
    year:  "numeric",
  })
}

/**
 * Retorna a duração efetiva de uso em minutos conforme condição climática. (RN-09)
 * @param court - Quadra
 * @param isRaining - Se está chovendo
 */
export function getEffectiveUsage(court: Court, isRaining: boolean): number {
  return isRaining ? court.usageMinutesRain : court.usageMinutesDry
}

/**
 * Calcula o próximo slot disponível para uma quadra. (RN-06)
 * Regra: lastReservation.endTime + intervalMinutes, arredondado para múltiplo de 5min.
 * Se não há reserva ativa, começa imediatamente (arredondado para próximo múltiplo de 5min).
 *
 * @param court - Quadra
 * @param reservations - Reservas ativas da quadra
 * @param isRaining - Condição climática
 */
export function getNextAvailableSlot(
  court: Court,
  reservations: Reservation[],
  isRaining: boolean
): Date {
  const courtReservations = reservations
    .filter((r) => r.courtId === court.id && r.status !== "concluída")
    .sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime())

  const now = new Date()
  let slotStart: Date

  if (courtReservations.length > 0) {
    const lastRes = courtReservations[0]
    const lastEnd = new Date(lastRes.endTime)
    // Se a última reserva já for uma "Preparação", não adicionamos o intervalo novamente
    const isPrep = lastRes.playerName.includes("Preparação")
    const gap = isPrep ? 0 : court.intervalMinutes
    slotStart = new Date(lastEnd.getTime() + gap * 60 * 1000)
    if (slotStart < now) {
      slotStart = now
    }
  } else {
    slotStart = now
  }

  // Arredondar para próximo múltiplo de 5 minutos (RN-06)
  const minutes = slotStart.getMinutes()
  const remainder = minutes % 5
  if (remainder !== 0) {
    slotStart.setMinutes(minutes + (5 - remainder))
  }
  slotStart.setSeconds(0, 0)

  return slotStart
}

/**
 * Determina o status atual de uma quadra em tempo real. (RN-03)
 * @returns 'em-uso' | 'disponivel' | 'bloqueada-chuva' | 'inativa'
 */
export function getCourtStatus(
  court: Court,
  reservations: Reservation[],
  blocks: AdminBlock[],
  isRaining: boolean
): "em-uso" | "disponivel" | "bloqueada-chuva" | "inativa" {
  // RN-01: quadra inativa
  if (!court.active) return "inativa"

  // RN-02: quadra descoberta bloqueada pela chuva
  if (isRaining && court.type === "descoberta" && court.usageMinutesRain === 0) {
    return "bloqueada-chuva"
  }

  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const currentTime = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", hour12: false })

  // RF-36: Verificar se há uma trava administrativa ativa
  const activeBlock = blocks.find(b => {
    if (!b.courtIds.includes(court.id)) return false

    // Verifica se a trava é para hoje (data exata ou recorrência semanal)
    let matchesToday = b.date === dateStr
    if (!matchesToday && b.recurring === "semanal") {
      const blockDay = new Date(b.date).getDay()
      const todayDay = now.getDay()
      matchesToday = blockDay === todayDay && b.date <= dateStr
    }

    if (!matchesToday) return false
    return currentTime >= b.startTime && currentTime < b.endTime
  })

  if (activeBlock) return "inativa"

  // RN-03: verificar reserva ativa no momento
  const active = reservations.find(
    (r) =>
      r.courtId === court.id &&
      new Date(r.startTime) <= now &&
      new Date(r.endTime) > now
  )

  return active ? "em-uso" : "disponivel"
}

/**
 * Retorna os minutos restantes de uso de uma quadra. (RN-04)
 * Usa Math.ceil conforme especificação.
 */
export function getRemainingMinutes(reservation: Reservation): number {
  const now = new Date()
  const end = new Date(reservation.endTime)
  return Math.ceil((end.getTime() - now.getTime()) / 60_000)
}
