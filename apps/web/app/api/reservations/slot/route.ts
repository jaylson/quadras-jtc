import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { courts, reservations, settings } from "@/lib/db/schema"
import { getNextAvailableSlot, getEffectiveUsage } from "@/lib/utils/courts"
import { and, eq, gt, ne } from "drizzle-orm"

/**
 * F2-12 – Calcular próximo slot disponível para uma quadra.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const courtId = Number(searchParams.get("courtId"))

  if (!courtId || isNaN(courtId)) {
    return NextResponse.json({ error: "courtId é obrigatório" }, { status: 400 })
  }

  try {
    const [court] = await db.select().from(courts).where(eq(courts.id, courtId)).limit(1)
    if (!court) {
      return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 })
    }

    const [rainSetting] = await db.select().from(settings).where(eq(settings.key, "rain_mode")).limit(1)
    const rainMode = rainSetting?.value === "1"
    
    const now = new Date()
    const allReservations = await db.select().from(reservations).where(
        and(
            eq(reservations.courtId, courtId),
            ne(reservations.status, "concluída"),
            gt(reservations.endTime, now)
        )
    )

    const startTime = getNextAvailableSlot(court, allReservations, rainMode)
    const durationMinutes = getEffectiveUsage(court, rainMode)
    const endTime = new Date(startTime.getTime() + durationMinutes * 60_000)

    return NextResponse.json({
      courtId,
      courtName:       court.name,
      startTime:       startTime.toISOString(),
      endTime:         endTime.toISOString(),
      durationMinutes,
      rainMode,
    })
  } catch (err) {
    console.error("Erro ao carregar slot:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
