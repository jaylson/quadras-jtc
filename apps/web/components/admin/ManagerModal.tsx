"use client"

import { useState, useEffect } from "react"
import type { Manager, ManagerShift } from "@/lib/db/schema"

interface ManagerModalProps {
  manager?: Manager
  onSave:   (data: Partial<Manager>) => void
  onClose:  () => void
}

type ShiftOption = { value: ManagerShift; icon: string; label: string; hours: string; fds: boolean }

const SHIFT_OPTIONS: ShiftOption[] = [
  { value: "manha-seg", icon: "🌅", label: "Manhã",  hours: "06h–12h", fds: false },
  { value: "tarde-seg", icon: "☀️", label: "Tarde",  hours: "12h–18h", fds: false },
  { value: "noite-seg", icon: "🌙", label: "Noite",  hours: "18h–00h", fds: false },
  { value: "manha-fds", icon: "🌅", label: "Manhã",  hours: "06h–12h", fds: true  },
  { value: "tarde-fds", icon: "☀️", label: "Tarde",  hours: "12h–18h", fds: true  },
  { value: "noite-fds", icon: "🌙", label: "Noite",  hours: "18h–00h", fds: true  },
]

export default function ManagerModal({ manager, onSave, onClose }: ManagerModalProps) {
  const isEdit = !!manager

  const [name,   setName]   = useState(manager?.name   ?? "")
  const [phone,  setPhone]  = useState(manager?.phone  ?? "")
  const [shifts, setShifts] = useState<ManagerShift[]>(manager?.shifts ?? [])
  const [error,  setError]  = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const isValid = name.trim().length > 0 && phone.trim().length > 0 && shifts.length > 0

  function toggleShift(s: ManagerShift) {
    setShifts((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim())        { setError("Nome é obrigatório");             return }
    if (!phone.trim())       { setError("Telefone é obrigatório");         return }
    if (shifts.length === 0) { setError("Selecione ao menos um turno");    return }
    onSave({ name: name.trim(), phone: phone.trim(), shifts })
  }

  function handlePhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    let formatted = digits
    if (digits.length > 2)  formatted = `(${digits.slice(0,2)}) ${digits.slice(2)}`
    if (digits.length > 7)  formatted = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`
    setPhone(formatted)
    setError(null)
  }

  const weekdayOpts = SHIFT_OPTIONS.filter((s) => !s.fds)
  const weekendOpts = SHIFT_OPTIONS.filter((s) =>  s.fds)

  return (
    <div className="mm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="mm-box" role="dialog" aria-modal="true" aria-labelledby="manager-modal-title">

        <div className="mm-header">
          <h2 id="manager-modal-title" className="mm-title">
            {isEdit ? "Editar Responsável" : "Novo Responsável"}
          </h2>
          <button className="mm-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="mm-form" noValidate>
          {error && <p className="mm-error">{error}</p>}

          {/* Nome */}
          <div className="mm-group">
            <label className="mm-label" htmlFor="mgr-name">Nome *</label>
            <input
              id="mgr-name"
              className="mm-input"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null) }}
              placeholder="Ex: Carlos Mendes"
              autoFocus
            />
          </div>

          {/* Telefone */}
          <div className="mm-group">
            <label className="mm-label" htmlFor="mgr-phone">Telefone / WhatsApp *</label>
            <input
              id="mgr-phone"
              className="mm-input"
              type="tel"
              value={phone}
              onChange={(e) => handlePhone(e.target.value)}
              placeholder="(41) 99999-9999"
            />
          </div>

          {/* Turnos */}
          <div className="mm-group">
            <label className="mm-label">Turnos de Trabalho * <span className="mm-hint">(pode selecionar múltiplos)</span></label>

            {/* Dias úteis */}
            <div className="mm-shift-section">
              <span className="mm-shift-section-title mm-shift-section-title--seg">📅 Segunda a Sexta</span>
              <div className="mm-shift-row">
                {weekdayOpts.map((s) => (
                  <label
                    key={s.value}
                    className={`mm-shift-opt ${shifts.includes(s.value) ? "mm-shift-opt--on" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={shifts.includes(s.value)}
                      onChange={() => toggleShift(s.value)}
                    />
                    <span className="mm-shift-icon">{s.icon}</span>
                    <span className="mm-shift-name">{s.label}</span>
                    <span className="mm-shift-hours">{s.hours}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fim de semana */}
            <div className="mm-shift-section">
              <span className="mm-shift-section-title mm-shift-section-title--fds">🗓 Sábado e Domingo</span>
              <div className="mm-shift-row">
                {weekendOpts.map((s) => (
                  <label
                    key={s.value}
                    className={`mm-shift-opt mm-shift-opt--fds ${shifts.includes(s.value) ? "mm-shift-opt--on" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={shifts.includes(s.value)}
                      onChange={() => toggleShift(s.value)}
                    />
                    <span className="mm-shift-icon">{s.icon}</span>
                    <span className="mm-shift-name">{s.label}</span>
                    <span className="mm-shift-hours">{s.hours}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mm-footer">
            <button type="button" className="mm-btn mm-btn--cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" id="btn-save-manager" className="mm-btn mm-btn--save" disabled={!isValid}>
              {isEdit ? "Salvar Alterações" : "Criar Responsável"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .mm-overlay {
          position: fixed; inset: 0; z-index: 50;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem; animation: mmFadeIn 0.15s ease;
        }
        @keyframes mmFadeIn { from{opacity:0} to{opacity:1} }

        .mm-box {
          background: #fff; border-radius: 20px; width: 100%; max-width: 520px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.3);
          animation: mmSlideUp 0.2s ease;
          max-height: 92vh; overflow-y: auto;
        }
        @keyframes mmSlideUp { from{transform:translateY(16px);opacity:0} to{transform:translateY(0);opacity:1} }

        .mm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 1.5rem 0;
        }
        .mm-title {
          font-family: var(--font-dm-serif, serif);
          font-size: 1.35rem; font-weight: 400; color: #111827; margin: 0;
        }
        .mm-close {
          width: 32px; height: 32px; border-radius: 50%; border: none;
          background: #f3f4f6; color: #6b7280; cursor: pointer; font-size: 0.85rem;
          transition: background 0.15s;
        }
        .mm-close:hover { background: #e5e7eb; color: #111827; }

        .mm-form { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }
        .mm-error {
          font-size: 0.85rem; color: #dc2626;
          background: #fef2f2; border: 1px solid #fecaca;
          border-radius: 8px; padding: 0.6rem 0.875rem; margin: 0;
        }

        .mm-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .mm-label { font-size: 0.8rem; font-weight: 600; color: #374151; }
        .mm-hint  { font-weight: 400; color: #9ca3af; font-size: 0.75rem; }

        .mm-input {
          height: 42px; padding: 0 0.875rem;
          border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 0.9rem; font-family: inherit; color: #111827;
          background: #f9fafb; transition: border-color 0.15s, box-shadow 0.15s; outline: none;
        }
        .mm-input:focus { border-color: #1B4332; box-shadow: 0 0 0 3px rgba(27,67,50,0.1); background:#fff; }

        /* Seções de turno */
        .mm-shift-section { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; }
        .mm-shift-section-title {
          font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; padding: 0.25rem 0.6rem; border-radius: 6px;
          display: inline-flex; align-items: center; gap: 0.3rem; width: fit-content;
        }
        .mm-shift-section-title--seg { background: #eff6ff; color: #1d4ed8; }
        .mm-shift-section-title--fds { background: #fdf4ff; color: #7c3aed; }

        .mm-shift-row { display: flex; gap: 0.5rem; }
        .mm-shift-opt {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.2rem;
          padding: 0.75rem 0.4rem;
          background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 10px;
          cursor: pointer; transition: all 0.15s; text-align: center;
          position: relative;
        }
        .mm-shift-opt--on {
          background: #eff6ff; border-color: #93c5fd;
        }
        .mm-shift-opt--on::after {
          content: "✓";
          position: absolute; top: 4px; right: 6px;
          font-size: 0.65rem; font-weight: 700; color: #1d4ed8;
        }
        .mm-shift-opt--fds.mm-shift-opt--on {
          background: #fdf4ff; border-color: #c4b5fd;
        }
        .mm-shift-opt--fds.mm-shift-opt--on::after { color: #7c3aed; }
        .mm-shift-opt:hover:not(.mm-shift-opt--on) { border-color: #d1d5db; background: #f3f4f6; }

        .mm-shift-icon  { font-size: 1.3rem; line-height: 1; }
        .mm-shift-name  { font-size: 0.75rem; font-weight: 600; color: #374151; }
        .mm-shift-hours { font-size: 0.65rem; color: #9ca3af; }
        .mm-shift-opt--on .mm-shift-name { color: #1d4ed8; }
        .mm-shift-opt--fds.mm-shift-opt--on .mm-shift-name { color: #7c3aed; }

        .mm-footer {
          display: flex; justify-content: flex-end; gap: 0.75rem;
          padding-top: 0.5rem; border-top: 1px solid #f3f4f6; margin-top: 0.25rem;
        }
        .mm-btn {
          height: 40px; padding: 0 1.25rem; border-radius: 10px;
          font-size: 0.875rem; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: all 0.15s;
        }
        .mm-btn--cancel { background: #f3f4f6; border: none; color: #374151; }
        .mm-btn--cancel:hover { background: #e5e7eb; }
        .mm-btn--save { background: #1B4332; border: none; color: #fff; }
        .mm-btn--save:hover:not(:disabled) { background: #2D6A4F; }
        .mm-btn--save:disabled { opacity: 0.5; cursor: not-allowed; }
        .sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); }
      `}</style>
    </div>
  )
}
