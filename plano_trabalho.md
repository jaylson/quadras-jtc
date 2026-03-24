# 🎾 JTC – Plano de Trabalho

> **Projeto:** JTC – Sistema de Gestão de Quadras de Tênis  
> **Versão:** 1.0  
> **Data de Início:** Março de 2026  
> **Status:** 🟡 Em Planejamento  
> **Referência:** [Especificação de Requisitos v1.0](./especificacao-requisitos-jtc.md)

---

## Visão Geral

O JTC é uma aplicação web para gestão de quadras de tênis em clubes, com três interfaces distintas:

| Interface | Público-alvo | Acesso |
|---|---|---|
| **Admin** | Gestor do clube | Autenticado (desktop) |
| **Totem** | Tenista | Público (tablet) |
| **TV Dashboard** | Visitantes | Público (TV/kiosk) |

---

## 🗺️ Fases do Projeto

### FASE 1 – Fundação e Infraestrutura
### FASE 2 – Backend e API
### FASE 3 – Frontend – Módulo Admin
### FASE 4 – Frontend – Módulo Totem
### FASE 5 – Frontend – Módulo TV Dashboard
### FASE 6 – Integrações Externas
### FASE 7 – Testes e Qualidade
### FASE 8 – Deploy e Go-live

---

## ✅ Task List Geral

### FASE 1 — Fundação e Infraestrutura

#### 1.1 Configuração do Projeto

- [x] **F1-01** Criar repositório Git com estrutura monorepo (apps/web, apps/api)
- [x] **F1-02** Inicializar projeto Next.js 14+ com App Router (`npx create-next-app@latest`)
- [x] **F1-03** Configurar TypeScript com strict mode
- [x] **F1-04** Configurar ESLint + Prettier com regras do projeto
- [x] **F1-05** Configurar Tailwind CSS com design tokens do JTC (paleta verde `#1B4332`)
- [x] **F1-05a** Inicializar shadcn/ui (`npx shadcn@latest init`) com tema customizado JTC
- [x] **F1-05b** Configurar `components.json` do shadcn/ui (baseColor: neutral, cssVariables: true)
- [x] **F1-05c** Adicionar componentes base: `button`, `input`, `label`, `dialog`, `select`, `switch`, `badge`, `card`, `separator`, `table`, `tabs`, `toggle`, `tooltip`
- [x] **F1-05d** Sobrescrever tokens CSS do shadcn/ui com paleta institucional JTC em `globals.css`
- [x] **F1-06** Instalar e configurar fontes: DM Serif Display + DM Sans (Google Fonts)
- [x] **F1-07** Criar arquivo `globals.css` com variáveis CSS do design system JTC + overrides shadcn/ui

#### 1.2 Banco de Dados

> **🔌 Banco externo (Azure MySQL)**
> - **Host:** `newdataserver.mysql.database.azure.com`
> - **Usuário:** `dataserver_wp`
> - **Senha:** via `.env.local` → `DATABASE_PASSWORD` (não commitar)
> - **SSL:** obrigatório (Azure exige `sslmode=require`)
>
> **⚠️ Estratégia atual: dados mockados**
> Enquanto a conexão com o banco não for configurada, utilizar os arquivos em `lib/mock/` com dados estáticos TypeScript. A troca para Drizzle deve ser transparente (mesma interface de dados).

- [x] **F1-08** Criar arquivo `.env.local` com `DATABASE_URL` para o Azure MySQL
- [ ] **F1-08a** Testar conectividade com `newdataserver.mysql.database.azure.com` (SSL + credenciais) — **aguardando senha**
- [x] **F1-09** Instalar e configurar Drizzle ORM com driver `mysql2`
- [x] **F1-09a** Criar `lib/mock/` com dados estáticos para courts, blocks, reservations e settings
- [x] **F1-10** Criar schema Drizzle – Tabela `courts`
- [x] **F1-11** Criar schema Drizzle – Tabela `admin_blocks`
- [x] **F1-12** Criar schema Drizzle – Tabela `reservations`
- [x] **F1-13** Criar schema Drizzle – Tabela `players`
- [x] **F1-14** Criar schema Drizzle – Tabela `users`
- [x] **F1-15** Criar schema Drizzle – Tabela `settings`
- [ ] **F1-16** Gerar e executar migration inicial no Azure MySQL — **aguardando senha**
- [ ] **F1-17** Criar seed inicial (4 quadras, 1 usuário admin) para o banco de produção — **aguardando F1-16**


#### 1.3 Autenticação

- [x] **F1-18** Instalar NextAuth.js v5 (Auth.js)
- [x] **F1-19** Configurar provider Credentials com validação JWT
- [x] **F1-20** Implementar hash de senha com bcrypt
- [x] **F1-21** Criar middleware de proteção de rotas (`/admin/**`)
- [x] **F1-22** Configurar sessão segura com cookie HttpOnly

