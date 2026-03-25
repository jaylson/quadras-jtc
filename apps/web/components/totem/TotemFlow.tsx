"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import type { Court } from "@/lib/db/schema"
import WeatherEffect from "@/components/totem/WeatherEffect"
import TotemCourtCard from "@/components/totem/TotemCourtCard"

/** Helper Types **/
type CourtStatus = {
  court: Court
  status: "em-uso" | "disponivel" | "bloqueada-chuva" | "inativa"
  remainingMinutes: number | null
}
type FilterOpt = "todas" | "coberta" | "descoberta" | "disponivel"

interface PlayerInput {
  name: string
  phone: string
  document: string
}
// RN-07: limites exatos (a regra diz 2 simples, 3-4 duplas. Vamos simplificar limites para UI)
const GAME_TYPES = {
  simples: { label: "Simples", min: 2, max: 2, icon: "👤👤" },
  duplas:  { label: "Duplas",  min: 3, max: 4, icon: "👥👥" },
}

function formatPhone(val: string) {
  const digits = val.replace(/\D/g, "")
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

export default function TotemFlow() {
  const [loading, setLoading]     = useState(true)
  const [rainMode, setRainMode]   = useState(false)
  const [courts, setCourts]       = useState<Court[]>([])
  const [statuses, setStatuses]   = useState<CourtStatus[]>([])

  // Fluxo de etapas (1 = quadra, 2 = tipo, 3 = jogadores, 4 = sucesso)
  const [step, setStep]           = useState<1 | 2 | 3 | 4>(1)

  // Filtros Etapa 1
  const [filter, setFilter]       = useState<FilterOpt>("todas")
  const [search, setSearch]       = useState("")

  // Seleções
  const [selectedCourt, setSelectedCourt] = useState<CourtStatus | null>(null)
  const [nextSlot, setNextSlot]           = useState<{ startTime: string; endTime: string; durationMinutes?: number } | null>(null)
  const [gameCategory, setGameCategory]   = useState<"simples" | "duplas">("simples")
  const [players, setPlayers]             = useState<PlayerInput[]>([{ name: "", phone: "", document: "" }])

  const [saving, setSaving]       = useState(false)

  /* ── 1. Carga Inicial ── */
  const fetchData = useCallback(async () => {
    try {
      const [cRes, sRes, optRes] = await Promise.all([
        fetch("/api/courts"),
        fetch("/api/courts/status"),
        fetch("/api/settings"),
      ])
      const [cData, sData, optData] = await Promise.all([
        cRes.json(), sRes.json(), optRes.json(),
      ])

      // Para a view do Totem, vamos também buscar o nextSlot de todas antecipadamente (opcional) ou não.
      // Em prol de performance, vamos usar um estado simplificado e buscar o slot exato ao selecionar.
      setCourts(cData)
      setStatuses(sData)
      setRainMode(optData.rainMode)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    // Refresh periódico a cada 30 seg
    const id = setInterval(fetchData, 30000)
    return () => clearInterval(id)
  }, [fetchData])

  /* ── 2. Handlers Fluxo ── */
  async function handleSelectCourt(cs: CourtStatus) {
    setSelectedCourt(cs)
    setLoading(true)
    try {
      // Calcular o próximo slot disponível na API
      const res = await fetch(`/api/reservations/slot?courtId=${cs.court.id}`)
      if (res.ok) {
        const slotData = await res.json()
        setNextSlot({ startTime: slotData.startTime.slice(11, 16), endTime: slotData.endTime.slice(11, 16), durationMinutes: slotData.durationMinutes })
      }
    } finally {
      setLoading(false)
      setStep(2)
    }
  }

  function handleSelectType(type: "simples" | "duplas") {
    setGameCategory(type)
    // Inicializa a array de players pro tamanho mínimo
    const config = GAME_TYPES[type]
    const p = Array.from({ length: config.min }, () => ({ name: "", phone: "", document: "" }))
    setPlayers(p)
    setStep(3)
  }

  function addPlayer() {
    setPlayers((prev) => [...prev, { name: "", phone: "", document: "" }])
  }
  function updatePlayer(index: number, field: keyof PlayerInput, val: string) {
    setPlayers((prev) => {
      const copy = [...prev]
      if (field === "phone") {
        copy[index][field] = formatPhone(val)
      } else {
        copy[index][field] = val
      }
      return copy
    })
  }

  function removePlayer(index: number) {
    setPlayers((prev) => prev.filter((_, i) => i !== index))
  }

  // Validação Etapa 3 (RN-08)
  const isFormValid = players.every((p, i) => {
    const phoneDigits = p.phone.replace(/\D/g, "")
    const isValidPhone = p.phone.trim() === "" || phoneDigits.length >= 10
    if (i === 0) return p.name.trim() !== "" && p.phone.trim() !== "" && isValidPhone
    return p.name.trim() !== "" && isValidPhone
  }) && players.length >= GAME_TYPES[gameCategory].min && players.length <= GAME_TYPES[gameCategory].max

  async function handleSubmit() {
    if (!isFormValid || !selectedCourt || !nextSlot) return
    setSaving(true)

    // Ajuste de datas (vamos assumir q o check in é p hoje sempre)
    const today = new Date().toISOString().slice(0, 10)

    try {
       const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           courtId: selectedCourt.court.id,
           gameType: gameCategory,
           // Formatamos local p isolar fuso, simplificado p Totem
           startTime: `${today}T${nextSlot.startTime}:00.000Z`,
           endTime: `${today}T${nextSlot.endTime}:00.000Z`,
           players
        })
       })
       if (!res.ok) {
         const err = await res.json()
         alert(`Erro: ${err.error || "Falha ao fazer check-in"}`)
         return
       }
       setStep(4)
    } catch (e) {
       alert("Erro de conexão ao salvar.")
    } finally {
       setSaving(false)
    }
  }

  function handleRestart() {
    setStep(1)
    setSelectedCourt(null)
    setNextSlot(null)
    setPlayers([{ name: "", phone: "", document: "" }])
    fetchData()
  }

  /* ── Filtros Visuais ── */
  const filteredCourts = statuses.filter(s => {
    // 1. match pill
    if (filter === "coberta" && s.court.type !== "coberta") return false
    if (filter === "descoberta" && s.court.type !== "descoberta") return false
    if (filter === "disponivel" && s.status !== "disponivel") return false

    // 2. search bar (nome/número/sup)
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchName = s.court.name.toLowerCase().includes(q)
      const matchSurf = s.court.surface.toLowerCase().includes(q)
      if (!matchName && !matchSurf) return false
    }
    return true
  })

  // F4-03c: header styling
  const headerBg = rainMode ? "#374151" : "#1B4332"

  if (loading && step === 1) return <div className="tf-full-loader"><div className="ap-spinner"/></div>

  return (
    <div className="tf-container">
      {/* Background Weather Effect (F4-03) */}
      <WeatherEffect rainMode={rainMode} />

      {/* Conteúdo principal sobreposto com z-index */}
      <div className="tf-content-layer">

        {/* HEADER */}
        <header className="tf-header" style={{ background: headerBg, transition: "background 0.5s" }}>
          <div className="tf-brand">
             <Link href="/" style={{ textDecoration: 'none', color: '#fff' }}>
                 <span style={{ fontSize: "1.8rem" }}>🎾</span>
                 <span className="tf-brand-name">JTC</span>
             </Link>
          </div>

          {/* Stepper Center (F4-02) - só mostrar em 1,2,3 */}
          {step <= 3 && (
            <div className="tf-stepper">
              <div className={`tf-step-item ${step >= 1 ? "active" : ""}`}>
                <div className="tf-step-icon">{step > 1 ? "✓" : "1"}</div>
                <span className="tf-step-label">Quadra</span>
              </div>
              <div className={`tf-step-line ${step >= 2 ? "active" : ""}`} />

              <div className={`tf-step-item ${step >= 2 ? "active" : ""}`}>
                <div className="tf-step-icon">{step > 2 ? "✓" : "2"}</div>
                <span className="tf-step-label">Jogo</span>
              </div>
              <div className={`tf-step-line ${step >= 3 ? "active" : ""}`} />

              <div className={`tf-step-item ${step >= 3 ? "active" : ""}`}>
                <div className="tf-step-icon">3</div>
                <span className="tf-step-label">Jogadores</span>
              </div>
            </div>
          )}

          <div className="tf-header-right">
             <span>Check-in Rápido</span>
          </div>
        </header>

        {/* BANNER DE CHUVA (F4-04) */}
        {rainMode && step <= 3 && (
          <div className="tf-rain-banner">
             <strong>⚠️ MODO CHUVA ATIVO:</strong> As quadras descobertas estão temporariamente bloqueadas.
          </div>
        )}

        <main className="tf-main">
          {/* =========================================================
                                ETAPA 1
             ========================================================= */}
          {step === 1 && (
            <div className="tf-anim-enter">
              <h1 className="tf-page-title">Escolha a Quadra</h1>

              {/* Controles F4-05 e F4-06 */}
              <div className="tf-controls">
                <div className="tf-pills">
                  {(["todas","coberta","descoberta","disponivel"] as FilterOpt[]).map(opt => {
                    const labels = { todas:"Todas", coberta:"Cobertas", descoberta:"Descobertas", disponivel:"Disponíveis Agora" }
                    return (
                      <button key={opt}
                        className={`tf-pill ${filter === opt ? "tf-pill--active" : ""}`}
                        onClick={() => setFilter(opt)}
                      >
                        {labels[opt]}
                      </button>
                    )
                  })}
                </div>
                <input
                  type="search"
                  className="tf-search"
                  placeholder="🔍 Buscar por nome..."
                  value={search} onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Grid Quadras */}
              <div className="tf-grid">
                {filteredCourts.length === 0 ? (
                   <p className="tf-empty">Nenhuma quadra atende aos filtros.</p>
                ) : (
                  filteredCourts.map(s => (
                    <TotemCourtCard
                      key={s.court.id}
                      court={s.court}
                      status={s.status}
                      remainingMinutes={s.remainingMinutes}
                      rainMode={rainMode}
                      onSelect={() => handleSelectCourt(s)}
                    />
                  ))
                )}
              </div>
            </div>
          )}


          {/* =========================================================
                                ETAPA 2
             ========================================================= */}
          {step === 2 && selectedCourt && (
            <div className="tf-anim-enter tf-step2">
              <button className="tf-back-btn" onClick={() => setStep(1)}>← Voltar às Quadras</button>

              <h1 className="tf-page-title" style={{ textAlign: "center", marginTop: "2rem" }}>
                Qual tipo de jogo na {selectedCourt.court.name}?
              </h1>
              <p className="tf-subtitle">Seu horário será as {nextSlot?.startTime}</p>

              <div className="tf-game-cards">
                {(["simples","duplas"] as const).map(type => (
                  <button key={type} className="tf-game-card" onClick={() => handleSelectType(type)}>
                    <span className="tf-game-icon">{GAME_TYPES[type].icon}</span>
                    <h3 className="tf-game-label">{GAME_TYPES[type].label}</h3>
                    <p className="tf-game-desc">Máximo {GAME_TYPES[type].max} jogadores</p>
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* =========================================================
                                ETAPA 3
             ========================================================= */}
          {step === 3 && selectedCourt && nextSlot && (
            <div className="tf-anim-enter tf-step3">
              <button className="tf-back-btn" onClick={() => setStep(2)}>← Voltar: Tipo de Jogo</button>

              <div className="tf-split">
                <div className="tf-left">
                  {/* F4-11 Resumo */}
                  <div className="tf-summary">
                     <h2 className="tf-summary-title">Resumo do Check-in</h2>
                     <div className="tf-summ-item"><span>Quadra:</span> <strong>{selectedCourt.court.name} ({selectedCourt.court.surface})</strong></div>
                     <div className="tf-summ-item"><span>Tipo:</span> <strong>{GAME_TYPES[gameCategory].label}</strong></div>
                     <div className="tf-summ-item"><span>Horário:</span> <strong style={{color:"#15803d", fontSize:"1.2rem"}}>{nextSlot.startTime} – {nextSlot.endTime} (⏱ {nextSlot.durationMinutes} min)</strong></div>
                  </div>

                  <button
                    className="tf-confirm-btn"
                    disabled={!isFormValid || saving}
                    onClick={handleSubmit}
                  >
                    {saving ? "Salvando..." : "Confirmar Check-in ✓"}
                  </button>
                  {!isFormValid && (
                    <p className="tf-warn">Preencha os campos obrigatórios (*).</p>
                  )}
                </div>

                <div className="tf-right">
                   <h2 className="tf-players-title">Identificação dos Jogadores</h2>
                   {/* F4-09 Forms */}
                   {players.map((p, index) => (
                     <div key={index} className="tf-player-card">
                       <div className="tf-pc-header">
                         <span className="tf-pc-badge">Jogador {index + 1}</span>
                         {index > 0 && index >= GAME_TYPES[gameCategory].min && (
                           <button className="tf-pc-del" onClick={() => removePlayer(index)}>✕</button>
                         )}
                       </div>
                       <div className="tf-pc-body">
                         {index === 0 ? (
                           <>
                             <div className="tf-field">
                               <label>Nome Completo * (Responsável)</label>
                               <input type="text" placeholder="Ex: João Silva" value={p.name}
                                 onChange={e => updatePlayer(index, "name", e.target.value)} />
                             </div>
                             <div className="tf-field-row">
                               <div className="tf-field">
                                 <label>WhatsApp *</label>
                                 <input type="tel" placeholder="(11) 99999-9999" value={p.phone}
                                   onChange={e => updatePlayer(index, "phone", e.target.value)} />
                               </div>
                               <div className="tf-field">
                                 <label>Carteirinha (Opcional)</label>
                                 <input type="text" placeholder="Nº Sócio" value={p.document}
                                   onChange={e => updatePlayer(index, "document", e.target.value)} />
                               </div>
                             </div>
                           </>
                         ) : (
                           <div className="tf-field-row">
                             <div className="tf-field" style={{ flex: 1.5 }}>
                               <label>Nome Completo *</label>
                               <input type="text" placeholder="Ex: Maria" value={p.name}
                                 onChange={e => updatePlayer(index, "name", e.target.value)} />
                             </div>
                             <div className="tf-field" style={{ flex: 1 }}>
                               <label>WhatsApp (Opcional)</label>
                               <input type="tel" placeholder="(11) 99999-9999" value={p.phone}
                                 onChange={e => updatePlayer(index, "phone", e.target.value)} />
                             </div>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}

                   {/* F4-10 Btn Dashed */}
                   {players.length < GAME_TYPES[gameCategory].max && (
                     <button className="tf-add-player" onClick={addPlayer}>
                        + Adicionar Jogador Opcional
                     </button>
                   )}
                </div>
              </div>
            </div>
          )}


          {/* =========================================================
                             ETAPA 4: SUCESSO
             ========================================================= */}
          {step === 4 && (
            <div className="tf-anim-enter tf-success">
              <div className="tf-success-box">
                <div className="tf-check-anim">✓</div>
                <h1 className="tf-page-title">Check-in Confirmado!</h1>
                <p className="tf-success-desc">Seu check-in foi realizado e a quadra está pronta para o jogo. Tenha uma ótima partida!</p>

                <div className="tf-success-details">
                  <div className="tf-sd-item"><span>Quadra:</span> <strong>{selectedCourt?.court.name}</strong></div>
                  <div className="tf-sd-item"><span>Horário:</span> <strong>{nextSlot?.startTime} – {nextSlot?.endTime}</strong></div>
                  <div className="tf-sd-item"><span>Jogadores:</span> <strong>{players.length} confirmados</strong></div>
                </div>

                <button className="tf-restart-btn" onClick={handleRestart}>
                  Novo Check-in
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        /* Animações e base */
        .tf-full-loader { display:flex; align-items:center; justify-content:center; height:100vh; }
        .tf-container { position:relative; min-height:100vh; overflow:hidden; }
        .tf-content-layer { position:relative; z-index:10; display:flex; flex-direction:column; height:100vh; }

        .tf-anim-enter { animation: fadeInUp 0.3s ease forwards; }
        @keyframes fadeInUp { from {opacity:0; transform:translateY(15px)} to {opacity:1; transform:translateY(0)} }

        /* Header */
        .tf-header {
           height:80px; padding:0 2.5rem; display:flex; align-items:center; justify-content:space-between;
           color:#fff; box-shadow:0 4px 15px rgba(0,0,0,0.1); flex-shrink:0;
        }
        .tf-brand { display:flex; align-items:center; gap:0.5rem; text-decoration:none; color:#fff; }
        .tf-brand-name { font-family:var(--font-dm-serif,serif); font-size:1.6rem; letter-spacing:0.02em; }
        .tf-header-right { font-size:1.1rem; font-weight:600; opacity:0.8; }

        /* Stepper */
        .tf-stepper { display:flex; align-items:center; gap:1rem; }
        .tf-step-item { display:flex; align-items:center; gap:0.5rem; opacity:0.5; transition:all 0.3s; }
        .tf-step-item.active { opacity:1; }
        .tf-step-icon {
          width:36px; height:36px; border-radius:50%; background:rgba(255,255,255,0.2);
          display:flex; align-items:center; justify-content:center;
          font-weight:700; font-size:1.1rem; border:2px solid rgba(255,255,255,0.3); transition:all 0.3s;
        }
        .tf-step-item.active .tf-step-icon { background:#fff; color:#1B4332; border-color:#fff; }
        .tf-step-label { font-weight:600; font-size:1.05rem; letter-spacing:0.02em; }
        .tf-step-line { width:40px; height:3px; background:rgba(255,255,255,0.2); border-radius:2px; transition:all 0.3s; }
        .tf-step-line.active { background:rgba(255,255,255,0.8); }

        .tf-rain-banner { background:#f97316; color:#fff; text-align:center; padding:0.8rem; font-weight:500; font-size:1.1rem; }

        /* Main area */
        .tf-main { flex:1; padding:2rem 3rem; overflow-y:auto; }

        .tf-page-title { font-family:var(--font-dm-serif,serif); font-size:2.8rem; color:#111827; margin:0 0 1.5rem 0; font-weight:400; }
        .tf-subtitle { text-align:center; font-size:1.4rem; color:#4b5563; font-weight:500; margin-top:-1rem; margin-bottom:2rem; }

        /* Etapa 1: Controles */
        .tf-controls { display:flex; align-items:center; justify-content:space-between; margin-bottom:2rem; flex-wrap:wrap; gap:1rem; }
        .tf-pills { display:flex; gap:0.5rem; }
        .tf-pill {
           padding:0.75rem 1.5rem; border-radius:999px; border:2px solid #e5e7eb; background:#fff;
           font-size:1.1rem; font-weight:600; font-family:inherit; color:#4b5563; cursor:pointer;
           transition:all 0.2s; box-shadow:0 2px 4px rgba(0,0,0,0.02);
        }
        .tf-pill--active { background:#1B4332; border-color:#1B4332; color:#fff; }
        .tf-search {
           height:54px; width:340px; border-radius:999px; border:2px solid #e5e7eb; padding:0 1.5rem;
           font-size:1.1rem; font-family:inherit; outline:none; transition:border-color 0.2s;
        }
        .tf-search:focus { border-color:#1B4332; }

        .tf-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); gap:1.5rem; }
        .tf-empty { font-size:1.3rem; color:#6b7280; margin-top:2rem; }

        /* Etapa 2: Botões Gigantes */
        .tf-step2 { display:flex; flex-direction:column; align-items:center; }
        .tf-back-btn { font-size:1.2rem; font-weight:600; color:#4b5563; background:none; border:none; cursor:pointer; align-self:flex-start; margin-bottom:1rem; padding:0.5rem; }
        .tf-back-btn:active { opacity:0.6; }
        .tf-game-cards { display:flex; gap:2rem; justify-content:center; max-width:800px; width:100%; margin-top:1rem; }
        .tf-game-card {
           flex:1; background:#fff; border:3px solid #e5e7eb; border-radius:24px; padding:3rem;
           display:flex; flex-direction:column; align-items:center; gap:1.5rem; cursor:pointer;
           transition:all 0.2s; box-shadow:0 8px 30px rgba(0,0,0,0.06); outline:none;
        }
        .tf-game-card:hover { border-color:#1B4332; transform:translateY(-5px); }
        .tf-game-card:active { transform:scale(0.97); }
        .tf-game-icon { font-size:4.5rem; }
        .tf-game-label { font-family:var(--font-dm-serif,serif); font-size:2.2rem; color:#111827; margin:0; }
        .tf-game-desc { font-size:1.2rem; color:#6b7280; margin:0; font-weight:500; }

        /* Etapa 3: Formulários */
        .tf-split { display:flex; gap:2.5rem; margin-top:2rem; }
        .tf-left { flex:0.4; display:flex; flex-direction:column; gap:1.5rem; }
        .tf-right { flex:0.6; display:flex; flex-direction:column; gap:1rem; height:calc(100vh - 280px); overflow-y:auto; padding-right:1rem; }

        .tf-summary { background:#fff; border:2px solid #e5e7eb; border-radius:20px; padding:2rem; box-shadow:0 4px 12px rgba(0,0,0,0.03); }
        .tf-summary-title { font-family:var(--font-dm-serif,serif); font-size:1.8rem; margin:0 0 1.5rem 0; color:#111827; }
        .tf-summ-item { font-size:1.25rem; display:flex; justify-content:space-between; padding:1rem 0; border-bottom:1px solid #f3f4f6; color:#4b5563; }
        .tf-summ-item:last-child { border-bottom:none; padding-bottom:0; }
        .tf-summ-item strong { color:#111827; }

        .tf-confirm-btn {
           height:80px; background:#1B4332; color:#fff; border-radius:20px; font-size:1.6rem; font-weight:700;
           font-family:inherit; border:none; cursor:pointer; box-shadow:0 12px 24px rgba(27,67,50,0.25);
           transition:all 0.2s; display:flex; align-items:center; justify-content:center;
        }
        .tf-confirm-btn:disabled { background:#9ca3af; box-shadow:none; cursor:not-allowed; }
        .tf-confirm-btn:active:not(:disabled) { transform:scale(0.97); }
        .tf-warn { color:#dc2626; text-align:center; font-weight:600; font-size:1.1rem; margin-top:-1rem; }

        .tf-players-title { font-family:var(--font-dm-sans,sans-serif); font-size:1.8rem; font-weight:700; margin:0 0 0.5rem 0; color:#111827; flex-shrink: 0; }
        .tf-player-card { background:#fff; border:2px solid #e5e7eb; border-radius:16px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.03); flex-shrink: 0; }
        .tf-pc-header { background:#f9fafb; padding:0.75rem 1.25rem; border-bottom:1px solid #e5e7eb; display:flex; justify-content:space-between; align-items:center; }
        .tf-pc-badge { background:#111827; color:#fff; padding:0.3rem 0.8rem; border-radius:999px; font-weight:700; font-size:0.95rem; letter-spacing:0.03em; }
        .tf-pc-del { background:#fee2e2; color:#dc2626; border:none; width:32px; height:32px; border-radius:50%; font-size:1.1rem; cursor:pointer; font-weight:bold; }
        .tf-pc-body { padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }

        .tf-field { display:flex; flex-direction:column; gap:0.4rem; flex:1; }
        .tf-field label { font-weight:600; font-size:0.95rem; color:#374151; }
        .tf-field input { height: 44px; border-radius: 8px; border:2px solid #e5e7eb; padding:0 1rem; font-size:1.05rem; font-family:inherit; outline:none; transition:border 0.2s; background:#f9fafb; }
        .tf-field input:focus { border-color:#1B4332; background:#fff; }
        .tf-field-row { display:flex; gap:1rem; }

        .tf-add-player { border:2px dashed #cbd5e1; border-radius:12px; background:transparent; height: 56px; font-size: 1.1rem; font-weight:700; color:#64748b; font-family:inherit; cursor:pointer; transition:all 0.2s; flex-shrink: 0; }
        .tf-add-player:hover { border-color:#94a3b8; color:#475569; background:#f8fafc; }

        /* Etapa 4: Sucesso */
        .tf-success { display:flex; align-items:center; justify-content:center; height:100%; min-height:600px; }
        .tf-success-box { background:#fff; border-radius:30px; padding:4rem; text-align:center; max-width:800px; width:100%; box-shadow:0 24px 80px rgba(0,0,0,0.1); display:flex; flex-direction:column; align-items:center; }
        .tf-check-anim { width:120px; height:120px; background:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:4rem; font-weight:bold; margin-bottom:2rem; animation:pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes pop { 0% {transform:scale(0)} 100% {transform:scale(1)} }
        .tf-success-desc { font-size:1.4rem; color:#4b5563; line-height:1.5; margin-bottom:3rem; }
        .tf-success-details { background:#f9fafb; border:2px solid #e5e7eb; border-radius:16px; padding:2rem; width:100%; display:flex; flex-direction:column; gap:1rem; margin-bottom:3rem; }
        .tf-sd-item { display:flex; justify-content:space-between; font-size:1.5rem; color:#4b5563; }
        .tf-sd-item strong { color:#111827; }
        .tf-restart-btn { height:80px; width:100%; background:#1B4332; color:#fff; border-radius:20px; font-size:1.6rem; font-weight:700; border:none; cursor:pointer; box-shadow:0 12px 24px rgba(27,67,50,0.2); transition:transform 0.1s; }
        .tf-restart-btn:active { transform:scale(0.97); }

        /* Responsividade */
        @media (max-width: 1024px) {
          .tf-split { flex-direction: column; gap: 2rem; }
          .tf-right { height: auto; overflow: visible; padding-right: 0; }
          .tf-game-cards { flex-direction: column; gap: 1rem; }
          .tf-controls { flex-direction: column; align-items: stretch; }
          .tf-search { width: 100%; max-width: none; }
          .tf-header { padding: 1rem; flex-wrap: wrap; height: auto; justify-content: center; gap: 1rem; }
          .tf-stepper { flex-wrap: wrap; justify-content: center; }
          .tf-main { padding: 1.5rem 1rem; }
          .tf-success-box { padding: 2rem 1.5rem; }
          .tf-field-row { flex-direction: column; gap: 1rem; }
        }
      `}</style>
    </div>
  )
}
