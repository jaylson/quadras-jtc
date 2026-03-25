import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"
import { getNextAvailableSlot, getEffectiveUsage } from "@/lib/utils/courts"

/**
 * F2-12 – Calcular próximo slot disponível para uma quadra.
 * Implementa RN-06: lastReservation.endTime + intervalMinutes, arredondado a 5min.
 *
 * Query params: courtId (obrigatório)
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courtId = Number(searchParams.get("courtId"))

  if (!courtId || isNaN(courtId)) {
    return NextResponse.json({ error: "courtId é obrigatório" }, { status: 400 })
  }

  const store = getStore()
  const court = store.courts.find((c) => c.id === courtId)

  if (!court) {
    return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 })
  }

  const startTime      = getNextAvailableSlot(court, store.reservations, store.rainMode)
  const durationMinutes = getEffectiveUsage(court, store.rainMode)
  const endTime        = new Date(startTime.getTime() + durationMinutes * 60_000)

  return NextResponse.json({
    courtId,
    courtName:       court.name,
    startTime:       startTime.toISOString(),
    endTime:         endTime.toISOString(),
    durationMinutes,
    rainMode:        store.rainMode,
  })
}
