import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { settings } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

/** F2-15 – Obter configurações globais */
export async function GET() {
  const [rainSetting] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "rain_mode"))
    .limit(1)

  const rainMode = rainSetting?.value === "1"
  return NextResponse.json({ rainMode })
}
