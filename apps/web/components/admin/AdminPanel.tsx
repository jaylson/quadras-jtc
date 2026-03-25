"use client"

import { useEffect, useState, useCallback } from "react"
import type { Court, AdminBlock, Manager } from "@/lib/db/schema"
import { getCategoryConfig } from "@/lib/utils/blocks"
import CourtCard from "@/components/admin/CourtCard"
import CourtModal from "@/components/admin/CourtModal"
import BlockModal from "@/components/admin/BlockModal"
import WeeklyCalendar from "@/components/admin/WeeklyCalendar"
import UpcomingBlocks from "@/components/admin/UpcomingBlocks"
import ManagerModal from "@/components/admin/ManagerModal"
import DiaryView from "@/components/admin/DiaryView"

type CourtStatus = {
  court: Court
  status: "em-uso" | "disponivel" | "bloqueada-chuva" | "inativa"
  remainingMinutes: number | null
}

type Tab = "quadras" | "agenda" | "diario" | "responsaveis" | "configuracoes"

export default function AdminPanel() {
  const [tab, setTab]               = useState<Tab>("quadras")
  const [courts, setCourts]         = useState<Court[]>([])
  const [blocks, setBlocks]         = useState<AdminBlock[]>([])
  const [statuses, setStatuses]     = useState<CourtStatus[]>([])
  const [managers, setManagers]     = useState<Manager[]>([])
  const [appUsers, setAppUsers]     = useState<{ id: number; username: string; role: string }[]>([])
  const [rainMode, setRainMode]     = useState(false)
  const [loading, setLoading]       = useState(true)

  // Modais
  const [courtModal,   setCourtModal]   = useState<{ open: boolean; court?: Court }>({ open: false })
  const [blockModal,   setBlockModal]   = useState<{ open: boolean; block?: AdminBlock }>({ open: false })
  const [managerModal, setManagerModal] = useState<{ open: boolean; manager?: Manager }>({ open: false })

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

  const fetchManagers = useCallback(async () => {
    const res = await fetch("/api/managers")
    setManagers(await res.json())
  }, [])

  const fetchAppUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users")
    if (res.ok) setAppUsers(await res.json())
  }, [])

  useEffect(() => {
    fetchAll()
    fetchBlocks()
    fetchManagers()
    fetchAppUsers()
  }, [fetchAll, fetchBlocks, fetchManagers, fetchAppUsers])

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

  async function toggleManager(id: number) {
    await fetch(`/api/managers/${id}`, { method: "PATCH" })
    fetchManagers()
  }

  async function deleteManager(id: number) {
    await fetch(`/api/managers/${id}`, { method: "DELETE" })
    fetchManagers()
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

  /* ── Salvar responsável ── */
  async function saveManager(data: Partial<Manager>) {
    if (managerModal.manager) {
      await fetch(`/api/managers/${managerModal.manager.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    } else {
      await fetch("/api/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    }
    setManagerModal({ open: false })
    fetchManagers()
  }

  async function updatePassword(username: string, newPassword: string) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, newPassword }),
    })
    if (res.ok) {
      alert(`Senha de ${username} atualizada com sucesso!`)
    } else {
      alert("Erro ao atualizar senha.")
    }
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
      <div className="ap-topbar no-print">
        <div className="ap-tabs no-print" role="tablist">
          {(["quadras", "agenda", "diario", "responsaveis", "configuracoes"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              id={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`ap-tab ${tab === t ? "ap-tab--active" : ""}`}
            >
              {t === "quadras" ? `Quadras (${courts.length})`
               : t === "agenda" ? `Agenda (${blocks.length})`
               : t === "diario" ? "Diário"
               : t === "responsaveis" ? `Responsáveis (${managers.length})`
               : "Configurações"}
            </button>
          ))}
        </div>

        <button
          id={tab === "quadras" ? "btn-nova-quadra" : tab === "agenda" ? "btn-nova-trava" : tab === "responsaveis" ? "btn-novo-responsavel" : "btn-sem-acao"}
          className="ap-primary-btn"
          style={{ visibility: (tab === "configuracoes" || tab === "diario") ? "hidden" : "visible" }}
          onClick={() =>
            tab === "quadras"
              ? setCourtModal({ open: true })
              : tab === "agenda"
              ? setBlockModal({ open: true })
              : setManagerModal({ open: true })
          }
        >
          {tab === "quadras" ? "+ Nova Quadra" : tab === "agenda" ? "+ Nova Trava" : "+ Novo Responsável"}
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

      {/* ── ABA: Diário ── */}
      {tab === "diario" && (
        <section role="tabpanel" aria-labelledby="tab-diario">
          <DiaryView courts={courts} />
        </section>
      )}

      {/* ── ABA: Responsáveis ── */}
      {tab === "responsaveis" && (
        <section role="tabpanel" aria-labelledby="tab-responsaveis">
          {managers.length === 0 && (
            <p className="ap-empty" style={{ marginTop: "2rem" }}>Nenhum responsável cadastrado.</p>
          )}
          <div className="ap-managers-grid">
            {managers.map((mgr) => {
              const SHIFT_META: Record<string, { label: string; icon: string; fds: boolean }> = {
                "manha-seg": { label: "Manhã Seg–Sex",  icon: "🌅", fds: false },
                "tarde-seg": { label: "Tarde Seg–Sex",  icon: "☀️", fds: false },
                "noite-seg": { label: "Noite Seg–Sex",  icon: "🌙", fds: false },
                "manha-fds": { label: "Manhã Sáb–Dom",  icon: "🌅", fds: true  },
                "tarde-fds": { label: "Tarde Sáb–Dom",  icon: "☀️", fds: true  },
                "noite-fds": { label: "Noite Sáb–Dom",  icon: "🌙", fds: true  },
              }
              const shifts = mgr.shifts ?? []
              return (
                <div key={mgr.id} className={`ap-mgr-card ${!mgr.active ? "ap-mgr-card--inactive" : ""}`}>
                  <div className="ap-mgr-top">
                    <div className="ap-mgr-avatar">
                      {mgr.name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase()}
                    </div>
                    <div className="ap-mgr-info">
                      <span className="ap-mgr-name">{mgr.name}</span>
                      <a className="ap-mgr-phone" href={`tel:${mgr.phone.replace(/\D/g,"")}`}>{mgr.phone}</a>
                    </div>
                    <span className={`ap-mgr-badge ${mgr.active ? "ap-mgr-badge--active" : "ap-mgr-badge--off"}`}>
                      {mgr.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="ap-mgr-shifts">
                    {shifts.length === 0
                      ? <span className="ap-mgr-no-shift">Nenhum turno definido</span>
                      : shifts.map((s) => {
                          const m = SHIFT_META[s]
                          if (!m) return null
                          return (
                            <span key={s} className={`ap-mgr-chip ${m.fds ? "ap-mgr-chip--fds" : "ap-mgr-chip--seg"}`}>
                              {m.icon} {m.label}
                            </span>
                          )
                        })
                    }
                  </div>

                  <div className="ap-mgr-actions">
                    <button
                      className="ap-mgr-btn ap-mgr-btn--toggle"
                      onClick={() => toggleManager(mgr.id)}
                    >
                      {mgr.active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      className="ap-mgr-btn ap-mgr-btn--edit"
                      onClick={() => setManagerModal({ open: true, manager: mgr })}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="ap-mgr-btn ap-mgr-btn--delete"
                      title="Excluir"
                      onClick={() => { if (confirm(`Excluir ${mgr.name}?`)) deleteManager(mgr.id) }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── ABA: Configurações ── */}
      {tab === "configuracoes" && (
        <section role="tabpanel" aria-labelledby="tab-configuracoes">
          <div className="ap-config-container">
            <h2 className="ap-config-title">Gestão de Acesso</h2>
            <p className="ap-config-intro">Altere as senhas de acesso aos módulos do sistema.</p>

            <div className="ap-users-list">
              {appUsers.map((user) => (
                <div key={user.id} className="ap-user-row">
                  <div className="ap-user-info">
                    <span className="ap-user-role-badge">
                      {user.role === "admin" ? "🛠️" : user.role === "totem" ? "🖥️" : "📺"}
                    </span>
                    <div className="ap-user-text">
                      <span className="ap-user-name">{user.username}</span>
                      <span className="ap-user-role-label">Módulo {user.role.toUpperCase()}</span>
                    </div>
                  </div>

                  <form
                    className="ap-user-pw-form"
                    onSubmit={(e) => {
                      e.preventDefault()
                      const input = (e.target as any).newPassword
                      if (input.value.length < 4) {
                        alert("A senha deve ter pelo menos 4 caracteres.")
                        return
                      }
                      updatePassword(user.username, input.value)
                      input.value = ""
                    }}
                  >
                    <input
                      name="newPassword"
                      type="password"
                      placeholder="Nova senha"
                      className="ap-config-input"
                      required
                    />
                    <button type="submit" className="ap-config-btn">Atualizar</button>
                  </form>
                </div>
              ))}
            </div>
          </div>
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

      {managerModal.open && (
        <ManagerModal
          manager={managerModal.manager}
          onSave={saveManager}
          onClose={() => setManagerModal({ open: false })}
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

        .ap-root { display: flex; flex-direction: column; gap: 1.5rem; }

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
          margin-top: 0.75rem;
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
          margin-top: 0.75rem;
        }
        .ap-empty { color: #9ca3af; text-align: center; padding: 2rem; grid-column: 1/-1; }

        /* ── Manager Cards ── */
        .ap-managers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .ap-mgr-card {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
          padding: 1.125rem 1.25rem; display: flex; flex-direction: column; gap: 0.875rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04); transition: opacity 0.2s;
        }
        .ap-mgr-card--inactive { opacity: 0.6; }
        .ap-mgr-top { display: flex; align-items: center; gap: 0.875rem; }
        .ap-mgr-avatar {
          width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
          background: #1B4332; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em;
        }
        .ap-mgr-info { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; min-width: 0; }
        .ap-mgr-name { font-size: 0.9rem; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ap-mgr-phone { font-size: 0.78rem; color: #6b7280; text-decoration: none; }
        .ap-mgr-phone:hover { color: #1B4332; text-decoration: underline; }
        .ap-mgr-badge {
          font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.55rem;
          border-radius: 999px; white-space: nowrap; flex-shrink: 0;
        }
        .ap-mgr-badge--active { background: #dcfce7; color: #15803d; }
        .ap-mgr-badge--off    { background: #f3f4f6; color: #9ca3af; }

        /* Turnos: chips */
        .ap-mgr-shifts {
          display: flex; flex-wrap: wrap; gap: 0.4rem;
        }
        .ap-mgr-chip {
          display: inline-flex; align-items: center; gap: 0.3rem;
          font-size: 0.72rem; font-weight: 500; padding: 0.25rem 0.6rem;
          border-radius: 999px; border: 1px solid;
        }
        .ap-mgr-chip--seg { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
        .ap-mgr-chip--fds { background: #fdf4ff; border-color: #e9d5ff; color: #7c3aed; }
        .ap-mgr-no-shift  { font-size: 0.75rem; color: #9ca3af; }

        .ap-mgr-actions { display: flex; gap: 0.5rem; border-top: 1px solid #f3f4f6; padding-top: 0.75rem; }
        .ap-mgr-btn {
          height: 34px; padding: 0 0.875rem; border-radius: 8px;
          font-size: 0.8rem; font-weight: 500; font-family: inherit;
          cursor: pointer; border: 1px solid #e5e7eb; background: #fff;
          transition: all 0.15s; color: #374151;
        }
        .ap-mgr-btn:hover { background: #f9fafb; }
        .ap-mgr-btn--edit  { color: #1B4332; border-color: #86efac; }
        .ap-mgr-btn--edit:hover { background: #f0fdf4; }
        .ap-mgr-btn--delete { color: #dc2626; border-color: #fecaca; margin-left: auto; padding: 0 0.7rem; }
        .ap-mgr-btn--delete:hover { background: #fef2f2; }

        /* ── Configurações ── */
        .ap-config-container {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
          padding: 1.5rem; max-width: 600px; margin-top: 0.5rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .ap-config-title {
          font-family: var(--font-dm-serif, serif);
          font-size: 1.25rem; font-weight: 400; color: #1B4332; margin: 0 0 0.5rem;
        }
        .ap-config-intro { font-size: 0.85rem; color: #6b7280; margin-bottom: 2rem; }

        .ap-users-list { display: flex; flex-direction: column; gap: 1.25rem; }
        .ap-user-row {
          display: flex; align-items: center; justify-content: space-between;
          padding-bottom: 1.25rem; border-bottom: 1px solid #f3f4f6;
          gap: 1rem; flex-wrap: wrap;
        }
        .ap-user-row:last-child { border-bottom: none; padding-bottom: 0; }
        .ap-user-info { display: flex; align-items: center; gap: 0.875rem; flex: 1; }
        .ap-user-role-badge {
          width: 40px; height: 40px; border-radius: 10px;
          background: #f0fdf4; display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }
        .ap-user-text { display: flex; flex-direction: column; }
        .ap-user-name { font-size: 0.95rem; font-weight: 600; color: #111827; }
        .ap-user-role-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }

        .ap-user-pw-form { display: flex; gap: 0.5rem; align-items: center; }
        .ap-config-input {
          height: 36px; padding: 0 0.75rem; border: 1.5px solid #e5e7eb;
          border-radius: 8px; font-size: 0.85rem; font-family: inherit;
          width: 140px; outline: none; transition: border-color 0.15s;
        }
        .ap-config-input:focus { border-color: #1B4332; }
        .ap-config-btn {
          height: 36px; padding: 0 1rem; background: #1B4332; color: #fff;
          border: none; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .ap-config-btn:hover { background: #2D6A4F; }
      `}</style>
    </div>
  )
}
