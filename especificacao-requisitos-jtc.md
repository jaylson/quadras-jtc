# 🎾 JTC — Especificação de Requisitos e Funcionalidades

**Baseado na Análise do Protótipo Funcional (tennis-app.jsx)**

| Campo | Valor |
|---|---|
| **Versão do Documento** | 1.0 |
| **Data** | Março de 2026 |
| **Status** | Em Definição |
| **Origem** | Análise do Protótipo React (tennis-app.jsx) |
| **Projeto** | JTC – CourtSync |

---

## 1. Introdução

Este documento detalha a especificação completa de requisitos funcionais e não-funcionais do sistema JTC (anteriormente CourtSync), extraída a partir da análise minuciosa do protótipo funcional implementado em React (arquivo `tennis-app.jsx`). O protótipo contém aproximadamente 3.185 linhas de código e simula todas as interfaces e fluxos do sistema.

O objetivo é servir como referência definitiva para a implementação do sistema em produção, documentando cada entidade de dados, regra de negócio, fluxo de interface e comportamento identificado no protótipo.

### 1.1 Escopo do Sistema

O JTC é uma aplicação web monolítica para gestão de quadras de tênis em clubes, atendendo três perfis de uso por meio de interfaces otimizadas:

- **Gestor (Admin):** Interface desktop para administração completa de quadras e agenda
- **Tenista (Totem):** Interface touch em tablet para check-in presencial de quadra
- **Público (TV Dashboard):** Painel informativo em TV para acompanhamento em tempo real

### 1.2 Glossário

| Termo | Definição |
|---|---|
| **Check-in** | Processo de reserva presencial da próxima vaga disponível em uma quadra |
| **Trava (Block)** | Bloqueio administrativo de quadra para aula, campeonato, evento ou manutenção |
| **Totem** | Dispositivo tablet em quiosque na recepção do clube para autoatendimento |
| **Modo Chuva** | Estado do sistema que bloqueia automaticamente quadras descobertas |
| **Intervalo** | Tempo configurado entre usos consecutivos de uma quadra (limpeza/preparo) |
| **Simples** | Modalidade de jogo com exatamente 2 jogadores |
| **Duplas** | Modalidade de jogo com mínimo de 3 e máximo de 4 jogadores |
| **Carteirinha** | Número de sócio do clube (identificação opcional no check-in) |

---

## 2. Arquitetura de Interfaces (Personas)

O protótipo implementa uma Landing Page central que funciona como roteador entre as três interfaces do sistema. Cada persona possui fluxo, layout e objetivos distintos.

### 2.1 Landing Page (Página Inicial)

Tela de entrada do sistema com branding "JTC – Sistema de Gestão de Quadras de Tênis" e três cartões de navegação:

| Cartão | Destino | Autenticação |
|---|---|---|
| Gestor | Tela de login → Painel Admin | Usuário + Senha |
| Check-in de Quadra | Interface Totem | Nenhuma (acesso público) |
| Painel TV | Dashboard em tempo real | Nenhuma (acesso público) |

### 2.2 Fluxo de Navegação

O sistema utiliza navegação baseada em estado (SPA) no protótipo. Na implementação em produção, cada interface deve ter rota própria com middleware de autenticação:

- **`/`** – Landing Page com seletor de modo
- **`/admin/login`** – Tela de autenticação do gestor
- **`/admin`** – Painel administrativo (protegido)
- **`/totem`** – Interface de check-in (público)
- **`/tv`** – Dashboard de disponibilidade (público)

---

## 3. Modelo de Dados

O protótipo define as seguintes entidades principais, que devem ser mapeadas para tabelas no banco de dados relacional.

### 3.1 Entidade: Quadra (Court)

