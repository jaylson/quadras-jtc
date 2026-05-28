import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getEffectiveUsage, getCourtStatus, getNextAvailableSlot } from "./courts"
import type { Court, Reservation, AdminBlock } from "@/lib/db/schema"

describe("courts util", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-03-25T10:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mockCourt: Court = {
    id: 1,
    name: "Quadra 1",
    type: "descoberta",
    surface: "saibro",
    active: true,
    deactivateStart: null,
    deactivateEnd: null,
    usageMinutesDrySingles: 60,
    usageMinutesDryDoubles: 90,
    usageMinutesRainSingles: 0,
    usageMinutesRainDoubles: 0,
    intervalMinutes: 10,
  }

  describe("getEffectiveUsage", () => {
    it("retorna tempo seco para simples", () => {
      expect(getEffectiveUsage(mockCourt, false, "simples")).toBe(60)
    })

    it("retorna tempo seco para duplas", () => {
      expect(getEffectiveUsage(mockCourt, false, "duplas")).toBe(90)
    })

    it("retorna tempo chuva para simples", () => {
      const coveredCourt: Court = { ...mockCourt, type: "coberta", usageMinutesRainSingles: 45 }
      expect(getEffectiveUsage(coveredCourt, true, "simples")).toBe(45)
    })
  })

  describe("getCourtStatus", () => {
    it("retorna inativa se a quadra estiver inativa", () => {
      const inactiveCourt = { ...mockCourt, active: false }
      expect(getCourtStatus(inactiveCourt, [], [], false)).toBe("inativa")
    })

    it("retorna bloqueada-chuva se descoberta e ambos tempos de chuva forem 0", () => {
      expect(getCourtStatus(mockCourt, [], [], true)).toBe("bloqueada-chuva")
    })

    it("retorna em-uso se houver reserva ativa", () => {
      const activeReservation = {
        id: 1,
        courtId: 1,
        courtName: "Quadra 1",
        playerName: "Ana",
        playerPhone: "11999999999",
        players: [{ name: "Ana" }, { name: "Bia" }],
        gameType: "simples",
        startTime: new Date("2026-03-25T09:30:00Z"),
        endTime: new Date("2026-03-25T10:30:00Z"),
        status: "em uso",
      } as Reservation

      expect(getCourtStatus(mockCourt, [activeReservation], [], false)).toBe("em-uso")
    })

    it("retorna inativa quando existe bloqueio administrativo ativo", () => {
      const activeBlock: AdminBlock = {
        id: 1,
        title: "Manutenção",
        category: "manutencao",
        courtIds: [1],
        date: "2026-03-25",
        startTime: "09:00",
        endTime: "11:00",
        recurring: "nenhuma",
        notes: null,
      }

      expect(getCourtStatus(mockCourt, [], [activeBlock], false)).toBe("inativa")
    })
  })

  describe("getNextAvailableSlot", () => {
    it("sem reservas: usa agora arredondado para 5min", () => {
      const slot = getNextAvailableSlot(mockCourt, [], false)
      expect(slot.toISOString()).toBe("2026-03-25T10:00:00.000Z")
    })

    it("com reserva ativa: soma intervalMinutes ao fim", () => {
      const reservations = [
        {
          id: 1,
          courtId: 1,
          courtName: "Quadra 1",
          playerName: "Ana",
          playerPhone: "11999999999",
          players: [{ name: "Ana" }, { name: "Bia" }],
          gameType: "simples",
          startTime: new Date("2026-03-25T10:30:00Z"),
          endTime: new Date("2026-03-25T11:30:00Z"),
          status: "em uso",
        } as Reservation,
      ]

      const slot = getNextAvailableSlot(mockCourt, reservations, false)
      expect(slot.toISOString()).toBe("2026-03-25T11:40:00.000Z")
    })
  })
})
