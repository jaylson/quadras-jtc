# Guia – Módulo Totem (Check-in)

Referência para a interface de autoatendimento em tablet.

## Rota

`/totem` → público, sem autenticação

## Fluxo em 3 Etapas (RF-19)

```
Etapa 1: Escolha da Quadra
    ↓
Etapa 2: Tipo de Jogo (Simples ou Duplas)
    ↓
Etapa 3: Dados dos Jogadores + Confirmação
```

Stepper visual: dots numerados conectados por linhas. Dot ativo = preenchido; concluído = check.

## Componentes

### WeatherEffect (RF-20)
Overlay animado sobre toda a tela:

**Modo Chuva:**
- 60 gotas (`rainFall` CSS animation, 0.6–1.1s, delays escalonados)
- Névoa na base (gradiente 120px)
- Tinta azulada sobre a tela

**Modo Sol:**
- Orbe solar (canto superior direito, pulso 4s)
- 6 raios (animação crescimento + fade, 3s)
- 18 partículas flutuantes
- Lens flare (pulso 5s)
- Tinta amarelada sutil

> Header muda de `#1B4332` (verde) para `#374151/4b5563` (cinza) durante chuva.

### TotemCourtCard (RF-24)
- Nome, superfície (dot colorido), tipo, status atual
- Quadras indisponíveis: `opacity: 0.5`, `cursor: not-allowed`
- Quadras disponíveis: mostrar horário do próximo slot

### Formulário de Jogadores (RF-26 e RF-27)
- Cards individuais por jogador com badge numérico
- Jogador 1: nome + WhatsApp obrigatórios + carteirinha opcional
- Demais jogadores: nome obrigatório + WhatsApp/carteirinha opcionais
- Botão dashed para adicionar (limite: 2 simples / 4 duplas)

## Regras de Negócio (Totem)

| Regra | Descrição |
|---|---|
| RN-02 | Chuva → oculta quadras descobertas com `usageMinutesRain=0` |
| RN-05 | Sempre reserva para o próximo slot — sem agendamento futuro |
| RN-06 | Slot = `endTime + interval`, arredondado para múltiplo de 5min |
| RN-07 | Simples: 2 jogadores exatos / Duplas: 3–4 jogadores |
| RN-08 | Jogador 1: nome + WhatsApp obrigatórios |
| RN-09 | Duração = `usageMinutesDry` (seco) ou `usageMinutesRain` (chuva) |

## UX / Touch

- Botões: padding mínimo `14px 32px`
- Fontes: mínimo `1rem`
- Espaçamento generoso entre elementos interativos
- Tempo de resposta alvo: < 2 segundos (RNF-06)