---

### FASE 2 — Backend e API (Route Handlers Next.js)

#### 2.1 API – Quadras (Courts)

- [x] **F2-01** `GET /api/courts` – Listar todas as quadras
- [x] **F2-02** `POST /api/courts` – Criar nova quadra
- [x] **F2-03** `PUT /api/courts/[id]` – Editar quadra existente
- [x] **F2-04** `DELETE /api/courts/[id]` – Remover quadra
- [x] **F2-05** `PATCH /api/courts/[id]/toggle` – Alternar status ativo/inativo

#### 2.2 API – Travas Administrativas (Blocks)

- [x] **F2-06** `GET /api/blocks` – Listar travas (com filtro de período)
- [x] **F2-07** `POST /api/blocks` – Criar nova trava (incluindo recorrência semanal)
- [x] **F2-08** `PUT /api/blocks/[id]` – Editar trava existente
- [x] **F2-09** `DELETE /api/blocks/[id]` – Excluir trava (com confirmação)

#### 2.3 API – Reservas (Reservations)

- [x] **F2-10** `GET /api/reservations` – Listar reservas ativas/futuras
- [x] **F2-11** `POST /api/reservations` – Criar reserva (check-in Totem)
- [x] **F2-12** `GET /api/reservations/slot?courtId=X` – Calcular próximo slot disponível
- [x] **F2-13** Implementar lógica RN-06: cálculo de slot (`lastReservation + interval`, arredondado a 5min)
- [x] **F2-14** Implementar validação de conflito de horário (lock otimista)

#### 2.4 API – Configurações do Sistema

- [x] **F2-15** `GET /api/settings` – Obter configurações globais (modo chuva, etc.)
- [x] **F2-16** `PATCH /api/settings/rain-mode` – Alternar modo chuva
- [x] **F2-17** Implementar lógica RN-02 e RN-09: filtro automático de quadras por clima

#### 2.5 API – Status em Tempo Real

- [x] **F2-18** `GET /api/courts/status` – Status de todas as quadras em tempo real (para TV e Totem)
- [x] **F2-19** Implementar lógica RN-03: cálculo de status (em uso / disponível / bloqueada-chuva / inativa)
- [x] **F2-20** Implementar lógica RN-04: tempo restante calculado com `Math.ceil`

---

### FASE 3 — Frontend – Módulo Admin

#### 3.1 Layout e Autenticação

- [x] **F3-01** Criar layout base Admin com sidebar/header e navegação por abas
- [x] **F3-02** Criar página de Login (`/admin/login`) – modal com overlay blur
- [x] **F3-03** Implementar RF-01: campos usuário/senha + submit via Enter
- [x] **F3-04** Implementar RF-02: feedback de erro inline em vermelho
- [x] **F3-05** Implementar RF-03: proteção de rota – redirect para login
- [x] **F3-06** Implementar RF-04: botão Sair / logout com redirect

#### 3.2 Dashboard de Quadras

- [x] **F3-07** Criar página `/admin` com abas "Quadras" e "Agenda" (RF-11)
- [x] **F3-08** Implementar RF-05: cards de estatísticas no topo (total ativas, em uso, bloqueadas chuva)
- [x] **F3-09** Implementar RF-06: toggle Modo Chuva com feedback laranja
- [x] **F3-10** Implementar RF-07: grid responsivo de cards de quadra
- [x] **F3-11** Criar componente `CourtCard` com badges, tipo, superfície e tempos
- [x] **F3-12** Implementar RF-10: botão toggle ativo/inativo direto no card

#### 3.3 CRUD de Quadras

- [x] **F3-13** Criar componente `CourtModal` (cadastro + edição)
- [x] **F3-14** Implementar RF-08: formulário completo de nova quadra
- [x] **F3-15** Implementar RF-09: modal de edição pré-preenchido
- [x] **F3-16** Validação client-side do formulário de quadra

#### 3.4 Módulo de Agenda (Travas)

- [x] **F3-17** Criar componente `WeeklyCalendar` (RF-12: visão 7 dias, 06h-22h)
- [x] **F3-18** Implementar navegação entre semanas e botão "Hoje"
- [x] **F3-19** Implementar destaque visual do dia atual
- [x] **F3-20** Implementar RF-13: blocos de trava posicionados verticalmente por horário
- [x] **F3-21** Aplicar identidade visual por categoria (cores definidas em 3.3 da especificação)
- [x] **F3-22** Implementar click no bloco para abrir edição
- [x] **F3-23** Criar componente `BlockModal` (RF-14: formulário de trava)
- [x] **F3-24** Implementar RF-15: validação – salvar desabilitado sem título ou quadra
- [x] **F3-25** Implementar RF-16: lógica de recorrência semanal no frontend
- [x] **F3-26** Implementar RF-17: lista de próximas travas abaixo do calendário
- [x] **F3-27** Implementar RF-18: exclusão de trava com modal de confirmação

