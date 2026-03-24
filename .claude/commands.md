# Comandos Slash – JTC

Estes comandos podem ser invocados no Claude Code com `/nome-do-comando`.

---

## /fase

**Objetivo:** Iniciar uma nova fase do projeto com contexto completo.

**Uso:** `/fase <número>`

**Instrução:**
Leia o `plano_trabalho.md` e identifique todas as tarefas da FASE `<número>`.
Liste as tarefas não iniciadas `[ ]`, explique o que cada uma requer e
sugira a ordem de implementação mais eficiente, considerando dependências.
Se alguma tarefa anterior (pré-requisito) ainda não estiver concluída, avise.

---

## /status

**Objetivo:** Verificar o progresso geral do projeto.

**Instrução:**
Leia o `plano_trabalho.md` e gere um relatório de progresso:
- Quantas tarefas `[x]` (concluídas), `[/]` (em andamento), `[ ]` (não iniciadas) por fase
- Percentual de conclusão geral
- Lista das tarefas em andamento `[/]`
- Próximas 5 tarefas prioritárias a executar

---

## /nova-tarefa

**Objetivo:** Implementar uma tarefa específica do plano de trabalho.

**Uso:** `/nova-tarefa <código>` (ex: `/nova-tarefa F2-10`)

**Instrução:**
1. Localize a tarefa `<código>` no `plano_trabalho.md`
2. Consulte o guia do módulo correspondente em `.claude/guides/`
3. Verifique se há dependências não concluídas
4. Implemente a tarefa seguindo as convenções em `CLAUDE.md`
5. Ao concluir, marque como `[x]` no `plano_trabalho.md`

---

## /revisar

**Objetivo:** Revisar o código criado em relação à especificação.

**Uso:** `/revisar <caminho-do-arquivo>`

**Instrução:**
Leia o arquivo especificado e compare com os requisitos em
`especificacao-requisitos-jtc.md`. Verifique:
- Conformidade com RFs, RNs e RNFs aplicáveis
- Convenções de código do `CLAUDE.md`
- Cobertura de casos edge
- Acessibilidade e responsividade

---

## /schema

**Objetivo:** Verificar ou criar schemas Drizzle.

**Instrução:**
Consulte `.claude/guides/database.md` para os schemas de referência.
Compare com os schemas existentes em `lib/db/schema.ts` e identifique
discrepâncias ou campos faltantes. Sugira alterações e gere a migration
correspondente se necessário.
