"use client"

import type { Court } from "@/lib/db/schema"

const SURFACE_COLORS: Record<string, string> = {
  saibro: "#c4753b",
  hard:   "#3b82c4",
  grama:  "#4ade80",
}
const SURFACE_LABELS: Record<string, string> = {
  saibro: "Saibro",
  hard:   "Hard Court",
  grama:  "Grama",
}

interface CourtCardProps {
  court:            Court
  status:           "em-uso" | "disponivel" | "bloqueada-chuva" | "inativa"
  remainingMinutes: number | null
  onToggle:         () => void
  onEdit:           () => void
  onDelete:         () => void
}

export default function CourtCard({
  court,
  status,
  remainingMinutes,
  onToggle,
  onEdit,
  onDelete,
}: CourtCardProps) {
  const surfaceColor = SURFACE_COLORS[court.surface] ?? "#6b7280"

  const statusBadge = {
    "em-uso":          { label: remainingMinutes != null ? `Em Uso – ${remainingMinutes}min` : "Em Uso", cls: "cc-badge--use" },
    "disponivel":      { label: "Disponível", cls: "cc-badge--ok" },
    "bloqueada-chuva": { label: "🌧 Chuva",  cls: "cc-badge--rain" },
    "inativa":         { label: "Inativa",    cls: "cc-badge--off" },
  }[status]

  return (
    <div className={`court-card ${!court.active ? "court-card--inactive" : ""}`}>
      {/* Topo */}
      <div className="cc-top">
        <div className="cc-title-row">
          <h3 className="cc-name">{court.name}</h3>
          <span className={`cc-badge ${statusBadge.cls}`}>
            {status === "em-uso" && <span className="cc-pulse" />}
            {statusBadge.label}
          </span>
        </div>

        <div className="cc-meta-row">
          {/* Badge ativo/inativo */}
          <span className={`cc-active-badge ${court.active ? "cc-active-badge--on" : "cc-active-badge--off"}`}>
            {court.active ? "Ativa" : "Inativa"}
          </span>

          {/* Tipo */}
          <span className="cc-chip">{court.type === "coberta" ? "🏛 Coberta" : "☀️ Descoberta"}</span>

          {/* Superfície com dot colorido */}
          <span className="cc-chip cc-chip--surface">
            <span className="cc-dot" style={{ background: surfaceColor }} />
            {SURFACE_LABELS[court.surface]}
          </span>
        </div>
      </div>

      {/* Tempos */}
      <div className="cc-times">
        <div className="cc-time-item">
          <span className="cc-time-label">☀️ Seco</span>
          <span className="cc-time-value">{court.usageMinutesDry}min</span>
        </div>
        <div className="cc-time-divider" />
        <div className="cc-time-item">
          <span className="cc-time-label">🌧 Chuva</span>
          <span className="cc-time-value">
            {court.usageMinutesRain === 0 ? "Bloqueada" : `${court.usageMinutesRain}min`}
          </span>
        </div>
        <div className="cc-time-divider" />
        <div className="cc-time-item">
          <span className="cc-time-label">⏱ Intervalo</span>
          <span className="cc-time-value">{court.intervalMinutes}min</span>
        </div>
      </div>

      {/* Ações RF-10 (toggle rápido) + editar/excluir */}
      <div className="cc-actions">
        {/* RF-10: toggle ativo/inativo sem modal */}
        <button
          id={`btn-toggle-court-${court.id}`}
          className="cc-btn cc-btn--toggle"
          onClick={onToggle}
          title={court.active ? "Desativar quadra" : "Ativar quadra"}
        >
          {court.active ? "Desativar" : "Ativar"}
        </button>

        <button
          id={`btn-edit-court-${court.id}`}
          className="cc-btn cc-btn--edit"
          onClick={onEdit}
        >
          ✏️ Editar
        </button>

        <button
          id={`btn-delete-court-${court.id}`}
          className="cc-btn cc-btn--del"
          onClick={onDelete}
        >
          🗑
        </button>
      </div>

      <style>{`
        .court-card {
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 16px;
          padding: 1.25rem;
          display: flex; flex-direction: column; gap: 1rem;
          transition: box-shadow 0.2s, transform 0.2s;
          animation: fadeInUp 0.3s ease forwards;
          opacity: 0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .court-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .court-card--inactive { opacity: 0.65; }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cc-top { display: flex; flex-direction: column; gap: 0.5rem; }

        .cc-title-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
        .cc-name {
          font-family: var(--font-dm-serif, serif);
          font-size: 1.15rem; font-weight: 400;
          color: #111827; margin: 0;
        }

        /* Status badges */
        .cc-badge {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.72rem; font-weight: 600;
          padding: 0.25rem 0.6rem; border-radius: 999px;
          white-space: nowrap; flex-shrink: 0;
        }
        .cc-badge--use  { background: #fee2e2; color: #dc2626; }
        .cc-badge--ok   { background: #dcfce7; color: #16a34a; }
        .cc-badge--rain { background: #ffedd5; color: #c2410c; }
        .cc-badge--off  { background: #f3f4f6; color: #6b7280; }

        .cc-pulse {
          width: 6px; height: 6px; border-radius: 50%;
          background: currentColor; animation: pulse 1.4s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%       { opacity:0.5; transform:scale(0.7); }
        }

        .cc-meta-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }

        .cc-active-badge {
          font-size: 0.7rem; font-weight: 700;
          padding: 0.2rem 0.55rem; border-radius: 999px;
        }
        .cc-active-badge--on  { background: #dcfce7; color: #15803d; }
        .cc-active-badge--off { background: #f3f4f6; color: #6b7280; }

        .cc-chip {
          display: flex; align-items: center; gap: 0.3rem;
          font-size: 0.75rem; color: #4b5563;
          background: #f9fafb; border: 1px solid #e5e7eb;
          border-radius: 6px; padding: 0.2rem 0.5rem;
        }
        .cc-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* Tempos */
        .cc-times {
          display: flex; align-items: center;
          background: #f9fafb; border-radius: 10px; padding: 0.75rem 1rem;
          gap: 0; flex: 1;
        }
        .cc-time-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.15rem; }
        .cc-time-label { font-size: 0.7rem; color: #9ca3af; font-weight: 500; }
        .cc-time-value { font-size: 0.85rem; font-weight: 700; color: #1B4332; }
        .cc-time-divider { width: 1px; height: 28px; background: #e5e7eb; }

        /* Ações */
        .cc-actions { display: flex; gap: 0.5rem; }
        .cc-btn {
          font-size: 0.78rem; font-weight: 600; font-family: inherit;
          border-radius: 8px; border: 1.5px solid transparent;
          padding: 0.35rem 0.75rem; cursor: pointer;
          transition: all 0.15s;
        }
        .cc-btn--toggle {
          flex: 1; background: #f9fafb; border-color: #e5e7eb; color: #374151;
        }
        .cc-btn--toggle:hover { background: #f0fdf4; border-color: #86efac; color: #15803d; }
        .cc-btn--edit  { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
        .cc-btn--edit:hover  { background: #dbeafe; }
        .cc-btn--del   { background: #fff; border-color: #fecaca; color: #dc2626; padding: 0.35rem 0.6rem; }
        .cc-btn--del:hover   { background: #fee2e2; }
      `}</style>
    </div>
  )
}
