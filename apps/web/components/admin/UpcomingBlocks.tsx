"use client"

import type { AdminBlock, Court } from "@/lib/db/schema"
import { getCategoryConfig } from "@/lib/utils/blocks"

interface UpcomingBlocksProps {
  blocks:   AdminBlock[]
  courts:   Court[]
  onEdit:   (b: AdminBlock) => void
  onDelete: (id: number) => void
}

export default function UpcomingBlocks({ blocks, courts, onEdit, onDelete }: UpcomingBlocksProps) {
  const today = new Date().toISOString().slice(0, 10)

  // Próximas 30 travas a partir de hoje, ordenadas por data+hora
  const upcoming = blocks
    .filter((b) => b.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 30)

  return (
    <div className="ub-root">
      <h3 className="ub-title">Próximas Travas</h3>

      {upcoming.length === 0 && (
        <p className="ub-empty">Nenhuma trava agendada nos próximos dias.</p>
      )}

      <div className="ub-list">
        {upcoming.map((block) => {
          const cat = getCategoryConfig(block.category)
          const courtNames = block.courtIds
            .map((id) => courts.find((c) => c.id === id)?.name)
            .filter(Boolean)
            .join(", ")

          const dateObj = new Date(block.date + "T00:00:00")
          const dateLabel = dateObj.toLocaleDateString("pt-BR", {
            weekday: "short", day: "2-digit", month: "short",
          })

          return (
            <div key={`${block.id}-${block.date}`} className="ub-item" style={{ borderLeftColor: cat.color }}>
              <div className="ub-item-left">
                <span className="ub-cat" style={{ background: cat.bgColor, color: cat.color }}>
                  {cat.emoji} {cat.label}
                </span>
                <span className="ub-item-title">{block.title}</span>
                <span className="ub-item-meta">
                  {dateLabel} · {block.startTime}–{block.endTime} · {courtNames}
                  {block.recurring === "semanal" && " · 🔁 Semanal"}
                </span>
              </div>
              <div className="ub-item-actions">
                <button className="ub-btn ub-btn--edit" onClick={() => onEdit(block)}>✏️</button>
                <button className="ub-btn ub-btn--del"  onClick={() => onDelete(block.id)}>🗑</button>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        .ub-root { display:flex; flex-direction:column; gap:0.75rem; margin-top:1rem; }
        .ub-title { font-family:var(--font-dm-serif,serif); font-size:1.1rem; font-weight:400; color:#111827; margin:0; }
        .ub-empty { color:#9ca3af; font-size:0.875rem; }
        .ub-list { display:flex; flex-direction:column; gap:0.5rem; }
        .ub-item {
          display:flex; align-items:center; justify-content:space-between; gap:1rem;
          background:#fff; border:1px solid #e5e7eb; border-radius:12px;
          padding:0.75rem 1rem; border-left:4px solid;
          animation:fadeInUp 0.25s ease forwards; opacity:0;
        }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .ub-item-left { display:flex; align-items:center; gap:0.75rem; flex:1; flex-wrap:wrap; }
        .ub-cat { font-size:0.72rem; font-weight:600; padding:0.2rem 0.55rem; border-radius:999px; white-space:nowrap; }
        .ub-item-title { font-size:0.875rem; font-weight:600; color:#111827; }
        .ub-item-meta { font-size:0.75rem; color:#6b7280; }
        .ub-item-actions { display:flex; gap:0.4rem; flex-shrink:0; }
        .ub-btn { width:32px; height:32px; border-radius:8px; border:1px solid #e5e7eb; background:#f9fafb; cursor:pointer; font-size:0.85rem; transition:all 0.15s; }
        .ub-btn--edit:hover { background:#eff6ff; border-color:#bfdbfe; }
        .ub-btn--del:hover  { background:#fee2e2; border-color:#fecaca; }
      `}</style>
    </div>
  )
}
