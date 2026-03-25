"use client";

import { useEffect, useState } from "react";
import { CloudRain, Clock, User, CheckCircle2, AlertTriangle, Wrench } from "lucide-react";

// Native JS date formatting since date-fns might not be installed, wait we can use native JS
// Actually I will just use native Intl.DateTimeFormat instead of date-fns to be safe.

export default function TVDashboard() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rainMode, setRainMode] = useState(false);

  useEffect(() => {
    // Clock tick every second
    setCurrentTime(new Date());
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(clockInterval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/courts/status");
      const json = await res.json();
      setData(json);
      if (json.length > 0) {
        setRainMode(json[0].rainMode);
      }
    } catch (error) {
      console.error("Failed to fetch courts status:", error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Auto-refresh every 30 seconds (RF-35)
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Hydration fix for clock
  if (!currentTime) return <div className="min-h-screen bg-slate-950" />;

  const timeString = currentTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dateString = currentTime.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getSurfaceColor = (surface: string) => {
    switch (surface) {
      case "saibro": return "bg-[#c4753b]";
      case "hard": return "bg-[#3b82c4]";
      case "grama": return "bg-[#4ade80]";
      default: return "bg-gray-400";
    }
  };

  const getStatusBadge = (status: string, remainingMinutes: number | null) => {
    switch (status) {
      case "em-uso":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="font-bold tracking-wide uppercase text-sm">Em Uso {remainingMinutes !== null && `(${remainingMinutes}m)`}</span>
          </div>
        );
      case "disponivel":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" style={{ animationDuration: '3s' }}></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="font-bold tracking-wide uppercase text-sm">Livre</span>
          </div>
        );
      case "bloqueada-chuva":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <CloudRain className="w-4 h-4" />
            <span className="font-bold tracking-wide uppercase text-sm">Chuva</span>
          </div>
        );
      case "inativa":
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20">
            <Wrench className="w-4 h-4" />
            <span className="font-bold tracking-wide uppercase text-sm">Manutenção</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F16] text-slate-200 overflow-hidden font-sans selection:bg-[#1B4332] selection:text-white flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#1B4332]/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] rounded-full bg-[#2D6A4F]/10 blur-[100px]" />
      </div>

      {/* Banner de Chuva */}
      {rainMode && (
        <div className="relative z-20 w-full bg-orange-500 text-white py-3 px-6 flex items-center justify-center gap-3 font-medium shadow-lg shadow-orange-500/20 animate-in slide-in-from-top-full duration-500">
          <CloudRain className="w-5 h-5 animate-bounce" />
          <span className="text-lg tracking-wide uppercase">Modo Chuva Ativo – Quadras descobertas bloqueadas automaticamente</span>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 w-full p-8 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] shadow-lg shadow-[#1B4332]/30 flex items-center justify-center border border-white/10">
            <span className="text-white text-2xl font-serif">J</span>
          </div>
          <div>
            <h1 className="text-3xl font-serif text-white tracking-tight">JTC <span className="text-[#4ade80] font-sans font-light opacity-80">|</span> <span className="opacity-90">Painel de Quadras</span></h1>
            <p className="text-slate-400 text-sm capitalize">{dateString}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
          <Clock className="w-6 h-6 text-[#4ade80]" />
          <span className="text-4xl font-mono tracking-tighter text-white font-light tabular-nums">
            {timeString}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-8">
        <div className="bg-black/20 rounded-3xl border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 p-6 bg-white/5 border-b border-white/5 text-xs font-bold tracking-widest text-slate-400 uppercase">
            <div className="pl-4">Início</div>
            <div className="col-span-2">Jogador</div>
            <div>Quadra</div>
            <div>Término / Tipo</div>
            <div className="text-right pr-4">Status</div>
          </div>

          {/* Table Body */}
          <div className="p-4 flex flex-col gap-2">
            {loading ? (
              <div className="flex flex-col gap-2 animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-white/5 rounded-2xl border border-white/5" />
                ))}
              </div>
            ) : (
              data.map((row, index) => {
                const isEmUso = row.status === "em-uso";
                const isDisponivel = row.status === "disponivel";
                const res = row.activeReservation;

                let startTime = "--:--";
                let endTime = "--:--";
                let playerName = "--";
                let gameType = "--";

                if (res) {
                  startTime = new Date(res.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                  endTime = new Date(res.endTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                  playerName = res.playerName;
                  gameType = res.gameType === "simples" ? "Simples" : "Duplas";
                }

                // Animation delay for stagger effect (RF-37)
                const animDelay = `${index * 150}ms`;

                return (
                  <div 
                    key={row.court.id} 
                    className="group grid grid-cols-6 gap-4 items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                    style={{ animationDelay: animDelay }}
                  >
                    {/* Início */}
                    <div className="pl-4 text-2xl font-light tabular-nums text-white">
                      {isEmUso ? startTime : <span className="text-slate-600">--:--</span>}
                    </div>

                    {/* Jogador */}
                    <div className="col-span-2 flex items-center gap-4">
                      {isEmUso ? (
                        <>
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                          <span className="text-xl font-medium text-white truncate pr-4">{playerName}</span>
                        </>
                      ) : (
                        <div className="flex items-center gap-3 opacity-40">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-slate-600" />
                          </div>
                          <span className="text-lg text-slate-500 italic">Aguardando check-in...</span>
                        </div>
                      )}
                    </div>

                    {/* Quadra */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-white">{row.court.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-2 h-2 rounded-full shadow-sm ${getSurfaceColor(row.court.surface)}`} />
                          <span className="text-xs text-slate-400 capitalize">{row.court.surface}</span>
                        </div>
                      </div>
                    </div>

                    {/* Término / Tipo */}
                    <div className="flex flex-col gap-1">
                      {isEmUso ? (
                        <>
                          <span className="text-xl font-light text-slate-300">{endTime}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-slate-300 w-fit">
                            {gameType}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-600 text-lg">--</span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex justify-end pr-4">
                      {getStatusBadge(row.status, row.remainingMinutes)}
                    </div>
                  </div>
                );
              })
            )}
            
            {!loading && data.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <AlertTriangle className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-xl">Nenhuma quadra encontrada no sistema.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
