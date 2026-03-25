"use client"

import { useEffect, useState } from "react"

interface WeatherEffectProps {
  rainMode: boolean
}

export default function WeatherEffect({ rainMode }: WeatherEffectProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  // F4-03a: 60 gotas
  const drops = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${0.6 + Math.random() * 0.5}s`,
    animationDelay: `${Math.random() * 2}s`,
    opacity: 0.3 + Math.random() * 0.4
  }))

  // F4-03b: 6 raios, 18 partículas
  const rays = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    transform: `rotate(${i * 60}deg)`,
    animationDelay: `${i * 0.5}s`
  }))
  const particles = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDuration: `${10 + Math.random() * 10}s`,
    animationDelay: `${Math.random() * 5}s`
  }))

  return (
    <div className={`weather-overlay ${rainMode ? "wo-rain" : "wo-sun"}`} aria-hidden="true">
      {rainMode ? (
        <>
          {/* Tinta azulada */}
          <div className="wo-tint wo-tint--blue" />
          {/* Gotas */}
          {drops.map(d => (
            <div
              key={d.id}
              className="wo-drop"
              style={{
                left: d.left,
                animationDuration: d.animationDuration,
                animationDelay: d.animationDelay,
                opacity: d.opacity
              }}
            />
          ))}
          {/* Névoa na base */}
          <div className="wo-fog" />
        </>
      ) : (
        <>
          {/* Tinta amarelada */}
          <div className="wo-tint wo-tint--yellow" />
          {/* Partículas */}
          {particles.map(p => (
            <div
              key={p.id}
              className="wo-particle"
              style={{
                left: p.left,
                top: p.top,
                animationDuration: p.animationDuration,
                animationDelay: p.animationDelay
              }}
            />
          ))}
          {/* Sol: Orbe + raios */}
          <div className="wo-sun-container">
            <div className="wo-flare" />
            <div className="wo-orb" />
            {rays.map(r => (
              <div
                key={r.id}
                className="wo-ray"
                style={{
                  transform: r.transform,
                  animationDelay: r.animationDelay
                }}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        .weather-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0; /* Behind content */
          overflow: hidden;
        }

        /* Tints */
        .wo-tint {
          position: absolute; inset: 0;
          transition: background 1s ease;
        }
        .wo-tint--blue { background: rgba(14, 165, 233, 0.05); }
        .wo-tint--yellow { background: rgba(250, 204, 21, 0.03); }

        /* Rain */
        .wo-drop {
          position: absolute;
          top: -20px;
          width: 2px;
          height: 35px;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(186,230,253,0.8));
          border-radius: 999px;
          animation: rainFall linear infinite;
        }
        @keyframes rainFall {
          0%   { transform: translateY(-20px) scaleY(1); }
          100% { transform: translateY(110vh) scaleY(1.2); }
        }
        .wo-fog {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 120px;
          background: linear-gradient(to top, rgba(255,255,255,0.7), transparent);
        }

        /* Sun */
        .wo-particle {
          position: absolute;
          width: 4px; height: 4px;
          background: #fef08a;
          border-radius: 50%;
          opacity: 0.4;
          animation: floatParticle ease-in-out infinite alternate;
        }
        @keyframes floatParticle {
          0%   { transform: translateY(0) scale(0.8); opacity: 0.2; }
          100% { transform: translateY(-40px) scale(1.2); opacity: 0.6; }
        }

        .wo-sun-container {
          position: absolute;
          top: -30px;
          right: -30px;
          width: 300px;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wo-orb {
          position: absolute;
          width: 140px; height: 140px;
          background: radial-gradient(circle, rgba(253,224,71,0.9) 0%, rgba(253,224,71,0) 70%);
          border-radius: 50%;
          animation: pulseOrb 4s ease-in-out infinite alternate;
        }
        @keyframes pulseOrb {
          from { transform: scale(1); opacity: 0.8; }
          to   { transform: scale(1.15); opacity: 1; }
        }
        .wo-ray {
          position: absolute;
          width: 200px; height: 20px;
          background: radial-gradient(circle, rgba(253,224,71,0.4) 0%, transparent 60%);
          animation: pulseRay 3s ease-in-out infinite alternate;
          transform-origin: center;
        }
        @keyframes pulseRay {
          from { opacity: 0.3; width: 180px; }
          to   { opacity: 0.7; width: 240px; }
        }
        .wo-flare {
          position: absolute;
          width: 400px; height: 400px;
          background: conic-gradient(from 0deg at 50% 50%, rgba(253,224,71,0.1), transparent 60deg, transparent 300deg, rgba(253,224,71,0.1));
          border-radius: 50%;
          animation: spinFlare 60s linear infinite;
        }
        @keyframes spinFlare {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
