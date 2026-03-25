"use client"

import type { AdminBlock, Court } from "@/lib/db/schema"
import { getCategoryConfig } from "@/lib/utils/blocks"

const HOUR_START = 6
const HOUR_END   = 22
const TOTAL_HOURS = HOUR_END - HOUR_START
const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

interface WeeklyCalendarProps {
  courts:        Court[]
  blocks:        AdminBlock[]
  weekOffset:    number
  onWeekChange:  (offset: number) => void
  onBlockClick:  (block: AdminBlock) => void
}

function getWeekStart(offset: number): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function toDateStr(d: Date) { return d.toISOString().slice(0, 10) }
function timeToMinutes(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m }

export default function WeeklyCalendar({ courts, blocks, weekOffset, onWeekChange, onBlockClick }: WeeklyCalendarProps) {
  const weekStart = getWeekStart(weekOffset)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })
  const todayStr = toDateStr(new Date())
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => HOUR_START + i)

  function getBlocksForDay(dateStr: string) {
    return blocks.filter((b) => {
      if (b.recurring === "semanal") {
        const orig = new Date(b.date + "T00:00:00")
        const target = new Date(dateStr + "T00:00:00")
        return orig.getDay() === target.getDay() && orig <= target
      }
      return b.date === dateStr
    })
  }

  return (
    <div className="wc-root">
      <div className="wc-nav">
        <button id="btn-week-prev" className="wc-nav-btn" onClick={() => onWeekChange(weekOffset - 1)}>‹ Anterior</button>
        <button id="btn-week-today" className="wc-nav-btn wc-nav-btn--today" onClick={() => onWeekChange(0)}>Hoje</button>
        <button id="btn-week-next" className="wc-nav-btn" onClick={() => onWeekChange(weekOffset + 1)}>Próxima ›</button>
        <span className="wc-range">
          {days[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} –{" "}
          {days[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>

      <div className="wc-grid-wrap">
        <div className="wc-grid">
          <div className="wc-hours-col">
            <div className="wc-col-header" />
            {hours.slice(0, -1).map((h) => (
              <div key={h} className="wc-hour-label">{String(h).padStart(2, "0")}h</div>
            ))}
          </div>

          {days.map((day, di) => {
            const dateStr = toDateStr(day)
            const isToday = dateStr === todayStr
            const dayBlocks = getBlocksForDay(dateStr)
            return (
              <div key={di} className={`wc-day-col ${isToday ? "wc-day-col--today" : ""}`}>
                <div className={`wc-col-header ${isToday ? "wc-col-header--today" : ""}`}>
                  <span className="wc-day-name">{DAY_LABELS[di]}</span>
                  <span className={`wc-day-num ${isToday ? "wc-day-num--today" : ""}`}>{day.getDate()}</span>
                </div>
                <div className="wc-cells-area">
                  {hours.slice(0, -1).map((h) => <div key={h} className="wc-cell" />)}
                  {dayBlocks.map((block) => {
                    const startMin = timeToMinutes(block.startTime)
                    const endMin   = timeToMinutes(block.endTime)
                    const off      = startMin - HOUR_START * 60
                    const dur      = endMin - startMin
                    const total    = TOTAL_HOURS * 60
                    const top      = (off / total) * 100
                    const height   = Math.max((dur / total) * 100, 2)
                    const cat      = getCategoryConfig(block.category)
                    return (
                      <button key={`${block.id}-${dateStr}`} className="wc-block"
                        style={{ top: `${top}%`, height: `${height}%`, borderLeftColor: cat.color, background: cat.bgColor, color: cat.color }}
                        onClick={() => onBlockClick(block)}
                        title={`${block.title} — ${block.startTime}–${block.endTime}`}>
                        <span className="wc-block-title">{cat.emoji} {block.title}</span>
                        <span className="wc-block-time">{block.startTime}–{block.endTime}</span>
                        <span className="wc-block-courts">
                          {block.courtIds.map((id) => courts.find((c) => c.id === id)?.name).filter(Boolean).join(", ")}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        .wc-root { display:flex; flex-direction:column; gap:1rem; }
        .wc-nav { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; }
        .wc-nav-btn { padding:0.35rem 0.875rem; border-radius:8px; font-size:0.8rem; font-weight:600; font-family:inherit; background:#fff; border:1.5px solid #e5e7eb; color:#374151; cursor:pointer; transition:all 0.15s; }
        .wc-nav-btn:hover { background:#f0fdf4; border-color:#86efac; color:#15803d; }
        .wc-nav-btn--today { background:#1B4332; color:#fff; border-color:#1B4332; }
        .wc-range { font-size:0.85rem; color:#6b7280; margin-left:auto; }
        .wc-grid-wrap { background:#fff; border:1px solid #e5e7eb; border-radius:16px; overflow:hidden; overflow-x:auto; }
        .wc-grid { display:grid; grid-template-columns:44px repeat(7,minmax(100px,1fr)); min-width:780px; }
        .wc-hours-col { display:flex; flex-direction:column; border-right:1px solid #f3f4f6; }
        .wc-col-header { height:52px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1px; border-bottom:1px solid #f3f4f6; flex-shrink:0; }
        .wc-col-header--today { background:#f0fdf4; }
        .wc-day-name { font-size:0.72rem; font-weight:600; color:#9ca3af; text-transform:uppercase; }
        .wc-day-num { font-size:1.1rem; font-weight:700; color:#374151; }
        .wc-day-num--today { background:#1B4332; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.85rem; }
        .wc-hour-label { min-height:48px; font-size:0.65rem; color:#9ca3af; font-weight:600; display:flex; align-items:flex-start; justify-content:center; padding-top:4px; border-bottom:1px solid #f9fafb; }
        .wc-day-col { display:flex; flex-direction:column; border-right:1px solid #f3f4f6; position:relative; }
        .wc-day-col:last-child { border-right:none; }
        .wc-day-col--today { background:#fafff8; }
        .wc-cells-area { flex:1; position:relative; display:grid; grid-template-rows:repeat(16,minmax(48px,1fr)); }
        .wc-cell { border-bottom:1px solid #f3f4f6; }
        .wc-block { position:absolute; left:3px; right:3px; border-radius:6px; border:none; border-left:3px solid; padding:3px 5px; display:flex; flex-direction:column; cursor:pointer; text-align:left; font-family:inherit; transition:filter 0.15s,transform 0.1s; overflow:hidden; min-height:20px; z-index:2; }
        .wc-block:hover { filter:brightness(0.95); transform:scaleX(0.98); }
        .wc-block-title { font-size:0.7rem; font-weight:700; line-height:1.2; }
        .wc-block-time  { font-size:0.62rem; opacity:0.8; }
        .wc-block-courts { font-size:0.6rem; opacity:0.7; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      `}</style>
    </div>
  )
}
