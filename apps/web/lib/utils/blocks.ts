/** Configuração visual de cada categoria de trava */
export type CategoryConfig = {
  key:       string
  label:     string
  emoji:     string
  color:     string   // cor primária (texto/borda)
  bgColor:   string   // cor de fundo do badge
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  aula: {
    key:     "aula",
    label:   "Aula",
    emoji:   "🎓",
    color:   "#3b82f6",
    bgColor: "#dbeafe",
  },
  campeonato: {
    key:     "campeonato",
    label:   "Campeonato",
    emoji:   "🏆",
    color:   "#7c3aed",
    bgColor: "#ede9fe",
  },
  evento: {
    key:     "evento",
    label:   "Evento / Marketing",
    emoji:   "🎉",
    color:   "#f59e0b",
    bgColor: "#fef3c7",
  },
  manutencao: {
    key:     "manutencao",
    label:   "Manutenção",
    emoji:   "🔧",
    color:   "#6b7280",
    bgColor: "#f3f4f6",
  },
  outro: {
    key:     "outro",
    label:   "Outro",
    emoji:   "📌",
    color:   "#0d9488",
    bgColor: "#ccfbf1",
  },
}

/**
 * Retorna a configuração visual de uma categoria de trava.
 * @param key - Chave da categoria
 */
export function getCategoryConfig(key: string): CategoryConfig {
  return CATEGORY_MAP[key] ?? CATEGORY_MAP["outro"]
}

export const ALL_CATEGORIES = Object.values(CATEGORY_MAP)
