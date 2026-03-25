import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="landing-root">
      {/* ── Fundo com textura de quadra ── */}
      <div className="landing-bg" aria-hidden="true">
        <div className="court-lines" />
        <div className="court-overlay" />
      </div>

      {/* ── Conteúdo ── */}
      <main className="landing-content">
        {/* Logotipo / Branding */}
        <header className="landing-header">
          <div className="brand-badge">
            <span className="brand-icon">🎾</span>
          </div>
          <h1 className="brand-title">JTC</h1>
          <p className="brand-subtitle">Sistema de Gestão de Quadras de Tênis</p>
          <div className="brand-divider" />
          <p className="brand-tagline">Selecione seu acesso</p>
        </header>

        {/* Cards de navegação */}
        <nav className="cards-grid" aria-label="Modos de acesso">

          {/* Admin */}
          <Link href="/admin/login" id="card-admin" className="access-card card-admin">
            <div className="card-icon-wrap">
              <span className="card-icon">⚙️</span>
            </div>
            <div className="card-body">
              <h2 className="card-title">Gestor</h2>
              <p className="card-desc">Painel administrativo de quadras e agenda do clube</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>

          {/* Totem */}
          <Link href="/totem" id="card-totem" className="access-card card-totem">
            <div className="card-icon-wrap">
              <span className="card-icon">🎾</span>
            </div>
            <div className="card-body">
              <h2 className="card-title">Check-in de Quadra</h2>
              <p className="card-desc">Reserve sua quadra e registre os jogadores</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>

          {/* TV */}
          <Link href="/tv" id="card-tv" className="access-card card-tv">
            <div className="card-icon-wrap">
              <span className="card-icon">📺</span>
            </div>
            <div className="card-body">
              <h2 className="card-title">Painel TV</h2>
              <p className="card-desc">Disponibilidade em tempo real de todas as quadras</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        </nav>

        <footer className="landing-footer">
          <p>JTC CourtSync &copy; {new Date().getFullYear()}</p>
        </footer>
      </main>

      <style>{`
        /* ── Reset ── */
        .landing-root {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #0d2318;
        }

        /* ── Fundo ── */
        .landing-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        /* Linhas de quadra de tênis */
        .court-lines {
          position: absolute;
          inset: 0;
          background-image:
            /* Linha central horizontal */
            linear-gradient(to right, transparent 49.9%, rgba(255,255,255,0.06) 49.9%, rgba(255,255,255,0.06) 50.1%, transparent 50.1%),
            /* Linhas verticais de serviço */
            linear-gradient(to right, transparent 24.9%, rgba(255,255,255,0.04) 24.9%, rgba(255,255,255,0.04) 25.1%, transparent 25.1%),
            linear-gradient(to right, transparent 74.9%, rgba(255,255,255,0.04) 74.9%, rgba(255,255,255,0.04) 75.1%, transparent 75.1%),
            /* Linha de base */
            linear-gradient(to bottom, transparent 5%, rgba(255,255,255,0.05) 5%, rgba(255,255,255,0.05) 5.3%, transparent 5.3%),
            linear-gradient(to bottom, transparent 94.7%, rgba(255,255,255,0.05) 94.7%, rgba(255,255,255,0.05) 95%, transparent 95%);
        }

        .court-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 80% 60% at 50% 50%,
            rgba(27, 67, 50, 0.4) 0%,
            rgba(13, 35, 24, 0.9) 100%
          );
        }

        /* ── Conteúdo ── */
        .landing-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3rem;
          padding: 2rem 1.5rem;
          width: 100%;
          max-width: 860px;
        }

        /* ── Header / Branding ── */
        .landing-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
        }

        .brand-badge {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(64, 145, 108, 0.2);
          border: 1px solid rgba(64, 145, 108, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
          box-shadow: 0 0 32px rgba(64, 145, 108, 0.2);
        }

        .brand-title {
          font-family: var(--font-heading), serif;
          font-size: clamp(3rem, 8vw, 5.5rem);
          font-weight: 400;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
        }

        .brand-subtitle {
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin: 0;
        }

        .brand-divider {
          width: 40px;
          height: 1px;
          background: rgba(64, 145, 108, 0.5);
          margin: 0.75rem 0;
        }

        .brand-tagline {
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin: 0;
        }

        /* ── Cards ── */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          width: 100%;
        }

        @media (max-width: 640px) {
          .cards-grid { grid-template-columns: 1fr; }
        }

        .access-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.75rem 1.5rem;
          border-radius: 16px;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(12px);
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          animation: fadeInUp 0.4s ease forwards;
          opacity: 0;
        }

        .access-card:nth-child(1) { animation-delay: 0.05s; }
        .access-card:nth-child(2) { animation-delay: 0.15s; }
        .access-card:nth-child(3) { animation-delay: 0.25s; }

        .access-card:hover {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.08);
          border-color: rgba(64, 145, 108, 0.5);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(64,145,108,0.2);
        }

        /* Cor de destaque por card */
        .card-admin:hover  { border-color: rgba(59, 130, 246, 0.6); box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.2); }
        .card-totem:hover  { border-color: rgba(64, 145, 108, 0.7); box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(64,145,108,0.3); }
        .card-tv:hover     { border-color: rgba(245, 158, 11, 0.6); box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.2); }

        .card-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .card-body {
          flex: 1;
        }

        .card-title {
          font-family: var(--font-heading), serif;
          font-size: 1.2rem;
          font-weight: 400;
          color: #fff;
          margin: 0 0 0.35rem;
        }

        .card-desc {
          font-size: 0.8rem;
          line-height: 1.5;
          color: rgba(255,255,255,0.45);
          margin: 0;
        }

        .card-arrow {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.2);
          transition: color 0.2s ease, transform 0.2s ease;
          align-self: flex-end;
        }

        .access-card:hover .card-arrow {
          color: rgba(255,255,255,0.7);
          transform: translateX(4px);
        }

        /* ── Footer ── */
        .landing-footer {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.05em;
        }

        /* ── Animação de entrada ── */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
