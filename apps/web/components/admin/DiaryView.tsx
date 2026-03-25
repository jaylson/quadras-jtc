"use client"

import { useState, useEffect, useCallback } from "react"
import type { Court, AdminBlock, Reservation } from "@/lib/db/schema"
import { getCategoryConfig } from "@/lib/utils/blocks"

interface DiaryViewProps {
  courts: Court[]
}

export default function DiaryView({ courts }: DiaryViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [selectedCourtId, setSelectedCourtId] = useState<number | "all">("all")
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDiary = useCallback(async () => {
    setLoading(true)
    try {
      const courtParam = selectedCourtId === "all" ? "" : `&courtId=${selectedCourtId}`
      
      const [blocksRes, reservationsRes] = await Promise.all([
        fetch(`/api/blocks?from=${selectedDate}&to=${selectedDate}`),
        fetch(`/api/reservations?from=${selectedDate}&to=${selectedDate}${courtParam}`)
      ])

      const blocks: AdminBlock[] = await blocksRes.json()
      const reservations: Reservation[] = await reservationsRes.json()

      // Combinar e formatar eventos
      const combined: any[] = []

      // Adicionar Travas/Bloqueios
      blocks.forEach(b => {
        // Se filtramos por quadra, verificar se a trava inclui essa quadra
        if (selectedCourtId !== "all" && !b.courtIds.includes(selectedCourtId)) return

        combined.push({
          id: `block-${b.id}`,
          type: "block",
          title: b.title,
          category: b.category,
          startTimeStr: b.startTime,
          endTimeStr: b.endTime,
          courtNames: b.courtIds.map(id => courts.find(c => c.id === id)?.name).filter(Boolean).join(", "),
          notes: b.notes,
          original: b
        })
      })

      // Adicionar Reservas
      reservations.forEach(r => {
        const start = new Date(r.startTime)
        const end = new Date(r.endTime)
        
        // Filtro refinado para garantir que a reserva pertence ao dia selecionado no fuso local
        const localDateStr = start.toLocaleDateString("en-CA") // YYYY-MM-DD
        if (localDateStr !== selectedDate) return

        combined.push({
          id: `res-${r.id}`,
          type: "reservation",
          title: r.playerName,
          category: r.gameType,
          startTimeStr: start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          endTimeStr: end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          courtNames: r.courtName,
          playerPhone: r.playerPhone,
          status: r.status,
          original: r
        })
      })

      // Ordenar por hora de início
      combined.sort((a, b) => a.startTimeStr.localeCompare(b.startTimeStr))
      setEvents(combined)
    } catch (error) {
      console.error("Erro ao carregar diário:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedCourtId, courts])

  useEffect(() => {
    fetchDiary()
  }, [fetchDiary])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="dv-container">
      {/* ── Cabeçalho de Impressão (visível apenas ao imprimir) ── */}
      <div className="dv-print-header">
        <h1>Diário de Quadra</h1>
        <div className="dv-print-meta">
          <span><strong>Data:</strong> {selectedDate.split("-").reverse().join("/")}</span>
          <span><strong>Quadra:</strong> {selectedCourtId === "all" ? "Todas as Quadras" : courts.find(c => c.id === selectedCourtId)?.name}</span>
        </div>
      </div>

      <div className="dv-filters no-print">
        <div className="dv-field">
          <label>Data</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="dv-input"
          />
        </div>
        <div className="dv-field">
          <label>Quadra</label>
          <select 
            value={selectedCourtId} 
            onChange={(e) => setSelectedCourtId(e.target.value === "all" ? "all" : parseInt(e.target.value))}
            className="dv-select"
          >
            <option value="all">Todas as Quadras</option>
            {courts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button onClick={fetchDiary} className="dv-refresh-btn" title="Atualizar">
          🔄
        </button>

        <button onClick={handlePrint} className="dv-print-btn">
          🖨️ Exportar PDF
        </button>
      </div>

      {loading ? (
        <div className="dv-loading">Carregando diário...</div>
      ) : events.length === 0 ? (
        <div className="dv-empty">Nenhuma atividade para este dia/quadra.</div>
      ) : (
        <div className="dv-table-container">
          <table className="dv-table">
            <thead>
              <tr>
                <th>Horário</th>
                <th>Atividade</th>
                <th>Quadra</th>
                <th className="no-print-col">Detalhes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => {
                const isBlock = ev.type === "block"
                const config = isBlock ? getCategoryConfig(ev.category) : null

                return (
                  <tr key={ev.id} className={isBlock ? "tr-block" : "tr-res"}>
                    <td className="td-time">
                      <strong>{ev.startTimeStr}</strong>
                      <span className="td-time-end">{ev.endTimeStr}</span>
                    </td>
                    <td>
                      <div className="td-activity">
                        <span className="dv-card-badge" style={isBlock ? { backgroundColor: config?.bgColor, color: config?.color } : undefined}>
                          {isBlock ? ev.category.toUpperCase() : ev.category.toUpperCase()}
                        </span>
                        <span className="td-title">{ev.title}</span>
                      </div>
                    </td>
                    <td>{ev.courtNames}</td>
                    <td className="no-print-col">
                      {!isBlock && <span className="td-phone">{ev.playerPhone}</span>}
                      {isBlock && ev.notes && <span className="td-notes">{ev.notes}</span>}
                    </td>
                    <td>
                      {!isBlock && (
                        <span className={`td-status status--${ev.status.replace(" ", "-")}`}>
                          {ev.status}
                        </span>
                      )}
                      {isBlock && <span className="td-status-block">Bloqueada</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .dv-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dv-print-header {
          display: none;
        }

        .dv-filters {
          display: flex;
          gap: 1rem;
          background: #fff;
          padding: 1.25rem;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .dv-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .dv-field label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }

        .dv-input, .dv-select {
          height: 38px;
          padding: 0 0.75rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9rem;
          font-family: inherit;
          background: #f9fafb;
          outline: none;
          transition: all 0.2s;
        }

        .dv-input:focus, .dv-select:focus {
          border-color: #1B4332;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.1);
        }

        .dv-refresh-btn {
          height: 38px;
          width: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .dv-print-btn {
          height: 38px;
          padding: 0 1.25rem;
          background: #1B4332;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          margin-left: auto;
          transition: background 0.15s;
        }
        .dv-print-btn:hover { background: #2D6A4F; }

        .dv-loading, .dv-empty {
          text-align: center;
          padding: 3rem;
          background: #fff;
          border-radius: 14px;
          border: 1px dashed #d1d5db;
          color: #6b7280;
        }

        /* ── Tabela Estilo PDF ── */
        .dv-table-container {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .dv-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }
        .dv-table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #475569;
          border-bottom: 2px solid #e2e8f0;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        .dv-table td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        .tr-block { background: #fdfdfd; }
        
        .td-time { display: flex; flex-direction: column; width: 80px; }
        .td-time strong { color: #1B4332; font-size: 1rem; }
        .td-time-end { font-size: 0.75rem; color: #94a3b8; }

        .td-activity { display: flex; align-items: center; gap: 0.75rem; }
        .dv-card-badge {
          font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.45rem;
          border-radius: 4px; white-space: nowrap; background: #eef2ff; color: #4338ca;
        }
        .td-title { font-weight: 600; color: #111827; }
        .td-phone { font-size: 0.8rem; color: #6b7280; }
        .td-notes { font-size: 0.8rem; color: #64748b; font-style: italic; }

        .td-status {
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          padding: 0.25rem 0.5rem; border-radius: 6px;
        }
        .status--em-uso { background: #dcfce7; color: #15803d; }
        .status--agendada { background: #eff6ff; color: #1d4ed8; }
        .status--concluída { background: #f3f4f6; color: #9ca3af; }
        .td-status-block { font-size: 0.75rem; color: #ef4444; font-weight: 600; }

        @media print {
          .no-print { display: none !important; }
          .no-print-col { display: none !important; }
          .dv-container { background: #fff !important; padding: 0 !important; gap: 0 !important; }
          .dv-table-container { border: none !important; box-shadow: none !important; }
          .dv-table th { background: #eee !important; color: #000 !important; border-bottom: 2px solid #000 !important; }
          .dv-table td { border-bottom: 1px solid #ddd !important; }
          .dv-print-header {
            display: block !important;
            margin-bottom: 2rem;
            border-bottom: 2px solid #1B4332;
            padding-bottom: 1rem;
          }
          .dv-print-header h1 { margin: 0; font-size: 1.5rem; color: #1B4332; }
          .dv-print-meta { display: flex; gap: 2rem; margin-top: 0.5rem; font-size: 1rem; }
          
          body { font-family: serif; }
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  )
}
