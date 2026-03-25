"use client"

import type { Court } from "@/lib/db/schema"

interface TotemCourtCardProps {
  court: Court
  status: "em-uso" | "disponivel" | "bloqueada-chuva" | "inativa"
  remainingMinutes: number | null
  nextSlot?: { startTime: string; endTime: string }
  onSelect: () => void
  disabled?: boolean
}

export default function TotemCourtCard({ court, status, remainingMinutes, nextSlot, onSelect, disabled }: TotemCourtCardProps) {
  const isBlocked = status === "bloqueada-chuva" || status === "inativa"
  const isAvailableNow = status === "disponivel"

  // Label amigável de tempo
  let timeLabel = ""
  if (isAvailableNow || nextSlot) {
    if (isAvailableNow && remainingMinutes === null) {
      timeLabel = "Disponível Agora"
    } else if (nextSlot) {
      const nowHrs = new Date().getHours() * 60 + new Date().getMinutes()
      const [sh, sm] = nextSlot.startTime.split(":").map(Number)
      const startMinRaw = sh * 60 + sm
      // Ajusta dia seguinte se passou da meia noite (teórico)
      const slotMin = startMinRaw < nowHrs && (nowHrs - startMinRaw > 12 * 60) ? startMinRaw + 24 * 60 : startMinRaw
      const diff = slotMin - nowHrs

      if (diff <= 0) timeLabel = "Disponível Agora"
      else timeLabel = `Livre em ${diff}min (${nextSlot.startTime})`
    }
  }

  // F4-05: Cores superfícies
  const colors: Record<string, string> = { saibro: "#c4753b", hard: "#3b82c4", grama: "#4ade80" }
  const surfColor = colors[court.surface] || "#6b7280"

  return (
    <button
      className={`tcc-root ${disabled || isBlocked ? "tcc--disabled" : ""}`}
      disabled={disabled || isBlocked}
      onClick={onSelect}
    >
      <div className="tcc-header">
        <h3 className="tcc-name">{court.name}</h3>
        {court.type === "coberta" ? <span className="tcc-type" title="Coberta">🏛</span> : <span className="tcc-type" title="Descoberta">☀️</span>}
      </div>

      <div className="tcc-surface">
        <span className="tcc-dot" style={{ background: surfColor }} />
        <span className="tcc-surf-label">{court.surface.toUpperCase()}</span>
      </div>

      <div className="tcc-status-box">
        {isBlocked ? (
          <span className={`tcc-status ${status === "bloqueada-chuva" ? "tcc-status--blocked-rain" : "tcc-status--blocked"}`}>
            {status === "bloqueada-chuva" ? "🌧 Bloqueada p/ Chuva" : "🚫 Inativa"}
          </span>
        ) : (
          <span className={`tcc-status ${isAvailableNow && (!nextSlot || new Date().getHours() * 60 + new Date().getMinutes() >= Number(nextSlot.startTime.split(':')[0]) * 60 + Number(nextSlot.startTime.split(':')[1])) ? "tcc-status--av" : "tcc-status--wait"}`}>
             {status === "em-uso" && remainingMinutes != null ? (
               <>Em Uso ({remainingMinutes}m) <br className="tcc-br"/> <span className="tcc-next">Livre às {nextSlot?.startTime}</span></>
             ) : (
                timeLabel || "Disponível"
             )}
          </span>
        )}
      </div>

      <style>{`
        .tcc-root {
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 1.25rem;
          display: flex; flex-direction: column; gap: 0.75rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          box-shadow: 0 4px 14px rgba(0,0,0,0.05);
          outline: none;
        }
        .tcc-root:hover:not(.tcc--disabled) {
          transform: translateY(-4px);
          border-color: #1B4332;
          box-shadow: 0 8px 24px rgba(27,67,50,0.15);
        }
        .tcc-root:active:not(.tcc--disabled) { transform: scale(0.98); }
        .tcc--disabled { opacity: 0.5; cursor: not-allowed; }

        .tcc-header { display: flex; align-items: center; justify-content: space-between; }
        .tcc-name {
          font-family: var(--font-dm-serif, serif);
          font-size: 1.35rem; color: #111827; margin: 0;
        }
        .tcc-type { font-size: 1.25rem; }

        .tcc-surface { display: flex; align-items: center; gap: 0.4rem; }
        .tcc-dot { width: 10px; height: 10px; border-radius: 50%; }
        .tcc-surf-label { font-size: 0.75rem; font-weight: 700; color: #6b7280; letter-spacing: 0.05em; }

        .tcc-status-box { margin-top: auto; padding-top: 0.5rem; }
        .tcc-status {
          display: inline-block;
          font-size: 0.85rem; font-weight: 700;
          padding: 0.5rem 0.75rem; border-radius: 8px;
          line-height: 1.3;
        }
        .tcc-br { display: none; }
        .tcc-status--av { background: #dcfce7; color: #15803d; }
        .tcc-status--wait { background: #fef9c3; color: #854d0e; }
        .tcc-status--blocked { background: #f3f4f6; color: #6b7280; }
        .tcc-status--blocked-rain { background: #ffedd5; color: #c2410c; }
        .tcc-next { display: block; font-size: 0.75rem; font-weight: 600; color: inherit; opacity: 0.85; margin-top: 2px; }
      `}</style>
    </button>
  )
}
