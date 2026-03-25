# 🎾 JTC CourtSync — Manual de Uso

> **Versão:** 1.0 · **Março de 2026**  
> Sistema de Gestão de Quadras de Tênis

---

## Sumário

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Acesso ao Sistema](#2-acesso-ao-sistema)
3. [Módulo Admin — Painel do Gestor](#3-módulo-admin--painel-do-gestor)
4. [Módulo Totem — Check-in do Tenista](#4-módulo-totem--check-in-do-tenista)
5. [Módulo TV Dashboard](#5-módulo-tv-dashboard)
6. [Regras de Negócio](#6-regras-de-negócio)
7. [Glossário](#7-glossário)
8. [Solução de Problemas](#8-solução-de-problemas)

---

## 1. Visão Geral do Sistema

O **JTC CourtSync** é um sistema web para gestão de quadras de tênis. Ele possui **três interfaces** distintas:

| Interface | Quem usa | Como acessar |
|---|---|---|
| **Admin** | Gestor do clube | `/admin/login` — requer senha |
| **Totem** | Tenistas | `/totem` — acesso público |
| **TV Dashboard** | Visitantes e jogadores | `/tv` — acesso público |

---

## 2. Acesso ao Sistema

A **página inicial** (`/`) exibe três cards de acesso:

- **⚙️ Gestor** → Painel administrativo (exige login)
- **🎾 Check-in de Quadra** → Totem para tenistas (público)
- **📺 Painel TV** → Disponibilidade em tempo real (público)

> Em uma instalação típica: o Totem fica em um tablet no balcão do clube e a TV exibe o Painel TV em modo kiosk (tela cheia).

---

## 3. Módulo Admin — Painel do Gestor

### 3.1 Login

**Caminho:** `/admin/login`

1. Informe seu **usuário** e **senha**.
2. Pressione `Enter` ou clique em **Entrar**.
3. Em caso de erro, a mensagem *"Usuário ou senha inválidos."* aparece em vermelho.
4. Após login bem-sucedido, você é redirecionado ao painel (`/admin`).

Para **sair**, clique em **Sair** no cabeçalho. A sessão é protegida por cookies seguros (HttpOnly).

---

### 3.2 Dashboard de Quadras

**Caminho:** `/admin`

O painel possui **duas abas**:

| Aba | Função |
|---|---|
| **Quadras** | Visão geral e gerenciamento |
| **Agenda** | Calendário semanal de travas |

#### Cards de Estatísticas

| Card | O que mostra |
|---|---|
| Total Ativas | Quadras ativas no sistema |
| Em Uso | Quadras com ocupação atual |
| Bloqueadas (Chuva) | Quadras descobertas bloqueadas pelo Modo Chuva |

#### Grid de Quadras

Cada card de quadra mostra: nome, tipo, superfície, status atual (com badge), tempo restante, próximo slot e toggle ativo/inativo.

---

### 3.3 Modo Chuva

Interruptor global no topo do dashboard.

- **Ativado:** quadras **Descobertas** com `usageMinutesRain = 0` ficam com status **"Bloqueada - Chuva"**.
- Quadras **Cobertas** não são afetadas.
- Descobertas com `usageMinutesRain > 0` continuam funcionando com duração reduzida.
- O header do Totem muda de verde para cinza e um **banner laranja** é exibido.

---

### 3.4 Gerenciar Quadras (CRUD)

#### Criar Nova Quadra

Clique em **"+ Nova Quadra"** e preencha:

| Campo | Descrição | Obrigatório |
|---|---|---|
| **Nome da Quadra** | Ex: "Quadra 1" | Sim |
| **Tipo** | Coberta ou Descoberta | Sim |
| **Superfície** | Saibro, Hard ou Grama | Sim |
| **Uso Seco (min)** | Duração da partida em dia normal | Sim |
| **Uso Chuva (min)** | Duração em dia de chuva. `0` = bloqueada | Sim |
| **Intervalo (min)** | Tempo entre reservas | Sim |
| **Desativação Programada** | Período de inatividade futura | Não |

O botão **"Criar Quadra"** só fica ativo quando o nome estiver preenchido.

#### Editar Quadra

Clique no ícone de edição no card → modal abre pré-preenchido → altere os campos → **"Salvar Alterações"**.

#### Ativar / Desativar

Use o **toggle** no card. Quadras inativas não aparecem no Totem nem na TV.

> **Atenção:** desativar não cancela reservas ativas existentes.

---

### 3.5 Agenda — Travas Administrativas

Visão semanal (7 dias, 06h–22h) com blocos coloridos posicionados por horário.

#### Navegação

- **← →** para navegar entre semanas
- **"Hoje"** para voltar à semana atual
- Dia atual é destacado visualmente

#### Criar Trava

Clique em **"+ Nova Trava"**:

| Campo | Obrigatório |
|---|---|
| **Título** | Sim |
| **Categoria** (Aula / Campeonato / Evento / Manutenção / Outro) | Sim |
| **Recorrência** (Evento único / Semanal) | Sim |
| **Data** | Sim |
| **Início / Término** | Sim |
| **Quadras** (uma ou mais) | Mínimo 1 |
| **Observações** | Não |

Botão **"Criar Trava"** só habilita com título + ao menos uma quadra selecionada.

#### Cores de Categoria

| Categoria | Cor |
|---|---|
| Aula | Azul |
| Campeonato | Roxo |
| Evento | Laranja |
| Manutenção | Vermelho |
| Outro | Cinza |

#### Editar / Excluir Trava

Clique sobre o bloco no calendário ou na lista de próximas travas → modal de edição. Para excluir: clique **"Excluir"** → confirme com **"Sim, excluir"** (dupla confirmação para evitar acidentes).

---

## 4. Módulo Totem — Check-in do Tenista

**Caminho:** `/totem`

Fluxo em **3 etapas** indicadas por stepper no topo da tela.

---

### 4.1 Etapa 1: Escolher a Quadra

#### Filtros disponíveis

| Filtro | Exibe |
|---|---|
| Todas | Todas as quadras ativas |
| Cobertas | Somente quadras cobertas |
| Descobertas | Somente quadras descobertas |
| Disponíveis Agora | Somente status "Disponível" |

Há também uma **barra de busca** por nome ou superfície.

#### Status nos Cards

| Status | Cor | Pode reservar? |
|---|---|---|
| Disponível | Verde | Sim |
| Em Uso | Vermelho | Não — exibe horário de liberação |
| Bloqueada - Chuva | Azul | Não |
| Inativa | Cinza | Não |

Quadras indisponíveis aparecem com **opacidade reduzida**.

**Como reservar:** toque/clique no card ou no botão **"Reservar Agora"**.

---

### 4.2 Etapa 2: Tipo de Jogo

Escolha entre:

| Tipo | Jogadores |
|---|---|
| **Simples** | 2 jogadores (exato) |
| **Duplas** | 3 a 4 jogadores |

O **horário calculado** para a reserva é exibido nesta tela. O sistema define o próximo slot automaticamente.

Use **"← Voltar às Quadras"** para retroceder.

---

### 4.3 Etapa 3: Identificação dos Jogadores

#### Jogador 1

| Campo | Obrigatório |
|---|---|
| Nome Completo | Sim |
| WhatsApp | Sim |
| Carteirinha / Nº Sócio | Não |

#### Demais Jogadores

| Campo | Obrigatório |
|---|---|
| Nome | Sim |
| WhatsApp | Não |
| Carteirinha | Não |

- Botão **"+ Adicionar Jogador"** (tracejado) aparece até atingir o máximo da modalidade.
- Jogadores extras podem ser removidos com o botão **X** no card.

#### Resumo (lado esquerdo)

Exibe quadra, tipo de jogo e **horário calculado** (início — término) antes de confirmar.

O botão **"Confirmar Check-in"** só ativa com todos os campos obrigatórios preenchidos.

> O horário é definido automaticamente pelo sistema — sem conflitos com outras reservas.

---

### 4.4 Confirmação de Sucesso

Após confirmar, a tela exibe:
- "Check-in Confirmado!"
- Quadra, horário e número de jogadores

Clique em **"Novo Check-in"** para reiniciar o fluxo.

---

## 5. Módulo TV Dashboard

**Caminho:** `/tv`

Projetado para exibição contínua em monitores do clube.

#### Cabeçalho
Logo JTC + data completa por extenso + **relógio em tempo real** (atualiza a cada segundo).

#### Tabela (estilo aeroporto)

| Coluna | Descrição |
|---|---|
| Início | Hora de início da reserva |
| Jogador | Nome do principal jogador |
| Quadra | Nome da quadra |
| Término | Hora prevista de término |
| Tipo | Simples ou Duplas |
| Status | Badge animado com dot pulsante |

#### Badges de Status

| Badge | Cor |
|---|---|
| Em Uso | Verde |
| Livre | Cinza |
| Chuva | Azul |
| Manutenção | Vermelho |

#### Ordenação

1. Em Uso → 2. Livre → 3. Chuva → 4. Manutenção  
Desempate: alfabético pelo nome da quadra.

#### Auto-Refresh
Atualiza automaticamente a cada **30 segundos**. Novas linhas entram com animação fadeIn.

#### Modo Chuva na TV
Banner laranja no topo indica que quadras descobertas estão bloqueadas.

---

## 6. Regras de Negócio

### RN-01 — Quadra Inativa
Não aparece no Totem nem na TV.

### RN-02 — Bloqueio por Chuva
Quadras **Descobertas** com `usageMinutesRain = 0` são bloqueadas quando o Modo Chuva está ativo.

### RN-03 — Status em Tempo Real
Calculado no momento da consulta:
- Reserva com `startTime ≤ agora < endTime` → **Em Uso**
- Caso contrário → **Disponível**

### RN-04 — Tempo Restante
`Math.ceil((endTime - agora) / 60 segundos)` — sempre arredondado para cima.

### RN-06 — Próximo Slot Disponível

```
Sem reservas ativas:
  slot = agora arredondado para próximo múltiplo de 5 min

Com reservas:
  slot = fim_última_reserva + intervalo_between_games
  slot = arredondado para próximo múltiplo de 5 min
```

**Exemplo:** término 11:33 + 10 min intervalo = 11:43 → arredonda para **11:45**.

### RN-07 — Limites por Modalidade

| Modalidade | Mínimo | Máximo |
|---|---|---|
| Simples | 2 | 2 |
| Duplas | 3 | 4 |

### RN-08 — Validação do Check-in
- Jogador 1: nome + WhatsApp obrigatórios
- Demais: somente nome obrigatório
- Quantidade: dentro dos limites da modalidade (RN-07)

### RN-09 — Tempo de Uso por Clima
- `usageMinutesDry`: duração padrão (dias normais)
- `usageMinutesRain`: duração em chuva. Se `0`, quadra é bloqueada pelo Modo Chuva.

---

## 7. Glossário

| Termo | Definição |
|---|---|
| **Trava Administrativa** | Bloqueio de horário criado pelo gestor (aula, evento, manutenção etc.) |
| **Check-in** | Processo pelo qual o tenista reserva a quadra e registra os jogadores |
| **Slot** | Horário calculado para início de uma nova reserva |
| **Intervalo entre jogos** | Tempo entre o fim de uma partida e o início da próxima |
| **Modo Chuva** | Configuração global que bloqueia quadras descobertas sem uso na chuva |
| **Recorrência Semanal** | Trava que se repete toda semana no mesmo dia e horário |
| **Em Uso** | Quadra com uma reserva ativa no momento atual |
| **Superfície** | Tipo de piso: Saibro, Hard ou Grama |

---

## 8. Solução de Problemas

| Problema | Causa provável | Solução |
|---|---|---|
| Não consigo fazer login | Credenciais erradas | Verifique usuario/senha (case-sensitive). Solicite redefinição ao admin técnico |
| Quadra aparece "Em Uso" sem jogadores | Reserva ainda não expirou | Aguarde o horário de término |
| Botão "Confirmar Check-in" desabilitado | Campos obrigatórios vazios | Preencha nome + WhatsApp do Jogador 1; nome dos demais jogadores |
| Modo Chuva ativo mas quadra disponível | Quadra coberta ou com uso na chuva > 0 | Comportamento correto — coberta não é afetada |
| Botão "Criar Trava" desabilitado | Título vazio ou nenhuma quadra selecionada | Preencha o título e selecione ao menos uma quadra |
| TV não atualiza | Perda de conexão | Recarregue a página; verifique a rede |
| Quadra sumiu do Totem | Toggle inativo no Admin | Ative a quadra no painel Admin |

---

> *JTC CourtSync · Manual de Uso · v1.0 · Março de 2026*
