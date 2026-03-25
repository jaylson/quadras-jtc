"use client"

import { useEffect, useState, useCallback } from "react"
import type { Court, AdminBlock } from "@/lib/db/schema"
import { getCategoryConfig } from "@/lib/utils/blocks"
import CourtCard from "@/components/admin/CourtCard"
import CourtModal from "@/components/admin/CourtModal"
import BlockModal from "@/components/admin/BlockModal"
import WeeklyCalendar from "@/components/admin/WeeklyCalendar"
import UpcomingBlocks from "@/components/admin/UpcomingBlocks"

type CourtStatus = {
  court: Court
  status: "em-uso" | "disponivel" | "bloqueada-chuva" | "inativa"
  remainingMinutes: number | null
}

type Tab = "quadras" | "agenda"

export default function AdminPanel() {
  const [tab, setTab]               = useState<Tab>("quadras")
  const [courts, setCourts]         = useState<Court[]>([])
  const [blocks, setBlocks]         = useState<AdminBlock[]>([])
  const [statuses, setStatuses]     = useState<CourtStatus[]>([])
  const [rainMode, setRainMode]     = useState(false)
  const [loading, setLoading]       = useState(true)

  // Modais
  const [courtModal, setCourtModal] = useState<{ open: boolean; court?: Court }>({ open: false })
  const [blockModal, setBlockModal] = useState<{ open: boolean; block?: AdminBlock }>({ open: false })

  // Semana atual para o calendário
  const [weekOffset, setWeekOffset] = useState(0)

  /* ── Fetch ── */
  const fetchAll = useCallback(async () => {
    const [courtsRes, statusRes, settingsRes] = await Promise.all([
      fetch("/api/courts"),
      fetch("/api/courts/status"),
      fetch("/api/settings"),
    ])
    const [courtsData, statusData, settingsData] = await Promise.all([
      courtsRes.json(),
      statusRes.json(),
      settingsRes.json(),
    ])
    setCourts(courtsData)
    setStatuses(statusData)
    setRainMode(settingsData.rainMode)
    setLoading(false)
  }, [])

  const fetchBlocks = useCallback(async () => {
    // Buscar 60 dias de travas para o calendário
    const from = new Date()
    from.setDate(from.getDate() - 7)
    const to = new Date()
    to.setDate(to.getDate() + 60)
    const res = await fetch(
      `/api/blocks?from=${from.toISOString().slice(0, 10)}&to=${to.toISOString().slice(0, 10)}`
    )
    setBlocks(await res.json())
  }, [])

  useEffect(() => {
    fetchAll()
    fetchBlocks()
  }, [fetchAll, fetchBlocks])

  /* ── Estatísticas (RF-05) ── */
  const totalActive      = courts.filter((c) => c.active).length
  const totalInUse       = statuses.filter((s) => s.status === "em-uso").length
  const totalRainBlocked = statuses.filter((s) => s.status === "bloqueada-chuva").length

  /* ── Handlers ── */
  async function toggleRainMode() {
    const res = await fetch("/api/settings/rain-mode", { method: "PATCH" })
    const data = await res.json()
    setRainMode(data.rainMode)
    fetchAll()
  }

  async function toggleCourt(id: number) {
    await fetch(`/api/courts/${id}/toggle`, { method: "PATCH" })
    fetchAll()
  }

  async function deleteCourt(id: number) {
    await fetch(`/api/courts/${id}`, { method: "DELETE" })
    fetchAll()
  }

  async function deleteBlock(id: number) {
    await fetch(`/api/blocks/${id}`, { method: "DELETE" })
    fetchBlocks()
  }

  /* ── Salvar quadra ── */
  async function saveCourt(data: Partial<Court>) {
    if (courtModal.court) {
      await fetch(`/api/courts/${courtModal.court.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    } else {
      await fetch("/api/courts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    }
    setCourtModal({ open: false })
    fetchAll()
  }

  /* ── Salvar trava ── */
  async function saveBlock(data: Partial<AdminBlock>) {
    if (blockModal.block) {
      await fetch(`/api/blocks/${blockModal.block.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    } else {
      await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    }
    setBlockModal({ open: false })
    fetchBlocks()
  }

  if (loading) {
    return (
      <div className="ap-loading">
        <span className="ap-spinner" />
        Carregando painel…
      </div>
    )
  }

  return (
    <div className="ap-root">

      {/* ── Top Bar: abas + botão primário (RF-11) ── */}
      <div className="ap-topbar">
        <div className="ap-tabs" role="tablist">
          {(["quadras", "agenda"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`ap-tab ${tab === t ? "ap-tab--active" : ""}`}
            >
              {t === "quadras" ? `Quadras (${courts.length})` : `Agenda (${blocks.length})`}
            </button>
          ))}
        </div>

        <button
          id={tab === "quadras" ? "btn-nova-quadra" : "btn-nova-trava"}
          className="ap-primary-btn"
          onClick={() =>
            tab === "quadras"
              ? setCourtModal({ open: true })
              : setBlockModal({ open: true })
          }
        >
          {tab === "quadras" ? "+ Nova Quadra" : "+ Nova Trava"}
        </button>
      </div>

      {/* ── ABA: Quadras ── */}
      {tab === "quadras" && (
        <section role="tabpanel" aria-labelledby="tab-quadras">

          {/* RF-05: cards de estatísticas */}
          <div className="ap-stats">
            <div className="ap-stat-card">
              <span className="ap-stat-value">{totalActive}</span>
              <span className="ap-stat-label">Quadras Ativas</span>
            </div>
            <div className="ap-stat-card ap-stat-card--use">
              <span className="ap-stat-value">{totalInUse}</span>
              <span className="ap-stat-label">Em Uso Agora</span>
            </div>
            {rainMode && (
              <div className="ap-stat-card ap-stat-card--rain">
                <span className="ap-stat-value">{totalRainBlocked}</span>
                <span className="ap-stat-label">Bloqueadas (Chuva)</span>
              </div>
            )}
          </div>

          {/* RF-06: Toggle Modo Chuva */}
          <div className={`ap-rain-bar ${rainMode ? "ap-rain-bar--active" : ""}`}>
            <div className="ap-rain-info">
              <span className="ap-rain-icon">{rainMode ? "🌧️" : "☀️"}</span>
              <span className="ap-rain-label">
                <strong>Modo Chuva</strong>
                {rainMode
                  ? " — Ativo: quadras descobertas bloqueadas automaticamente"
                  : " — Inativo: todas as quadras disponíveis"}
              </span>
            </div>
            <button
              id="btn-rain-mode"
              onClick={toggleRainMode}
              className={`ap-rain-toggle ${rainMode ? "ap-rain-toggle--on" : ""}`}
              aria-pressed={rainMode}
            >
              <span className="ap-rain-toggle-thumb" />
            </button>
          </div>

          {/* RF-07: Grid de CourtCards */}
          <div className="ap-courts-grid">
            {courts.length === 0 && (
              <p className="ap-empty">Nenhuma quadra cadastrada.</p>
            )}
            {courts.map((court) => {
              const s = statuses.find((s) => s.court.id === court.id)
              return (
                <CourtCard
                  key={court.id}
                  court={court}
                  status={s?.status ?? "inativa"}
                  remainingMinutes={s?.remainingMinutes ?? null}
                  onToggle={() => toggleCourt(court.id)}
                  onEdit={() => setCourtModal({ open: true, court })}
                  onDelete={() => deleteCourt(court.id)}
                />
              )
            })}
          </div>
        </section>
      )}

      {/* ── ABA: Agenda ── */}
      {tab === "agenda" && (
        <section role="tabpanel" aria-labelledby="tab-agenda">
          <WeeklyCalendar
            courts={courts}
            blocks={blocks}
            weekOffset={weekOffset}
            onWeekChange={setWeekOffset}
            onBlockClick={(b) => setBlockModal({ open: true, block: b })}
          />
          <UpcomingBlocks
            blocks={blocks}
            courts={courts}
            onEdit={(b) => setBlockModal({ open: true, block: b })}
            onDelete={deleteBlock}
          />
        </section>
      )}

      {/* ── Modais ── */}
      {courtModal.open && (
        <CourtModal
          court={courtModal.court}
          onSave={saveCourt}
          onClose={() => setCourtModal({ open: false })}
        />
      )}

      {blockModal.open && (
        <BlockModal
          block={blockModal.block}
          courts={courts}
          onSave={saveBlock}
          onClose={() => setBlockModal({ open: false })}
          onDelete={blockModal.block ? () => { deleteBlock(blockModal.block!.id); setBlockModal({ open: false }) } : undefined}
        />
      )}

      <style>{`
        .ap-loading {
          display: flex; align-items: center; gap: 0.75rem;
          justify-content: center; padding: 4rem;
          color: #6b7280; font-size: 0.9rem;
        }
        .ap-spinner {
          width: 20px; height: 20px; border-radius: 50%;
          border: 2px solid #e5e7eb; border-top-color: #1B4332;
          animation: spin 0.7s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ap-root { display: flex; flex-direction: column; gap: 1.25rem; }

        /* ── Topbar ── */
        .ap-topbar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem;
        }
        .ap-tabs {
          display: flex; gap: 0.25rem;
          background: #fff; border: 1px solid #e5e7eb;
          border-radius: 12px; padding: 3px;
        }
        .ap-tab {
          padding: 0.45rem 1.1rem; border-radius: 9px;
          font-size: 0.875rem; font-weight: 500; font-family: inherit;
          background: transparent; border: none; cursor: pointer;
          color: #6b7280; transition: all 0.15s;
        }
        .ap-tab--active { background: #1B4332; color: #fff; }
        .ap-tab:hover:not(.ap-tab--active) { background: #f0fdf4; color: #1B4332; }

        .ap-primary-btn {
          height: 40px; padding: 0 1.25rem;
          background: #1B4332; color: #fff;
          border: none; border-radius: 10px;
          font-size: 0.875rem; font-weight: 600; font-family: inherit;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .ap-primary-btn:hover { background: #2D6A4F; }
        .ap-primary-btn:active { transform: scale(0.97); }

        /* ── Stats ── */
        .ap-stats {
          display: flex; gap: 1rem; flex-wrap: wrap;
        }
        .ap-stat-card {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
          padding: 1rem 1.5rem; display: flex; flex-direction: column;
          gap: 0.15rem; min-width: 140px; flex: 1;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .ap-stat-card--use  { border-color: #86efac; background: #f0fdf4; }
        .ap-stat-card--rain { border-color: #fed7aa; background: #fff7ed; }
        .ap-stat-value {
          font-family: var(--font-dm-serif, serif);
          font-size: 2rem; font-weight: 400; color: #1B4332; line-height: 1;
        }
        .ap-stat-card--rain .ap-stat-value { color: #c2410c; }
        .ap-stat-label { font-size: 0.75rem; color: #6b7280; font-weight: 500; }

        /* ── Rain bar ── */
        .ap-rain-bar {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; padding: 0.875rem 1.25rem;
          background: #fff; border: 1.5px solid #e5e7eb; border-radius: 14px;
          transition: border-color 0.2s, background 0.2s;
        }
        .ap-rain-bar--active { background: #fff7ed; border-color: #fed7aa; }
        .ap-rain-info { display: flex; align-items: center; gap: 0.75rem; }
        .ap-rain-icon { font-size: 1.25rem; }
        .ap-rain-label { font-size: 0.875rem; color: #374151; }
        .ap-rain-label strong { color: #1B4332; }
        .ap-rain-bar--active .ap-rain-label strong { color: #c2410c; }

        .ap-rain-toggle {
          width: 46px; height: 26px; border-radius: 999px;
          background: #d1d5db; border: none; cursor: pointer;
          position: relative; transition: background 0.2s; flex-shrink: 0;
        }
        .ap-rain-toggle--on { background: #f97316; }
        .ap-rain-toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 20px; height: 20px; border-radius: 50%;
          background: #fff; transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .ap-rain-toggle--on .ap-rain-toggle-thumb { transform: translateX(20px); }

        /* ── Grid ── */
        .ap-courts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .ap-empty { color: #9ca3af; text-align: center; padding: 2rem; grid-column: 1/-1; }
      `}</style>
    </div>
  )
}
