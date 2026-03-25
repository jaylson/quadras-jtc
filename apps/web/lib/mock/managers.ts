import type { Manager } from "@/lib/db/schema"

/** Responsáveis de exemplo — substituir por db.select().from(managers) ao integrar o banco */
export const mockManagers: Manager[] = [
  { id: 1, name: "Carlos Mendes", phone: "(41) 99999-1111", shifts: ["manha-seg", "tarde-seg"],         active: true  },
  { id: 2, name: "Ana Ferreira",  phone: "(41) 99999-2222", shifts: ["tarde-seg", "noite-seg"],         active: true  },
  { id: 3, name: "Roberto Silva", phone: "(41) 99999-3333", shifts: ["manha-fds", "tarde-fds"],         active: false },
]

