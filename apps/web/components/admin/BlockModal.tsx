"use client"

import { useState, useEffect } from "react"
import type { AdminBlock, Court } from "@/lib/db/schema"
import { getCategoryConfig, ALL_CATEGORIES } from "@/lib/utils/blocks"

interface BlockModalProps {
  block?:    AdminBlock
  courts:    Court[]
  onSave:    (data: Partial<AdminBlock>) => void
  onClose:   () => void
  onDelete?: () => void
}

export default function BlockModal({ block, courts, onSave, onClose, onDelete }: BlockModalProps) {
  const isEdit = !!block

  const today = new Date().toISOString().slice(0, 10)

  const [title,      setTitle]      = useState(block?.title ?? "")
  const [category,   setCategory]   = useState(block?.category ?? "aula")
  const [recurring,  setRecurring]  = useState<"nenhuma"|"semanal">(block?.recurring ?? "nenhuma")
  const [date,       setDate]       = useState(block?.date ?? today)
  const [startTime,  setStartTime]  = useState(block?.startTime ?? "08:00")
  const [endTime,    setEndTime]    = useState(block?.endTime ?? "10:00")
  const [courtIds,   setCourtIds]   = useState<number[]>(block?.courtIds ?? [])
  const [notes,      setNotes]      = useState(block?.notes ?? "")
  const [confirmDel, setConfirmDel] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  // RF-15: válido se título preenchido + pelo menos uma quadra
  const isValid = title.trim().length > 0 && courtIds.length > 0

  function toggleCourt(id: number) {
    setCourtIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    onSave({ title: title.trim(), category: category as AdminBlock["category"], recurring, date, startTime, endTime, courtIds, notes: notes.trim() || null })
  }

  const catConfig = getCategoryConfig(category)

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box" role="dialog" aria-modal aria-labelledby="block-modal-title">
        <div className="modal-header">
          <h2 id="block-modal-title" className="modal-title">
            {isEdit ? "Editar Trava" : "Nova Trava"}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>

          {/* Título */}
          <div className="mf-group">
            <label className="mf-label" htmlFor="block-title">Título *</label>
            <input
              id="block-title"
              className="mf-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aula Iniciantes"
              autoFocus
            />
          </div>

          {/* Categoria */}
          <div className="mf-group">
            <label className="mf-label">Categoria</label>
            <div className="mf-options mf-options--wrap">
              {ALL_CATEGORIES.map((cat) => (
                <label key={cat.key} className={`mf-cat-option ${category === cat.key ? "mf-cat-option--active" : ""}`}
                  style={category === cat.key ? { borderColor: cat.color, background: cat.bgColor, color: cat.color } : {}}>
                  <input type="radio" name="category" value={cat.key} checked={category === cat.key}
                    onChange={() => setCategory(cat.key as AdminBlock["category"])} className="sr-only" />
                  {cat.emoji} {cat.label}
                </label>
              ))}
            </div>
          </div>

          {/* Recorrência */}
          <div className="mf-group">
            <label className="mf-label">Recorrência</label>
            <div className="mf-options">
              {(["nenhuma","semanal"] as const).map((r) => (
                <label key={r} className={`mf-option ${recurring === r ? "mf-option--active" : ""}`}>
                  <input type="radio" name="recurring" value={r} checked={recurring === r} onChange={() => setRecurring(r)} className="sr-only" />
                  {r === "nenhuma" ? "📅 Evento único" : "🔁 Semanal"}
                </label>
              ))}
            </div>
          </div>

          {/* Data e horários */}
          <div className="mf-row">
            <div className="mf-group">
              <label className="mf-label" htmlFor="block-date">Data</label>
              <input id="block-date" className="mf-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="mf-group">
              <label className="mf-label" htmlFor="block-start">Início</label>
              <input id="block-start" className="mf-input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="mf-group">
              <label className="mf-label" htmlFor="block-end">Término</label>
              <input id="block-end" className="mf-input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          {/* Quadras (multi-select por toggle) */}
          <div className="mf-group">
            <label className="mf-label">Quadras * <span className="mf-opt">(selecione ao menos uma)</span></label>
            <div className="mf-courts-grid">
              {courts.map((c) => {
                const selected = courtIds.includes(c.id)
                return (
                  <button key={c.id} type="button"
                    id={`block-court-${c.id}`}
                    className={`mf-court-btn ${selected ? "mf-court-btn--sel" : ""}`}
                    onClick={() => toggleCourt(c.id)}
                    style={selected ? { borderColor: catConfig.color, background: catConfig.bgColor, color: catConfig.color } : {}}
                  >
                    {c.name}
                    <span className="mf-court-chip">{c.type === "coberta" ? "🏛" : "☀️"}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Observações */}
          <div className="mf-group">
            <label className="mf-label" htmlFor="block-notes">Observações <span className="mf-opt">(opcional)</span></label>
            <textarea id="block-notes" className="mf-input mf-textarea"
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Professor, detalhes do evento…" rows={2} />
          </div>

          <div className="modal-footer">
            {/* RF-18: Excluir com confirmação */}
            {isEdit && onDelete && !confirmDel && (
              <button type="button" id="btn-delete-block" className="mf-btn mf-btn--del" onClick={() => setConfirmDel(true)}>
                🗑 Excluir
              </button>
            )}
            {confirmDel && (
              <div className="mf-confirm">
                <span>Confirmar exclusão?</span>
                <button type="button" className="mf-btn mf-btn--del" onClick={onDelete}>Sim, excluir</button>
                <button type="button" className="mf-btn mf-btn--cancel" onClick={() => setConfirmDel(false)}>Cancelar</button>
              </div>
            )}
            {!confirmDel && (
              <>
                <div style={{ flex: 1 }} />
                <button type="button" className="mf-btn mf-btn--cancel" onClick={onClose}>Cancelar</button>
                <button type="submit" id="btn-save-block" className="mf-btn mf-btn--save" disabled={!isValid}>
                  {isEdit ? "Salvar" : "Criar Trava"}
                </button>
              </>
            )}
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
          background: #fff; border-radius: 20px; width: 100%; max-width: 580px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.3);
          animation: slideUp 0.2s ease; max-height: 92vh; overflow-y: auto;
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
          background: #f3f4f6; color: #6b7280; cursor: pointer;
          transition: background 0.15s;
        }
        .modal-close:hover { background: #e5e7eb; }
        .modal-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

        .mf-group { display: flex; flex-direction: column; gap: 0.35rem; flex:1; }
        .mf-label { font-size: 0.8rem; font-weight: 600; color: #374151; }
        .mf-opt { font-weight: 400; color: #9ca3af; }
        .mf-input {
          height: 40px; padding: 0 0.75rem;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 0.9rem; font-family: inherit; color: #111827;
          background: #f9fafb; transition: border-color 0.15s, box-shadow 0.15s; outline: none;
        }
        .mf-input:focus { border-color: #1B4332; box-shadow: 0 0 0 3px rgba(27,67,50,0.1); background:#fff; }
        .mf-textarea { height: auto; padding: 0.5rem 0.75rem; resize: vertical; }
        .mf-row { display: flex; gap: 0.75rem; }

        .mf-options { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .mf-options--wrap { flex-wrap: wrap; }
        .mf-option, .mf-cat-option {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.8rem; font-weight: 500; color: #374151;
          background: #f9fafb; border: 1.5px solid #e5e7eb;
          border-radius: 8px; padding: 0.375rem 0.75rem;
          cursor: pointer; transition: all 0.15s;
        }
        .mf-option--active { background: #f0fdf4; border-color: #86efac; color: #15803d; }
        .mf-cat-option { font-size: 0.78rem; }

        .mf-courts-grid { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .mf-court-btn {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.8rem; font-weight: 500; font-family: inherit;
          background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 8px;
          padding: 0.35rem 0.75rem; cursor: pointer; transition: all 0.15s; color: #374151;
        }
        .mf-court-btn:hover { border-color: #d1fae5; }
        .mf-court-chip { font-size: 0.8rem; }

        .modal-footer {
          display: flex; align-items: center; gap: 0.75rem;
          padding-top: 0.75rem; border-top: 1px solid #f3f4f6;
        }
        .mf-confirm { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: #374151; }
        .mf-btn {
          height: 40px; padding: 0 1.15rem; border-radius: 10px;
          font-size: 0.875rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s;
        }
        .mf-btn--cancel { background: #f3f4f6; border: none; color: #374151; }
        .mf-btn--cancel:hover { background: #e5e7eb; }
        .mf-btn--save { background: #1B4332; border: none; color: #fff; }
        .mf-btn--save:hover:not(:disabled) { background: #2D6A4F; }
        .mf-btn--save:disabled { opacity: 0.5; cursor: not-allowed; }
        .mf-btn--del { background: #fee2e2; border: none; color: #dc2626; }
        .mf-btn--del:hover { background: #fecaca; }
        .sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); }
      `}</style>
    </div>
  )
}