Representa uma quadra física do clube com suas configurações operacionais.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | Integer / UUID | Sim (PK) | Identificador único |
| `name` | String | Sim | Nome de exibição (ex: "Quadra 1") |
| `type` | Enum | Sim | Valores: `coberta` \| `descoberta` |
| `surface` | Enum | Sim | Valores: `saibro` \| `hard` \| `grama` |
| `active` | Boolean | Sim | Indica se a quadra está operacional |
| `deactivateStart` | Date (nullable) | Não | Início do período de desativação programada |
| `deactivateEnd` | Date (nullable) | Não | Fim do período de desativação programada |
| `usageMinutesDry` | Integer | Sim | Duração de uso em tempo seco (minutos). Padrão: 60 |
| `usageMinutesRain` | Integer | Sim | Duração em chuva (minutos). 0 = quadra bloqueada |
| `intervalMinutes` | Integer | Sim | Intervalo entre usos consecutivos (minutos). Padrão: 15 |

### 3.2 Entidade: Trava Administrativa (Admin Block)

Bloqueios de horário criados pelo gestor para aulas, campeonatos, eventos e manutenção.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | Integer / UUID | Sim (PK) | Identificador único |
| `title` | String | Sim | Título descritivo (ex: "Aula Iniciantes") |
| `category` | Enum | Sim | Categoria da trava (ver seção 3.3) |
| `courtIds` | Array\<Integer\> | Sim | Lista de quadras afetadas (múltipla seleção) |
| `date` | Date | Sim | Data da trava |
| `startTime` | Time (HH:MM) | Sim | Hora de início |
| `endTime` | Time (HH:MM) | Sim | Hora de término |
| `recurring` | Enum | Sim | Valores: `nenhuma` \| `semanal` |
| `notes` | String (nullable) | Não | Observações livres (professor, detalhes) |

### 3.3 Categorias de Trava

O protótipo define 5 categorias com identidade visual própria para o calendário:

| Chave | Label | Emoji | Cor Primária | Cor de Fundo |
|---|---|---|---|---|
| `aula` | Aula | 🎓 | `#3b82f6` (azul) | `#dbeafe` |
| `campeonato` | Campeonato | 🏆 | `#7c3aed` (roxo) | `#ede9fe` |
| `evento` | Evento / Marketing | 🎉 | `#f59e0b` (amarelo) | `#fef3c7` |
| `manutencao` | Manutenção | 🔧 | `#6b7280` (cinza) | `#f3f4f6` |
| `outro` | Outro | 📌 | `#0d9488` (teal) | `#ccfbf1` |

### 3.4 Entidade: Reserva (Reservation)

Registro de check-in realizado pelo tenista no Totem.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | Integer / UUID | Sim (PK) | Identificador único |
| `courtId` | Integer (FK) | Sim | Referência à quadra reservada |
| `courtName` | String | Sim | Nome da quadra (desnormalizado para exibição) |
| `playerName` | String | Sim | Nomes dos jogadores (separados por vírgula) |
| `playerPhone` | String | Sim | WhatsApp do primeiro jogador |
| `players` | Array\<Player\> | Sim | Lista completa de jogadores com detalhes |
| `gameType` | Enum | Sim | Valores: `simples` \| `duplas` |
| `startTime` | DateTime (ISO) | Sim | Início da reserva |
| `endTime` | DateTime (ISO) | Sim | Término da reserva |
| `status` | Enum | Sim | Valores: `em uso` \| `agendada` \| `concluída` |

### 3.5 Entidade: Jogador (Player)

Dados individuais de cada jogador registrado no check-in.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | String | Sim | Nome completo do jogador |
| `phone` | String | Condicional | WhatsApp – obrigatório apenas para o 1º jogador |
| `memberId` | String (nullable) | Não | Número da carteirinha de sócio |

---

## 4. Requisitos Funcionais

### 4.1 Módulo: Autenticação

- **RF-01** Login do Gestor – O sistema deve exibir um modal de login com campos usuário e senha, sobre overlay com blur de fundo. Deve permitir submissão via botão ou tecla Enter.
- **RF-02** Feedback de Erro – Credenciais inválidas devem exibir mensagem de erro inline em vermelho, sem redirecionar ou limpar os campos.
- **RF-03** Proteção de Rota – O painel administrativo só deve ser acessível após autenticação bem-sucedida. Acesso direto deve redirecionar para login.
- **RF-04** Logout – O botão "Sair" no header do painel admin deve encerrar a sessão e retornar à Landing Page.