---

### FASE 4 — Frontend – Módulo Totem

- [x] **F4-01** Criar rota `/totem` com layout full-screen touch-friendly
- [x] **F4-02** Implementar RF-19: stepper de progresso em 3 etapas (dots + linhas)
- [x] **F4-03** Criar componente `WeatherEffect` (RF-20)
  - [x] **F4-03a** Efeito de chuva: 60 gotas animadas + névoa + tinta azulada (seção 7.1)
  - [x] **F4-03b** Efeito de sol: orbe + 6 raios + 18 partículas + lens flare (seção 7.2)
  - [x] **F4-03c** Header muda de verde para cinza durante chuva
- [x] **F4-04** Implementar RF-21: banner laranja de chuva no topo
- [x] **F4-05** Implementar RF-22: filtros pill (Todas / Coberta / Descoberta / Disponível agora)
- [x] **F4-06** Implementar RF-23: busca de quadra por nome/número/superfície
- [x] **F4-07** Criar componente `TotemCourtCard` (RF-24): status atual, horário disponível, opacidade reduzida quando indisponível
- [x] **F4-08** Implementar Etapa 2 – RF-25: seleção de tipo de jogo (Simples / Duplas)
- [x] **F4-09** Implementar Etapa 3 – RF-26: formulário multi-jogador com cards individuais
- [x] **F4-10** Implementar RF-27: botão dashed para adicionar jogador (até máx por tipo)
- [x] **F4-11** Implementar RF-28: bloco de resumo pré-confirmação com horário calculado
- [x] **F4-12** Implementar RF-29: validação do formulário + botão confirmar desabilitado
- [x] **F4-13** Implementar RF-30: tela de confirmação de sucesso com detalhes completos
- [x] **F4-14** Botão "Novo Check-in" para reiniciar fluxo do zero

---

### FASE 5 — Frontend – Módulo TV Dashboard

- [ ] **F5-01** Criar rota `/tv` com layout full-screen kiosk
- [ ] **F5-02** Implementar RF-31: header com branding, data por extenso e relógio em tempo real (tick a cada 1s)
- [ ] **F5-03** Implementar RF-32: tabela estilo painel de aeroporto (Início / Jogador / Quadra / Término / Tipo / Status)
- [ ] **F5-04** Implementar RF-33: pills de status (Em Uso / Livre / Chuva / Manutenção) com dots pulsantes
- [ ] **F5-05** Implementar RF-34: ordenação por prioridade de status + desempate alfabético
- [ ] **F5-06** Implementar RF-35: auto-refresh a cada 30 segundos
- [ ] **F5-07** Implementar RF-36: banner de chuva ativo na TV
- [ ] **F5-08** Implementar RF-37: animação de entrada das linhas (fadeIn com delay escalonado)
- [ ] **F5-09** Garantir operação estável modo kiosk (RNF-07: sem degradação após horas)

---

### FASE 6 — Integrações Externas

#### 6.1 WhatsApp

- [ ] **F6-01** Pesquisar e definir provedor: Z-API, Evolution API ou Twilio
- [ ] **F6-02** Criar service `whatsapp.service.ts` com função `sendConfirmation()`
- [ ] **F6-03** Implementar RNF-11: disparo de mensagem após check-in confirmado
- [ ] **F6-04** Criar template de mensagem de confirmação em pt-BR
- [ ] **F6-05** Tratar erros de envio (fallback não-bloqueante para o check-in)

#### 6.2 API de Clima (opcional / futuro)

- [ ] **F6-06** Avaliar integração com API de clima para ativar Modo Chuva automaticamente
- [ ] **F6-07** Implementar override manual mesmo com integração automática (RF-06)

---

### FASE 7 — Testes e Qualidade

#### 7.1 Testes Unitários

- [ ] **F7-01** Configurar Vitest (ou Jest) + Testing Library
- [ ] **F7-02** Testes para `getNextAvailableSlot()` – múltiplos cenários de conflito
- [ ] **F7-03** Testes para `getCourtStatus()` – todos os estados possíveis
- [ ] **F7-04** Testes para `getEffectiveUsage()` – seco vs chuva
- [ ] **F7-05** Testes de validação de formulários (Totem + Admin)

#### 7.2 Testes de Integração (API)

- [ ] **F7-06** Teste do fluxo completo de check-in via API
- [ ] **F7-07** Teste de conflito de reservas (lock otimista)
- [ ] **F7-08** Teste de recorrência semanal de travas
- [ ] **F7-09** Teste de autenticação (login válido, inválido, sessão expirada)

