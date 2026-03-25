/** Configurações globais do sistema */
export const mockSettings = {
  rainMode: false,
} as const

export type Settings = typeof mockSettings