### 4.2 Módulo: Gestão de Quadras (Admin)

- **RF-05** Dashboard de Estatísticas – Exibir cards de resumo no topo: total de quadras ativas, quadras em uso no momento e quadras bloqueadas por chuva (quando modo chuva ativo).
- **RF-06** Toggle Modo Chuva – Barra de controle com toggle (switch) para ativar/desativar modo chuva manualmente. Deve ter feedback visual (cor laranja quando ativo) e descrição do comportamento.
- **RF-07** Listagem de Quadras – Grid responsivo de cards com nome, badges de status (ativa/inativa), tipo (coberta/descoberta), superfície com indicador colorido, tempo de uso seco e chuva, e intervalo.
- **RF-08** Cadastro de Nova Quadra – Modal com formulário contendo: nome, tipo (coberta/descoberta), superfície (saibro/hard/grama), tempo de uso seco (minutos), tempo de uso chuva (minutos, onde 0 = bloqueada), intervalo entre usos, e período opcional de desativação programada (data início e fim).
- **RF-09** Edição de Quadra – Mesmo modal de cadastro, pré-preenchido com os dados atuais da quadra selecionada.
- **RF-10** Ativação/Desativação – Botão direto no card da quadra para alternar o status ativo/inativo. Ação de toggle rápido sem modal.

### 4.3 Módulo: Travas de Horário (Admin)

- **RF-11** Abas de Navegação – O painel admin possui abas "Quadras" e "Agenda" com contadores de itens. O botão primário do header muda conforme a aba ativa (Nova Quadra / Nova Trava).
- **RF-12** Calendário Semanal – Visão de 7 dias (segunda a domingo) com faixa horária de 06h às 22h. Navegação entre semanas (anterior/próxima) e botão "Hoje" para retornar à semana atual. Destaque visual para o dia atual.
- **RF-13** Blocos no Calendário – Travas são renderizadas como blocos posicionados verticalmente conforme horário, com cor da categoria, título, horário e quadras afetadas. Click no bloco abre edição.
- **RF-14** Cadastro de Trava – Modal com: título, categoria (select com emojis), recorrência (evento único / semanal), data, hora início e término, seleção múltipla de quadras afetadas (botões toggle), e observações.
- **RF-15** Validação de Trava – Botão de salvar desabilitado até que título esteja preenchido e pelo menos uma quadra selecionada.
- **RF-16** Recorrência Semanal – Travas marcadas como "semanal" devem aparecer em todos os dias da semana correspondentes a partir da data original.
- **RF-17** Lista de Travas – Abaixo do calendário, lista de próximas travas com dot da cor da categoria, título, badge da categoria, horário, quadras e botões de editar/excluir.
- **RF-18** Exclusão de Trava – Botão de excluir na lista de travas. Remove imediatamente sem confirmação (no protótipo). Na produção, implementar confirmação.

### 4.4 Módulo: Check-in de Quadra (Totem)

