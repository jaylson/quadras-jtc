import type { Court } from "@/lib/db/schema"

/** 4 quadras de exemplo — substituir por db.select().from(courts) ao integrar o banco */
export const mockCourts: Court[] = [
  {
    id: 1,
    name: "Quadra 1",
    type: "coberta",
    surface: "saibro",
    active: true,
    deactivateStart: null,
    deactivateEnd: null,
    usageMinutesDry: 60,
    usageMinutesRain: 60,
    intervalMinutes: 15,
  },
  {
    id: 2,
    name: "Quadra 2",
    type: "coberta",
    surface: "hard",
    active: true,
    deactivateStart: null,
    deactivateEnd: null,
    usageMinutesDry: 60,
    usageMinutesRain: 60,
    intervalMinutes: 15,
  },
  {
    id: 3,
    name: "Quadra 3",
    type: "descoberta",
    surface: "saibro",
    active: true,
    deactivateStart: null,
    deactivateEnd: null,
    usageMinutesDry: 60,
    usageMinutesRain: 0,   // bloqueada na chuva
    intervalMinutes: 15,
  },
  {
    id: 4,
    name: "Quadra 4",
    type: "descoberta",
    surface: "grama",
    active: true,
    deactivateStart: null,
    deactivateEnd: null,
    usageMinutesDry: 90,
    usageMinutesRain: 0,   // bloqueada na chuva
    intervalMinutes: 20,
  },
]
