---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
source: https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

---

## Aplicação no Projeto JTC

Ao construir componentes do JTC, aplique esta skill considerando:

### Restrições de Design do Projeto

O JTC possui um design system pré-definido que deve ser respeitado:

```css
/* Paleta institucional — NÃO substitua, estenda */
--color-primary-900: #1B4332;
--color-primary-700: #2D6A4F;
--color-primary-500: #40916C;

/* Superfícies */
--color-saibro: #c4753b;
--color-hard:   #3b82c4;
--color-grama:  #4ade80;
```

**Fontes obrigatórias (RNF-01):**
- Display/Headings: **DM Serif Display**
- Corpo/UI: **DM Sans**

> ⚠️ Estas são restrições do cliente — não troque as fontes. Use a skill para elevar a *execução* dentro dessas restrições, não para ignorá-las.

### Direção Estética por Interface

| Interface | Tom Estético | Inspiração |
|---|---|---|
| **Admin** | Refinado / Utilitário | Dashboard SaaS premium — denso mas organizado |
| **Totem** | Organic / Touch-first | Aplicativo de quiosque de aeroporto moderno |
| **TV Dashboard** | Editorial / Kiosk | Painel de aeroporto / sala de operações |
| **Landing Page** | Luxury / Esportivo | Club branding de tênis de alto padrão |

### Aplicando a Skill em Componentes JTC

Ao criar qualquer componente de UI, pergunte-se:

1. **Composição espacial**: O layout usa o espaço de forma intencional? Há ritmo visual?
2. **Movimento**: Transições de 0.2–0.3s estão presentes? Há micro-interações nas ações críticas?
3. **Atmosfera**: O fundo contribui para a profundidade? (gradientes, sombras, texturas sutis)
4. **Tipografia**: A hierarquia entre DM Serif Display e DM Sans está clara e expressiva?
5. **Memorabilidade**: O que torna este componente específico ao JTC, não genérico?