- **RF-19** Fluxo em 3 Etapas – Indicador visual de progresso (stepper com dots numerados e linhas conectoras) mostrando: 1) Escolha da Quadra, 2) Tipo de Jogo, 3) Jogadores.
- **RF-20** Efeitos Climáticos – Overlay visual animado que muda conforme estado do clima: gotas de chuva animadas com efeito de splash e névoa (modo chuva) ou orbe solar com raios, partículas e lens flare (modo sol). Header muda de cor verde para cinza quando chove.
- **RF-21** Banner de Chuva – Quando modo chuva ativo, exibir banner laranja informando que quadras descobertas podem estar indisponíveis.
- **RF-22** Filtros de Quadra – Barra de filtros com botões pill: "Todas", "Coberta", "Descoberta", "Disponível agora". Combinar filtros é permitido.
- **RF-23** Busca de Quadra – Campo de busca com ícone de lupa para filtrar por nome, número ou superfície da quadra.
- **RF-24** Cards de Quadra – Grid de cards com: nome, superfície (com indicador colorido), tipo, status atual (disponível com horário / em uso com tempo restante). Quadras indisponíveis aparecem com opacidade reduzida e cursor bloqueado.
- **RF-25** Seleção de Tipo de Jogo – Dois cards grandes: Simples (2 jogadores) e Duplas (3-4 jogadores) com ícones e descrições. Seleção única com destaque visual.
- **RF-26** Formulário Multi-Jogador – Cards individuais por jogador contendo: badge numérico, nome completo, número da carteirinha (opcional), WhatsApp (obrigatório apenas para jogador 1). Jogadores opcionais possuem label e botão de remoção.
- **RF-27** Adicionar Jogador – Botão dashed para adicionar jogador adicional até o máximo permitido (2 para simples, 4 para duplas).
- **RF-28** Resumo Pré-Confirmação – Bloco com resumo do check-in: quadra, horário calculado automaticamente, tipo de jogo e quantidade de jogadores.
- **RF-29** Validação do Formulário – Mensagem de erro quando os campos obrigatórios não estão preenchidos. Botão de confirmar desabilitado até validação completa.
- **RF-30** Tela de Confirmação – Card com ícone de sucesso (check verde), título "Check-in Confirmado!", detalhes completos (quadra, horário, tipo, lista de jogadores com carteirinhas), nota de confirmação via WhatsApp, e botão "Novo Check-in" para reiniciar fluxo.

### 4.5 Módulo: Dashboard TV

- **RF-31** Header Informativo – Barra superior com branding "JTC – Painel de Quadras", data por extenso e relógio digital em tempo real (atualizado a cada segundo).
- **RF-32** Tabela Estilo Painel de Aeroporto – Tabela com colunas: Início, Jogador, Quadra (com tag e indicador de superfície), Término, Tipo (badge simples/duplas), Status.
- **RF-33** Status em Tempo Real – Cada quadra exibe um dos estados: Em Uso (pill vermelha com dot pulsante e minutos restantes), Livre (pill verde com dot pulsante), Chuva (pill laranja com emoji), Manutenção (pill cinza).
- **RF-34** Ordenação de Linhas – Quadras ordenadas por prioridade de status: 1º Em uso, 2º Disponível, 3º Bloqueada por chuva, 4º Inativa. Desempate alfabético pelo nome da quadra.
- **RF-35** Auto-Refresh – A tabela deve ser atualizada automaticamente a cada 30 segundos além do relógio contínuo.
- **RF-36** Banner de Chuva na TV – Quando modo chuva ativo, exibir banner superior informando "Modo Chuva Ativo – Quadras descobertas bloqueadas automaticamente".
- **RF-37** Animação de Entrada – Linhas da tabela devem animar ao aparecer (fade-in com deslocamento lateral, delay escalonado por linha).

---

## 5. Regras de Negócio

### 5.1 Regras de Disponibilidade

- **RN-01** Quadras com `active = false` não aparecem no Totem para check-in, mas permanecem visíveis no Admin e na TV (com status "Manutenção").
- **RN-02** Quando Modo Chuva está ativo, quadras descobertas (`type = "descoberta"`) com `usageMinutesRain = 0` são automaticamente removidas da listagem do Totem.
- **RN-03** O status de cada quadra é calculado em tempo real: "em uso" (se há reserva ativa no momento), "disponível" (se ativa e sem reserva), "bloqueada-chuva" (descoberta durante chuva), "inativa" (desativada pelo gestor).
- **RN-04** O tempo restante em quadras "em uso" é calculado como diferença entre `endTime` da reserva e o horário atual, arredondado para cima (ceil em minutos).

### 5.2 Regras de Reserva

