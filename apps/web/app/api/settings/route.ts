import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"

/** F2-15 – Obter configurações globais */
export async function GET() {
  const store = getStore()
  return NextResponse.json({ rainMode: store.rainMode })
}
