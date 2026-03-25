"use client"

import { signOut, SessionProvider } from "next-auth/react"
import Link from "next/link"
import type { Session } from "next-auth"

interface AdminShellProps {
  session: Session
  children: React.ReactNode
}

export default function AdminShell({ session, children }: AdminShellProps) {
  return (
    <SessionProvider session={session} basePath="/api/auth/admin">
      <div className="admin-shell">
        {/* ── Header ── */}
        <header className="admin-header no-print">
          <div className="admin-header-left">
            <Link href="/" className="admin-brand">
              <span>🎾</span>
              <span className="admin-brand-name">JTC</span>
            </Link>
            <span className="admin-header-sep" />
            <span className="admin-header-title">Painel Admin</span>
          </div>

          <div className="admin-header-right">
            <span className="admin-user">
              👤 {session.user?.name ?? "Admin"}
            </span>
            {/* RF-04: botão Sair */}
            <button
              id="btn-logout"
              className="admin-logout-btn"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
            >
              Sair
            </button>
          </div>
        </header>

        {/* ── Conteúdo ── */}
        <main className="admin-main">{children}</main>

        <style>{`
          .admin-shell {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background: #f8fafc;
            font-family: var(--font-dm-sans, sans-serif);
          }

          /* ── Header ── */
          .admin-header {
            height: 60px;
            background: #1B4332;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.5rem;
            position: sticky;
            top: 0;
            z-index: 40;
            box-shadow: 0 1px 0 rgba(255,255,255,0.07);
          }
          .admin-header-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          .admin-brand {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            text-decoration: none;
            color: #fff;
            font-size: 0.9rem;
            opacity: 0.9;
            transition: opacity 0.15s;
          }
          .admin-brand:hover { opacity: 1; }
          .admin-brand-name {
            font-family: var(--font-dm-serif, serif);
            font-size: 1.1rem;
          }
          .admin-header-sep {
            width: 1px;
            height: 18px;
            background: rgba(255,255,255,0.2);
          }
          .admin-header-title {
            font-size: 0.85rem;
            font-weight: 600;
            color: rgba(255,255,255,0.7);
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }
          .admin-header-right {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          .admin-user {
            font-size: 0.85rem;
            color: rgba(255,255,255,0.8);
          }
          .admin-logout-btn {
            font-size: 0.8rem;
            font-weight: 600;
            font-family: inherit;
            color: rgba(255,255,255,0.85);
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 8px;
            padding: 0.35rem 0.875rem;
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
          }
          .admin-logout-btn:hover {
            background: rgba(255,255,255,0.18);
            color: #fff;
          }

          /* ── Main ── */
          .admin-main {
            flex: 1;
            max-width: 1280px;
            width: 100%;
            margin: 0 auto;
            padding: 1.5rem;
          }
        `}</style>
      </div>
    </SessionProvider>
  )
}
