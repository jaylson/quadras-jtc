import type { Reservation } from "@/lib/db/schema"

const now = new Date()

function hoursFromNow(h: number) {
  return new Date(now.getTime() + h * 60 * 60 * 1000)
}

/** Reservas ativas de exemplo */
export const mockReservations: Reservation[] = [
  {
    id: 1,
    courtId: 1,
    courtName: "Quadra 1",
    playerName: "Ana Silva, Carlos Mendes",
    playerPhone: "11999990001",
    players: [
      { name: "Ana Silva",    phone: "11999990001", memberId: "1001" },
      { name: "Carlos Mendes", phone: "11999990002" },
    ],
    gameType: "simples",
    startTime: hoursFromNow(-0.5),  // em uso: iniciou há 30 min
    endTime:   hoursFromNow(0.5),   // termina em 30 min
    status: "em uso",
  },
  {
    id: 2,
    courtId: 2,
    courtName: "Quadra 2",
    playerName: "João Lima, Maria Costa, Pedro Alves, Luiza Ferreira",
    playerPhone: "11999990010",
    players: [
      { name: "João Lima",      phone: "11999990010", memberId: "2001" },
      { name: "Maria Costa",    phone: "11999990011" },
      { name: "Pedro Alves",    memberId: "2003" },
      { name: "Luiza Ferreira" },
    ],
    gameType: "duplas",
    startTime: hoursFromNow(0.5),   // agendada para daqui 30 min
    endTime:   hoursFromNow(2),
    status: "agendada",
  },
]