#### 7.3 Testes de Interface

- [ ] **F7-10** Playwright E2E: fluxo completo de check-in no Totem
- [ ] **F7-11** Playwright E2E: criação e edição de quadra no Admin
- [ ] **F7-12** Playwright E2E: criação de trava com recorrência semanal
- [ ] **F7-13** Teste de responsividade (mobile 375px, tablet 768px, desktop 1440px)
- [ ] **F7-14** Teste de acessibilidade básica (contraste, labels, teclado)

---

### FASE 8 — Deploy e Go-live

- [ ] **F8-01** Configurar variáveis de ambiente (`.env.production`)
- [ ] **F8-02** Configurar banco de dados em produção (MySQL gerenciado)
- [ ] **F8-03** Deploy na Vercel (ou servidor próprio com PM2)
- [ ] **F8-04** Configurar domínio e SSL
- [ ] **F8-05** Executar migrations em produção
- [ ] **F8-06** Configurar monitoramento básico (Vercel Analytics ou similar)
- [ ] **F8-07** Teste smoke em produção (todos os módulos)
- [ ] **F8-08** Treinamento do gestor / documentação de uso

---

## 📦 Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | SSR, rotas, API routes integradas |
| **Linguagem** | TypeScript 5+ | Type safety, manutenibilidade |
| **ORM** | Drizzle ORM | Leve, type-safe, migrations declarativas |
| **Banco de Dados** | MySQL 8+ | Requisito do projeto |
| **Autenticação** | NextAuth.js v5 (Auth.js) | Integração nativa Next.js, JWT/sessão |
| **Componentes UI** | shadcn/ui | Componentes acessíveis, customizáveis, sem dependência de runtime |
| **Estilização** | Tailwind CSS v4 + shadcn/ui | Utilitário + componentes prontos e tematizáveis |
| **Fontes** | DM Serif Display + DM Sans | Definidas na especificação (RNF-01) |
| **WhatsApp** | Z-API / Evolution API | Integração de mensagens (RNF-11) |
| **Testes E2E** | Playwright | Automação cross-browser |
| **Testes Unit** | Vitest + Testing Library | Rápido, compatível com Vite/Next |
| **Deploy** | Vercel | Integração nativa Next.js |

---

## 📅 Cronograma Estimado

| Fase | Duração Estimada | Prioridade |
|---|---|---|
| FASE 1 – Fundação | 1 semana | 🔴 Crítico |
| FASE 2 – Backend API | 2 semanas | 🔴 Crítico |
| FASE 3 – Frontend Admin | 2 semanas | 🔴 Crítico |
| FASE 4 – Frontend Totem | 1,5 semanas | 🔴 Crítico |
| FASE 5 – Frontend TV | 1 semana | 🟠 Alta |
| FASE 6 – Integrações | 1 semana | 🟡 Média |
| FASE 7 – Testes | 1,5 semanas | 🔴 Crítico |
| FASE 8 – Deploy | 0,5 semana | 🔴 Crítico |
| **TOTAL** | **~10,5 semanas** | |

---

## 🔢 Cobertura de Requisitos

| Categoria | Total | Cobertura |
|---|---|---|
| Requisitos Funcionais (RF) | 37 | 100% mapeados nas tarefas F3–F5 |
| Regras de Negócio (RN) | 13 | 100% mapeadas nas tarefas F2 |
| Requisitos Não Funcionais (RNF) | 11 | Cobertos em F1, F4, F5, F6 |

---

## 📌 Backlog Futuro (Pós Go-live)

Itens identificados na especificação (seção 9.2) como fora do escopo inicial:

- [ ] **BL-01** Relatórios e histórico de ocupação por quadra
- [ ] **BL-02** Dashboard de taxa de utilização (analytics)
- [ ] **BL-03** Fila de próximas reservas no TV Dashboard
- [ ] **BL-04** Integração com displays Arduino por quadra (HTTP polling)
- [ ] **BL-05** Cache offline para Totem (PWA / Service Worker)
- [ ] **BL-06** CRUD de usuários administrativos (multi-admin)
- [ ] **BL-07** Integração automática de Modo Chuva via API de clima

---

## 📊 Legenda de Status

| Símbolo | Significado |
|---|---|
| `[ ]` | Não iniciado |
| `[/]` | Em andamento |
| `[x]` | Concluído |
| 🔴 | Prioridade crítica / bloqueante |
| 🟠 | Alta prioridade |
| 🟡 | Média prioridade |
| 🟢 | Baixa prioridade / futuro |

---

*Documento gerado com base na especificação de requisitos v1.0 – JTC CourtSync – Março de 2026*