- **RN-05** Reservas são sempre para o próximo horário disponível – não há agendamento futuro pelo tenista.
- **RN-06** O cálculo do próximo slot considera: a última reserva da quadra + intervalo configurado. Se não há reservas ativas, o slot começa imediatamente (arredondado para próximo múltiplo de 5 minutos).
- **RN-07** Simples exige exatamente 2 jogadores (mín e máx). Duplas exige mínimo 3, máximo 4 jogadores.
- **RN-08** O primeiro jogador deve ter nome + WhatsApp obrigatórios. Demais jogadores: nome obrigatório, WhatsApp opcional.
- **RN-09** O horário efetivo de uso (duração) depende do clima: usa `usageMinutesDry` em tempo seco e `usageMinutesRain` em tempo chuvoso.
- **RN-10** Após confirmação, o status da reserva é definido como "em uso" se o horário de início já passou, ou "agendada" se ainda não.

### 5.3 Regras de Travas

- **RN-11** Uma trava pode afetar múltiplas quadras simultaneamente (seleção múltipla de `courtIds`).
- **RN-12** Travas semanais se repetem automaticamente em todos os dias correspondentes da semana a partir da data original.
- **RN-13** Para criar uma trava, é obrigatório: título preenchido e pelo menos uma quadra selecionada.

---

## 6. Requisitos Não Funcionais

### 6.1 Interface e Experiência

- **RNF-01** Design System – Paleta baseada em verdes institucionais (`#1B4332`, `#2D6A4F`, `#40916C`) com fundo branco. Tipografia: DM Serif Display (headings) + DM Sans (corpo). Border-radius de 12px e 8px.
- **RNF-02** Indicadores de Superfície – Círculos coloridos: Saibro (`#c4753b` – terracota), Hard Court (`#3b82c4` – azul), Grama (`#4ade80` – verde).
- **RNF-03** Animações – Transições suaves (0.2-0.3s ease), animações de fadeInUp para cards e modais, dots pulsantes para status ao vivo, efeitos de hover com elevação (translateY).
- **RNF-04** Responsividade – Grid de quadras muda de multi-coluna para coluna única em telas < 768px. TV Dashboard adapta padding e tamanho de fonte.
- **RNF-05** Interface Touch – Totem deve ter áreas de toque grandes (botões com padding mínimo de 14px 32px), fontes acima de 1rem, e espaçamento generoso entre elementos interativos.

### 6.2 Performance e Operacional

- **RNF-06** Tempo de resposta do Totem inferior a 2 segundos em operações críticas (seleção de quadra, confirmação).
- **RNF-07** TV Dashboard deve operar em modo kiosk por horas sem degradação de performance. Auto-refresh a cada 30 segundos, relógio a cada 1 segundo.
- **RNF-08** Idioma fixo: Português Brasileiro (pt-BR) para todas as interfaces, formatação de datas e horários.

### 6.3 Segurança e Acesso

- **RNF-09** Painel Admin protegido por autenticação. Interfaces Totem e TV são públicas, sem login.
- **RNF-10** Senhas devem ser armazenadas com hash (bcrypt). Sessões via token JWT ou cookies seguros.

### 6.4 Notificações

- **RNF-11** Confirmação de check-in enviada via WhatsApp para os jogadores que informaram telefone. Integração via WhatsApp Business API ou serviço terceiro (Z-API, Evolution API).

---

## 7. Especificações Visuais Detalhadas

### 7.1 Efeito de Chuva (Totem)

O protótipo implementa um sistema de efeitos climáticos animados no Totem:

- **60 gotas de chuva** com posição horizontal aleatória, alturas variando de 15-40px, animação "rainFall" com duração de 0.6-1.1s e delays escalonados
- **Névoa** na base da tela (gradiente de 120px de altura)
- **Tinta de fundo** com gradiente azulado sutil sobre toda a tela
- **Header escuro** muda de verde para cinza (`#374151` → `#4b5563`) durante chuva

### 7.2 Efeito de Sol (Totem)

- **Orbe solar** no canto superior direito com gradiente radial e animação de pulso (4s)
- **6 raios de sol** animados com crescimento e fade (3s)
- **18 partículas flutuantes** com tamanhos e trajetórias variados
- **Lens flare** com animação de pulso (5s)
- **Tinta quente** gradiente sutil amarelado sobre a tela

### 7.3 Identidade Visual por Superfície

