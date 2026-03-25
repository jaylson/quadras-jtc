import type { AdminBlock } from "@/lib/db/schema"

/** Travas de exemplo para desenvolvimento */
export const mockBlocks: AdminBlock[] = [
  {
    id: 1,
    title: "Aula Iniciantes",
    category: "aula",
    courtIds: [1, 2],
    date: "2026-03-25",
    startTime: "08:00",
    endTime: "10:00",
    recurring: "semanal",
    notes: "Prof. Carlos",
  },
  {
    id: 2,
    title: "Campeonato Club Open",
    category: "campeonato",
    courtIds: [1, 2, 3, 4],
    date: "2026-03-29",
    startTime: "09:00",
    endTime: "18:00",
    recurring: "nenhuma",
    notes: null,
  },
  {
    id: 3,
    title: "Manutenção Rede",
    category: "manutencao",
    courtIds: [3],
    date: "2026-03-26",
    startTime: "07:00",
    endTime: "09:00",
    recurring: "nenhuma",
    notes: "Troca de rede e fitas",
  },
]
