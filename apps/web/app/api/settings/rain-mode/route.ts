import { NextResponse } from "next/server"
import { getStore } from "@/lib/data/store"

/**
 * F2-16 – Alternar modo chuva.
 * Aceita body { rainMode: boolean } para definir o valor, ou alterna se não informado.
 * Implementa base para RN-02 e RN-09 (filtro de quadras por clima) — a lógica
 * de aplicação dessas regras está em GET /api/courts/status.
 */
export async function PATCH(req: Request) {
  const store = getStore()

  try {
    const body = await req.json() as { rainMode?: boolean }
    // Se body.rainMode não informado, alterna o valor atual
    store.rainMode = body.rainMode !== undefined ? body.rainMode : !store.rainMode
  } catch {
    // Body vazio ou inválido → alterna
    store.rainMode = !store.rainMode
  }

  return NextResponse.json({ rainMode: store.rainMode })
}
