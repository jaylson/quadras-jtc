/**
 * Store em memória para desenvolvimento (fase de dados mockados).
 *
 * Usa globalThis para sobreviver ao hot-reload do Next.js em dev.
 * Ao integrar o Azure MySQL (F1-16), substituir as leituras/escritas
 * aqui pelas chamadas Drizzle correspondentes.
 */
import { mockCourts }       from "@/lib/mock/courts"
import { mockBlocks }       from "@/lib/mock/blocks"
import { mockReservations } from "@/lib/mock/reservations"
import { mockSettings }     from "@/lib/mock/settings"
import type { Court, AdminBlock, Reservation } from "@/lib/db/schema"

interface Store {
  courts:       Court[]
  blocks:       AdminBlock[]
  reservations: Reservation[]
  rainMode:     boolean
  nextId:       { courts: number; blocks: number; reservations: number }
}

declare global {
  // eslint-disable-next-line no-var
  var __jtcStore: Store | undefined
}

function createStore(): Store {
  return {
    courts:       structuredClone(mockCourts),
    blocks:       structuredClone(mockBlocks),
    reservations: structuredClone(mockReservations),
    rainMode:     mockSettings.rainMode,
    nextId: {
      courts:       mockCourts.length + 1,
      blocks:       mockBlocks.length + 1,
      reservations: mockReservations.length + 1,
    },
  }
}

export function getStore(): Store {
  if (!globalThis.__jtcStore) {
    globalThis.__jtcStore = createStore()
  }
  return globalThis.__jtcStore
}
