# Guia – Módulo Admin

Referência rápida para implementação do painel administrativo.

## Rotas

| Rota | Componente Principal | Proteção |
|---|---|---|
| `/admin/login` | `AdminLogin` | Pública |
| `/admin` | `AdminPanel` | NextAuth (`useSession`) |

## Funcionalidades (por RF)

### Dashboard de Quadras (RF-05 a RF-10)

- Aba padrão: **Quadras**
- Header mostra botão contextual: "Nova Quadra" (aba Quadras) / "Nova Trava" (aba Agenda)
- **Cards de estatística** no topo: total ativas / em uso agora / bloqueadas por chuva
- **Toggle Modo Chuva** → cor laranja quando ativo, verde quando inativo
- **Grid de CourtCards** → RF-07: cada card tem nome, badge ativo/inativo, tipo, superfície, tempos, intervalo
- **Toggle rápido** no card alterna `active` sem abrir modal

### CRUD de Quadras

**CourtModal** (cadastro + edição):
- Campos: `name`, `type` (coberta/descoberta), `surface` (saibro/hard/grama)
- Tempos: `usageMinutesDry`, `usageMinutesRain` (0 = bloqueada), `intervalMinutes`
- Período de desativação: `deactivateStart` + `deactivateEnd` (opcional)

### Módulo de Agenda – Travas (RF-11 a RF-18)

- **WeeklyCalendar**: grade 7 dias (seg–dom), horário 06h–22h
- Blocos posicionados por CSS com `top` e `height` calculados com base em horário
- Cores por categoria: ver `getCategoryConfig()` e design system no CLAUDE.md
- **BlockModal** → título + categoria + recorrência + data + hora início/fim + quadras (multi) + observações
- Recorrência `semanal` → gera instâncias para cada semana a partir da data original

## Estado e Dados

```typescript
// Exemplo de tipagem esperada para CourtCard
interface Court {
  id: string
  name: string
  type: 'coberta' | 'descoberta'
  surface: 'saibro' | 'hard' | 'grama'
  active: boolean
  deactivateStart: Date | null
  deactivateEnd: Date | null
  usageMinutesDry: number    // padrão: 60
  usageMinutesRain: number   // 0 = bloqueada na chuva
  intervalMinutes: number    // padrão: 15
}
```
