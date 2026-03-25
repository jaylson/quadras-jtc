import { Metadata } from "next"

export const metadata: Metadata = {
  title: "JTC – Autoatendimento",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0", // Impede zoom no touch
}

export default function TotemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="totem-root">
      {children}
      <style>{`
        .totem-root {
          min-height: 100vh;
          background: #f8fafc;
          font-family: var(--font-dm-sans, sans-serif);
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        /* Esconde scrollbars no totem */
        .totem-root *::-webkit-scrollbar { display: none; }
        .totem-root * { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
