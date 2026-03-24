# Guia – TV Dashboard

Referência para o painel de exibição em TV / modo kiosk.

## Rota

`/tv` → público, fullscreen, sem interação do usuário

## Layout

```
┌─────────────────────────────────────────┐
│  JTC – Painel de Quadras    📅 Data  🕐  │  ← Header (RF-31)
├─────────────────────────────────────────┤
│  [BANNER CHUVA – quando ativo] (RF-36)  │
├─────────────────────────────────────────┤
│  Início │ Jogador │ Quadra │ Término │ Tipo │ Status │  ← Tabela (RF-32)
│  ...    │ ...     │ ...    │ ...     │ ...  │ ...    │
└─────────────────────────────────────────┘
```

## Comportamentos

### Auto-refresh (RF-35)
- Relógio: `setInterval` a cada **1 segundo**
- Dados: `setInterval` ou polling a cada **30 segundos**
- Deve funcionar por horas sem degradação (RNF-07)

### Status das Quadras (RF-33)

| Status | Pill | Cor | Dot |
|---|---|---|---|
| Em Uso | `Em Uso – Xmin` | Vermelho | Pulsante |
| Livre | `Livre` | Verde | Pulsante |
| Chuva | `🌧 Chuva` | Laranja | — |
| Manutenção | `Manutenção` | Cinza | — |

### Ordenação das Linhas (RF-34)

```
1. Em Uso        (prioridade máxima)
2. Disponível
3. Bloqueada por chuva
4. Inativa/Manutenção

Desempate: ordem alfabética pelo nome da quadra
```

### Animação de Entrada (RF-37)

```css
/* Cada linha com delay escalonado */
@keyframes fadeInRow {
  from { opacity: 0; transform: translateX(-12px); }
  to   { opacity: 1; transform: translateX(0); }
}

tr:nth-child(n) {
  animation: fadeInRow 0.3s ease forwards;
  animation-delay: calc(n * 0.05s);
}
```

## Coluna "Quadra" (RF-32)

- Tag com nome da quadra
- Dot colorido indicando superfície (saibro/hard/grama — ver design system)

## Coluna "Tipo"

- Badge: `Simples` (azul claro) / `Duplas` (roxo claro)
