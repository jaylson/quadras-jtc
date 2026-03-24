# 🎾 JTC – CourtSync | CLAUDE.md

Guia de contexto do projeto para o Claude. Leia este arquivo antes de qualquer tarefa de desenvolvimento.

---

## Visão Geral do Projeto

**JTC (CourtSync)** é uma aplicação web de gestão de quadras de tênis para clubes.
Três interfaces distintas atendem públicos diferentes:

| Interface | Rota | Autenticação | Dispositivo |
|---|---|---|---|
| Admin (Gestor) | `/admin` | Sim (NextAuth) | Desktop |
| Totem (Tenista) | `/totem` | Não (público) | Tablet touch |
| TV Dashboard | `/tv` | Não (público) | TV / kiosk |

- **Referência completa:** [`especificacao-requisitos-jtc.md`](./especificacao-requisitos-jtc.md)
- **Plano de trabalho:** [`plano_trabalho.md`](./plano_trabalho.md)
- **Guia de banco:** [`.claude/guides/database.md`](.claude/guides/database.md) — inclui credenciais Azure e estratégia de mock

> **⚠️ Fase atual:** dados mockados em `lib/mock/`. A conexão real ao Azure MySQL é feita na task F1-08.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | **Next.js 14+** com App Router |
| Linguagem | **TypeScript 5+** (strict mode) |
| Banco de Dados | **Azure MySQL** (`newdataserver.mysql.database.azure.com`) |
| ORM | **Drizzle ORM** |
| Autenticação | **NextAuth.js v5** (Auth.js) |
| Componentes UI | **shadcn/ui** |
| Estilização | **Tailwind CSS v4** + shadcn/ui |
| Fontes | DM Serif Display + DM Sans (Google Fonts) |
| WhatsApp | Z-API / Evolution API |
| Testes E2E | Playwright |
| Testes Unit | Vitest + Testing Library |
| Deploy | Vercel |

---

## Estrutura de Pastas (alvo)

```
quadras-jtc/
├── apps/
│   ├── web/                    # Next.js App
│   │   ├── app/
│   │   │   ├── (admin)/        # Rotas protegidas do Admin
│   │   │   │   ├── admin/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── login/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── totem/          # Check-in público
│   │   │   │   └── page.tsx
│   │   │   ├── tv/             # Dashboard público
│   │   │   │   └── page.tsx
│   │   │   ├── api/            # Route Handlers
│   │   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   │   ├── courts/route.ts
│   │   │   │   ├── blocks/route.ts
│   │   │   │   ├── reservations/route.ts
│   │   │   │   └── settings/route.ts
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx        # Landing Page
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── totem/
│   │   │   ├── tv/
│   │   │   └── ui/             # Componentes reutilizáveis
│   │   ├── lib/
│   │   │   ├── db/             # Drizzle schema + migrations
│   │   │   ├── auth.ts         # Configuração NextAuth
│   │   │   └── utils/          # Funções utilitárias
│   │   └── ...
│   └── api/                    # (opcional) API separada
├── .claude/                    # Configurações do Claude
├── CLAUDE.md                   # Este arquivo
├── plano_trabalho.md
└── especificacao-requisitos-jtc.md
```

---

## shadcn/ui no Projeto

### Instalação

```bash
npx shadcn@latest init        # configura components.json + globals.css
npx shadcn@latest add button input label dialog select switch badge card separator table tabs toggle tooltip alert-dialog
```

### Configuração (`components.json`)

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": { "cssVariables": true },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Override de Tema (em `globals.css`)

O shadcn/ui usa variáveis CSS (`--primary`, `--radius`, etc.). Além do reset padrão, **sobrescreva** com os tokens JTC:

```css
:root {
  /* shadcn primary → verde JTC */
  --primary:        151 55% 18%;   /* #1B4332 em HSL */
  --primary-foreground: 0 0% 100%;

  /* Raios de borda */
  --radius: 0.75rem;               /* 12px */

  /* Mantém variantes próprias JTC */
  --color-saibro:  #c4753b;
  --color-hard:    #3b82c4;
  --color-grama:   #4ade80;
}
```

### Mapeamento de Componentes por Módulo

| Componente JTC | shadcn/ui base | Observações |
|---|---|---|
| Login form | `Input` + `Button` + `Label` | Overlay com `Dialog` |
| Modal de Quadra / Trava | `Dialog` + `DialogContent` | Substitui modal manual |
| Exclusão com confirmação | `AlertDialog` | RF-18 e RF-27 |
| Toggle Modo Chuva | `Switch` | Estilizado com cor laranja via `data-[state=checked]` |
| Abas Admin (Quadras / Agenda) | `Tabs` + `TabsList` + `TabsContent` | RF-11 |
| Status de quadra | `Badge` | Variantes custom: `em-uso`, `livre`, `chuva`, `manutencao` |
| Categoria de trava | `Badge` | Cor via `className` dinâmico |
| Tabela TV Dashboard | `Table` | RF-32 |
| Filtros Totem (pills) | `Toggle` / `ToggleGroup` | RF-22 |
| Cards de estatística Admin | `Card` + `CardContent` | RF-05 |
| Select de categoria/tipo | `Select` | `BlockModal`, `CourtModal` |
| Tooltip de tempo restante | `Tooltip` | TV + Totem |

