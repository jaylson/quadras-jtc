"use client"

import { useState, useEffect } from "react"
import type { Court } from "@/lib/db/schema"

interface CourtModalProps {
  court?:   Court       // undefined = criar, definido = editar
  onSave:   (data: Partial<Court>) => void
  onClose:  () => void
}

export default function CourtModal({ court, onSave, onClose }: CourtModalProps) {
  const isEdit = !!court

  const [name,              setName]              = useState(court?.name ?? "")
  const [type,              setType]              = useState<"coberta"|"descoberta">(court?.type ?? "coberta")
  const [surface,           setSurface]           = useState<"saibro"|"hard"|"grama">(court?.surface ?? "saibro")
  const [usageMinutesDry,   setUsageMinutesDry]   = useState(court?.usageMinutesDry ?? 60)
  const [usageMinutesRain,  setUsageMinutesRain]  = useState(court?.usageMinutesRain ?? 60)
  const [intervalMinutes,   setIntervalMinutes]   = useState(court?.intervalMinutes ?? 15)
  const [deactivateStart,   setDeactivateStart]   = useState(court?.deactivateStart ?? "")
  const [deactivateEnd,     setDeactivateEnd]     = useState(court?.deactivateEnd ?? "")
  const [error,             setError]             = useState<string | null>(null)

  // Fechar com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  // RF-16: validação — nome obrigatório
  const isValid = name.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) { setError("Nome da quadra é obrigatório"); return }
    onSave({
      name: name.trim(),
      type,
      surface,
      usageMinutesDry,
      usageMinutesRain,
      intervalMinutes,
      deactivateStart: deactivateStart || null,
      deactivateEnd:   deactivateEnd   || null,
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="court-modal-title">
        <div className="modal-header">
          <h2 id="court-modal-title" className="modal-title">
            {isEdit ? "Editar Quadra" : "Nova Quadra"}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          {error && <p className="modal-error">{error}</p>}

          {/* Nome */}
          <div className="mf-group">
            <label className="mf-label" htmlFor="court-name">Nome da Quadra *</label>
            <input
              id="court-name"
              className="mf-input"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null) }}
              placeholder="Ex: Quadra 1"
              autoFocus
            />
          </div>

          {/* Tipo */}
          <div className="mf-row">
            <div className="mf-group">
              <label className="mf-label">Tipo</label>
              <div className="mf-options">
                {(["coberta","descoberta"] as const).map((t) => (
                  <label key={t} className={`mf-option ${type === t ? "mf-option--active" : ""}`}>
                    <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
                    {t === "coberta" ? "🏛 Coberta" : "☀️ Descoberta"}
                  </label>
                ))}
              </div>
            </div>

            <div className="mf-group">
              <label className="mf-label">Superfície</label>
              <div className="mf-options">
                {(["saibro","hard","grama"] as const).map((s) => {
                  const colors: Record<string,string> = { saibro:"#c4753b", hard:"#3b82c4", grama:"#4ade80" }
                  const labels: Record<string,string> = { saibro:"Saibro", hard:"Hard", grama:"Grama" }
                  return (
                    <label key={s} className={`mf-option ${surface === s ? "mf-option--active" : ""}`}>
                      <input type="radio" name="surface" value={s} checked={surface === s} onChange={() => setSurface(s)} className="sr-only" />
                      <span className="mf-dot" style={{ background: colors[s] }} />
                      {labels[s]}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tempos */}
          <div className="mf-row mf-row--3">
            {[
              { id:"dry",      label:"☀️ Uso Seco (min)",   val: usageMinutesDry,  set: setUsageMinutesDry  },
              { id:"rain",     label:"🌧 Uso Chuva (min) 0=bloqueada", val: usageMinutesRain, set: setUsageMinutesRain },
              { id:"interval", label:"⏱ Intervalo (min)",   val: intervalMinutes, set: setIntervalMinutes  },
            ].map(({ id, label, val, set }) => (
              <div key={id} className="mf-group">
                <label className="mf-label" htmlFor={`court-${id}`}>{label}</label>
                <input
                  id={`court-${id}`}
                  className="mf-input"
                  type="number"
                  min={0}
                  value={val}
                  onChange={(e) => set(Number(e.target.value))}
                />
              </div>
            ))}
          </div>

          {/* Desativação programada (opcional) */}
          <div className="mf-group">
            <label className="mf-label">Desativação Programada <span className="mf-opt">(opcional)</span></label>
            <div className="mf-row">
              <div className="mf-group mf-group--flex">
                <label className="mf-sublabel" htmlFor="court-deact-start">Início</label>
                <input id="court-deact-start" className="mf-input" type="date" value={deactivateStart as string} onChange={(e) => setDeactivateStart(e.target.value)} />
              </div>
              <div className="mf-group mf-group--flex">
                <label className="mf-sublabel" htmlFor="court-deact-end">Fim</label>
                <input id="court-deact-end" className="mf-input" type="date" value={deactivateEnd as string} onChange={(e) => setDeactivateEnd(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="mf-btn mf-btn--cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" id="btn-save-court" className="mf-btn mf-btn--save" disabled={!isValid}>
              {isEdit ? "Salvar Alterações" : "Criar Quadra"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem; animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }

        .modal-box {
          background: #fff; border-radius: 20px; width: 100%; max-width: 640px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.3);
          animation: slideUp 0.2s ease;
          max-height: 92vh; overflow-y: auto;
        }
        @keyframes slideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }

        .modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 1.5rem 0;
        }
        .modal-title {
          font-family: var(--font-dm-serif, serif);
          font-size: 1.35rem; font-weight: 400; color: #111827; margin: 0;
        }
        .modal-close {
          width: 32px; height: 32px; border-radius: 50%; border: none;
          background: #f3f4f6; color: #6b7280; cursor: pointer; font-size: 0.85rem;
          transition: background 0.15s;
        }
        .modal-close:hover { background: #e5e7eb; color: #111827; }

        .modal-form { padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .modal-error {
          font-size: 0.85rem; color: #dc2626;
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; padding: 0.6rem 0.875rem; margin: 0;
        }

        .mf-group { display: flex; flex-direction: column; gap: 0.35rem; flex: 1; }
        .mf-group--flex { flex: 1; }
        .mf-label { font-size: 0.8rem; font-weight: 600; color: #374151; }
        .mf-sublabel { font-size: 0.75rem; color: #6b7280; }
        .mf-opt { font-weight: 400; color: #9ca3af; }

        .mf-input {
          height: 40px; padding: 0 0.75rem;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 0.9rem; font-family: inherit; color: #111827;
          background: #f9fafb; transition: border-color 0.15s, box-shadow 0.15s; outline: none;
        }
        .mf-input:focus { border-color: #1B4332; box-shadow: 0 0 0 3px rgba(27,67,50,0.1); background:#fff; }

        .mf-row { display: flex; gap: 1rem; }
        .mf-row--3 > .mf-group { flex: 1; min-width: 120px; }

        .mf-options { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .mf-option {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.8rem; font-weight: 500; color: #374151;
          background: #f9fafb; border: 1.5px solid #e5e7eb;
          border-radius: 8px; padding: 0.375rem 0.75rem;
          cursor: pointer; transition: all 0.15s;
        }
        .mf-option--active { background: #f0fdf4; border-color: #86efac; color: #15803d; }
        .mf-option:hover:not(.mf-option--active) { border-color: #d1fae5; }
        .mf-dot { width: 8px; height: 8px; border-radius: 50%; }
        .sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); }

        .modal-footer {
          display: flex; justify-content: flex-end; gap: 0.75rem;
          padding-top: 0.5rem; border-top: 1px solid #f3f4f6; margin-top: 0.5rem;
        }
        .mf-btn {
          height: 40px; padding: 0 1.25rem; border-radius: 10px;
          font-size: 0.875rem; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: all 0.15s;
        }
        .mf-btn--cancel { background: #f3f4f6; border: none; color: #374151; }
        .mf-btn--cancel:hover { background: #e5e7eb; }
        .mf-btn--save { background: #1B4332; border: none; color: #fff; }
        .mf-btn--save:hover:not(:disabled) { background: #2D6A4F; }
        .mf-btn--save:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
