"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"

export default function TvLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Usuário ou senha inválidos.")
      } else {
        router.push("/tv")
        router.refresh()
      }
    })
  }

  return (
    <div className="login-root">
      <div className="login-bg" aria-hidden="true" />

      <main className="login-card">
        <div className="login-header">
          <Link href="/" className="login-back">← Voltar</Link>
          <span className="login-icon">📺</span>
          <h1 className="login-title">JTC TV</h1>
          <p className="login-subtitle">Acesso Restrito ao Painel TV</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="field-group">
            <label htmlFor="login-username" className="field-label">Usuário</label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              autoFocus
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="field-input"
              placeholder="tv"
            />
          </div>

          <div className="field-group">
            <label htmlFor="login-password" className="field-label">Senha</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className="login-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending || !username || !password}
            className="login-btn"
          >
            {isPending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </main>

      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d2318;
          position: relative;
          overflow: hidden;
          font-family: var(--font-dm-sans, sans-serif);
        }
        .login-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(27,67,50,0.5), rgba(13,35,24,0.95));
        }

        .login-card {
          position: relative;
          z-index: 1;
          background: rgba(255,255,255,0.97);
          border-radius: 20px;
          padding: 2.5rem;
          width: 100%;
          max-width: 400px;
          margin: 1rem;
          box-shadow: 0 24px 80px rgba(0,0,0,0.4);
          animation: fadeInUp 0.35s ease forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 2rem;
          position: relative;
        }
        .login-back {
          position: absolute;
          top: 0; left: 0;
          font-size: 0.8rem;
          color: #6b7280;
          text-decoration: none;
          transition: color 0.15s;
        }
        .login-back:hover { color: #1B4332; }

        .login-icon { font-size: 2rem; margin-bottom: 0.25rem; }
        .login-title {
          font-family: var(--font-dm-serif, serif);
          font-size: 1.75rem;
          font-weight: 400;
          color: #1B4332;
          margin: 0;
        }
        .login-subtitle {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
          letter-spacing: 0.02em;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .field-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.02em;
        }
        .field-input {
          height: 44px;
          padding: 0 0.875rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9375rem;
          font-family: inherit;
          color: #111827;
          background: #f9fafb;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .field-input:focus {
          border-color: #1B4332;
          box-shadow: 0 0 0 3px rgba(27,67,50,0.12);
          background: #fff;
        }
        .field-input::placeholder { color: #9ca3af; }

        .login-error {
          font-size: 0.85rem;
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 0.6rem 0.875rem;
          margin: 0;
        }

        .login-btn {
          height: 46px;
          border-radius: 12px;
          background: #1B4332;
          color: #fff;
          font-size: 0.9375rem;
          font-weight: 600;
          font-family: inherit;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, opacity 0.2s;
          margin-top: 0.5rem;
        }
        .login-btn:hover:not(:disabled) { background: #2D6A4F; }
        .login-btn:active:not(:disabled) { transform: scale(0.98); }
        .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>
    </div>
  )
}