> ⚠️ **Não substitua componentes com HTML puro** quando houver um equivalente shadcn/ui.
> Use `cn()` (de `lib/utils.ts`) para mesclar classes Tailwind com variantes.

---

## Design System

### Paleta de Cores

```css
/* Verdes institucionais */
--color-primary-900: #1B4332;   /* Principal */
--color-primary-700: #2D6A4F;
--color-primary-500: #40916C;

/* Superfícies de quadra */
--color-saibro:  #c4753b;       /* Terracota */
--color-hard:    #3b82c4;       /* Azul */
--color-grama:   #4ade80;       /* Verde */

/* Categorias de trava */
--color-aula:        #3b82f6;
--color-campeonato:  #7c3aed;
--color-evento:      #f59e0b;
--color-manutencao:  #6b7280;
--color-outro:       #0d9488;
```

### Tipografia

- **Headings:** DM Serif Display
- **Corpo:** DM Sans
- **Border-radius:** 12px (cards grandes) / 8px (elementos internos)
- **Animações:** 0.2s–0.3s ease para transições suaves

---

## Funções Utilitárias Core

Estas funções são críticas para a lógica de negócio e devem ter testes completos:

| Função | Localização | Responsabilidade |
|---|---|---|
| `formatTime(date)` | `lib/utils/format.ts` | DateTime → HH:MM (pt-BR) |
| `formatDate(date)` | `lib/utils/format.ts` | DateTime → DD/MM/AAAA (pt-BR) |
| `getEffectiveUsage(court, isRaining)` | `lib/utils/courts.ts` | Duração real conforme clima |
| `getNextAvailableSlot(court, reservations, isRaining)` | `lib/utils/courts.ts` | Próximo slot disponível |
| `getCourtStatus(court, reservations, isRaining)` | `lib/utils/courts.ts` | Status em tempo real da quadra |
| `getCategoryConfig(key)` | `lib/utils/blocks.ts` | Configuração visual de categoria |

---

## Regras de Negócio Críticas

> Consultar [`especificacao-requisitos-jtc.md`](./especificacao-requisitos-jtc.md) seção 5 para detalhes completos.

- **RN-02 / RN-09:** Modo Chuva bloqueia automaticamente quadras `type=descoberta` com `usageMinutesRain=0`
- **RN-06:** Próximo slot = `lastReservation.endTime + intervalMinutes`, arredondado para múltiplo de 5min
- **RN-07:** Simples = exatamente 2 jogadores | Duplas = 3 a 4 jogadores
- **RN-08:** Jogador 1 → nome + WhatsApp obrigatórios | restantes → somente nome obrigatório

---

## Convenções de Código

### TypeScript

- **Strict mode** habilitado — sem `any` implícito
- Prefira `type` para tipos compostos e `interface` para contratos de componente
- Todas as funções utilitárias devem ter JSDoc com `@param` e `@returns`

### Nomenclatura

- **Componentes:** PascalCase (`CourtCard.tsx`)
- **Utilitários/hooks:** camelCase (`useCourtStatus.ts`)
- **Schemas Drizzle:** camelCase para colunas, snake_case para nomes de tabela
- **API routes:** kebab-case nas URLs (`/api/rain-mode`)

### Commits (Conventional Commits)

```
feat(admin): adicionar modal de edição de quadra
fix(totem): corrigir cálculo de slot com intervalos
docs: atualizar plano de trabalho com F2-01
test(utils): adicionar testes para getNextAvailableSlot
```

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor Next.js (porta 3000)

# Banco de Dados
npm run db:generate  # Gera migrations Drizzle
npm run db:migrate   # Executa migrations
npm run db:seed      # Popula banco com dados de exemplo
npm run db:studio    # Abre Drizzle Studio

# Testes
npm run test         # Vitest (unit)
npm run test:e2e     # Playwright (E2E)
npm run test:cov     # Cobertura de testes

# Build
npm run build        # Build de produção
npm run lint         # ESLint
npm run typecheck    # tsc sem emissão
```

---

## Guias por Módulo

| Módulo | Arquivo de referência |
|---|---|
| Admin – Visão geral | [`.claude/guides/admin.md`](.claude/guides/admin.md) |
| Totem – Check-in | [`.claude/guides/totem.md`](.claude/guides/totem.md) |
| TV Dashboard | [`.claude/guides/tv.md`](.claude/guides/tv.md) |
| Banco de Dados | [`.claude/guides/database.md`](.claude/guides/database.md) |
| Autenticação | [`.claude/guides/auth.md`](.claude/guides/auth.md) |

---

## Skills Disponíveis

| Skill | Arquivo | Quando Usar |
|---|---|---|
| **frontend-design** | [`.claude/skills/frontend-design/SKILL.md`](.claude/skills/frontend-design/SKILL.md) | Ao criar qualquer componente, página ou layout de UI |

> Ao receber uma tarefa de interface, leia o `SKILL.md` correspondente **antes de codificar**.
> O arquivo contém diretrizes de aplicação específicas para o JTC na seção final.

---

## Estado Atual do Projeto

- **Status:** 🟡 Planejamento — nenhuma linha de código de produção ainda
- **Próximo passo:** FASE 1 — Inicializar monorepo Next.js e configurar ambiente
- **Plano detalhado:** [`plano_trabalho.md`](./plano_trabalho.md)
