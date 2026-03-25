import NextAuth, { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

/**
 * Factory para criar configurações independentes de Auth para cada área.
 * Isso permite ter cookies de sessão diferentes para Admin, Totem e TV.
 */
function createAuthOptions(area: "admin" | "totem" | "tv"): NextAuthConfig {
  return {
    basePath: `/api/auth/${area}`,
    cookies: {
      sessionToken: {
        name: `jtc-session-${area}`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
    providers: [
      Credentials({
        credentials: {
          username: { label: "Usuário", type: "text" },
          password: { label: "Senha",   type: "password" },
        },
        async authorize(credentials) {
          const { username, password } = credentials as { username: string; password: string }
          if (!username || !password) return null

          const { db } = await import("./db")
          const { users } = await import("./db/schema")
          const { eq } = await import("drizzle-orm")

          const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)
          if (!user) return null

          // RN: Verificar se o usuário tem o papel correto para a área (ou é admin)
          if (user.role !== area && user.role !== "admin") return null

          const valid = await compare(password, user.passwordHash)
          if (!valid) return null

          return { id: String(user.id), name: user.username, role: user.role }
        },
      }),
    ],
    pages: { signIn: `/${area}/login` },
    session: { strategy: "jwt" },
    callbacks: {
      jwt({ token, user }) {
        if (user) {
          token.id = user.id
          token.role = (user as any).role
        }
        return token
      },
      session({ session, token }) {
        if (token.id && session.user) {
          session.user.id = token.id as string
          (session.user as any).role = token.role
        }
        return session
      },
    },
  }
}

// Exportações independentes para cada área
export const adminAuth  = NextAuth(createAuthOptions("admin"))
export const totemAuth  = NextAuth(createAuthOptions("totem"))
export const tvAuth     = NextAuth(createAuthOptions("tv"))

// Fallback para quem importa o antigo "auth" (usando adminAuth por padrão)
export const auth     = adminAuth.auth
export const handlers = adminAuth.handlers
export const signIn   = adminAuth.signIn
export const signOut  = adminAuth.signOut