| Superfície | Cor | Hex |
|---|---|---|
| Saibro | Terracota | `#c4753b` |
| Hard Court | Azul | `#3b82c4` |
| Grama | Verde | `#4ade80` |

---

## 8. Mapa de Componentes do Protótipo

Componentes React identificados no protótipo e seu mapeamento para a implementação:

| Componente | Linhas | Responsabilidade |
|---|---|---|
| `TennisReservationApp` | 3150–3184 | Componente raiz: estado global, roteamento entre páginas |
| `LandingPage` | 1850–1877 | Página inicial com 3 cards de navegação |
| `AdminLogin` | 1880–1919 | Modal de login com autenticação |
| `AdminPanel` | 1922–2467 | Painel completo: abas, quadras, agenda, modais CRUD |
| `WeatherEffect` | 2470–2560 | Overlay animado de chuva ou sol |
| `TotemMode` | 2563–2970 | Fluxo de check-in em 3 etapas |
| `TVDashboard` | 2973–3147 | Painel de aeroporto com auto-refresh |

### 8.1 Funções Utilitárias

| Função | Finalidade |
|---|---|
| `formatTime(date)` | Formata DateTime para HH:MM no locale pt-BR |
| `formatDate(date)` | Formata DateTime para DD/MM/AAAA no locale pt-BR |
| `getEffectiveUsage(court, isRaining)` | Retorna duração efetiva conforme condição climática |
| `getNextAvailableSlot(court, reservations, isRaining)` | Calcula próximo slot disponível considerando reservas e intervalo |
| `getCourtStatus(court, reservations, isRaining)` | Determina status atual da quadra em tempo real |
| `getCategoryConfig(key)` | Retorna configuração visual de uma categoria de trava |

---

## 9. Observações para Implementação

### 9.1 Diferenças Protótipo vs Produção

| Aspecto | Protótipo | Produção (Recomendado) |
|---|---|---|
| Navegação | Estado React local (`useState`) | Rotas Next.js App Router |
| Autenticação | Credenciais hardcoded (`admin/admin`) | NextAuth com bcrypt hash e sessão JWT |
| Banco de Dados | Estado em memória (arrays JS) | MySQL via Drizzle ORM |
| Modo Chuva | Toggle manual do admin | Integração com API de clima + override manual |
| WhatsApp | Apenas indicação visual | Integração real via API (Z-API, Evolution, Twilio) |
| Exclusão de Trava | Sem confirmação | Modal de confirmação antes de excluir |
| Reservas | Geradas aleatoriamente | Persistidas no banco com lock otimista |
| TV Refresh | `setInterval` no client | Polling na API ou Server-Sent Events |
| Desativação Programada | Campos no formulário (não implementada) | Cron job ou check automático em cada request |

### 9.2 Funcionalidades Ausentes no Protótipo

Itens previstos no escopo macro mas não implementados no protótipo:

- **Relatórios e histórico** – Dashboard de ocupação, taxa de utilização por quadra, histórico de reservas
- **Validação de conflito de horário** – Verificar se travas e reservas não se sobrepõem no servidor
- **Fila de próximas reservas na TV** – Além do status atual, exibir próximos na fila
- **Integração Arduino** – Displays físicos por quadra via polling HTTP (especificado em documento separado)
- **Cache offline** – Funcionamento básico do Totem quando sem internet
- **Gestão de usuários admin** – CRUD de usuários administrativos (não apenas um login fixo)

---

## 10. Resumo Quantitativo

| Categoria | Quantidade |
|---|---|
| Requisitos Funcionais (RF) | 37 |
| Regras de Negócio (RN) | 13 |
| Requisitos Não Funcionais (RNF) | 11 |
| Entidades de Dados | 5 (Court, Block, Reservation, Player, User) |
| Categorias de Trava | 5 (Aula, Campeonato, Evento, Manutenção, Outro) |
| Componentes React Identificados | 7 |
| Funções Utilitárias | 6 |
| Interfaces Distintas | 4 (Landing, Admin, Totem, TV) |

---

> *Este documento será utilizado como base para o plano de desenvolvimento e implementação do sistema JTC em produção.*
