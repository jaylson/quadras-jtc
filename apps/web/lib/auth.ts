import NextAuth, { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { hasDatabaseUrl } from "@/lib/env"

type AuthArea = "admin" | "totem" | "tv"

type DevUser = {
  id: string
  username: string
  role: AuthArea
  passwords: string[]
}

const devUsers: DevUser[] = [
  {
    id: "dev-admin",
    username: "admin",
    role: "admin",
    passwords: ["admin123@"],
  },
  {
    id: "dev-totem",
    username: "totem",
    role: "totem",
    passwords: ["totem"],
  },
  {
    id: "dev-tv",
    username: "tv",
    role: "tv",
    passwords: ["tv"],
  },
]

function authenticateDevUser(
  username: string,
  password: string,
  area: AuthArea,
  options?: { allowWithDatabaseUrl?: boolean },
) {
  if (process.env.NODE_ENV === "production") return null
  if (hasDatabaseUrl() && !options?.allowWithDatabaseUrl) return null

  const user = devUsers.find((item) => item.username === username)
  if (!user) return null

  if (user.role !== area && user.role !== "admin") return null
  if (!user.passwords.includes(password)) return null

  return { id: user.id, name: user.username, role: user.role }
}

function matchesDevPassword(username: string, password: string): boolean {
  if (process.env.NODE_ENV === "production") return false

  const devUser = devUsers.find((item) => item.username === username)
  if (!devUser) return false

  return devUser.passwords.includes(password)
}

function resolveAuthSecret() {
  const envSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET

  if (envSecret) return envSecret

  const allowLocalBuildFallback =
    process.env.ALLOW_MISSING_AUTH_SECRET_IN_LOCAL_BUILD === "true" &&
    !process.env.CI &&
    !process.env.VERCEL

  if (process.env.NODE_ENV === "production") {
    if (allowLocalBuildFallback) {
      console.warn(
        "[auth] AUTH_SECRET ausente, usando fallback apenas para build local. Nao use em producao.",
      )
      return "dev-only-jtc-auth-secret-change-in-production"
    }

    throw new Error(
      "AUTH_SECRET (ou NEXTAUTH_SECRET) nao definido em producao. Defina a variavel para deploy real, ou use ALLOW_MISSING_AUTH_SECRET_IN_LOCAL_BUILD=true apenas para build local.",
    )
  }

  return "dev-only-jtc-auth-secret-change-in-production"
}

const authSecret = resolveAuthSecret()

/**
 * Factory para criar configurações independentes de Auth para cada área.
 * Isso permite ter cookies de sessão diferentes para Admin, Totem e TV.
 */
function createAuthOptions(area: AuthArea): NextAuthConfig {
  return {
    secret: authSecret,
    trustHost: true,
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

          const devUser = authenticateDevUser(username, password, area)
          if (devUser) return devUser

          const devFallbackUser = () =>
            authenticateDevUser(username, password, area, { allowWithDatabaseUrl: true })

          try {
            const { db } = await import("./db")
            const { users } = await import("./db/schema")
            const { eq } = await import("drizzle-orm")

            const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)
            if (!user) return devFallbackUser()

            // RN: Verificar se o usuário tem o papel correto para a área (ou é admin)
            if (user.role !== area && user.role !== "admin") return devFallbackUser()

            const valid = await compare(password, user.passwordHash)
            if (!valid) return devFallbackUser()

            return { id: String(user.id), name: user.username, role: user.role }
          } catch (error) {
            console.error("[auth] Falha ao autenticar usuário:", error)

            // Em desenvolvimento, permite login local se o banco estiver indisponível.
            const fallbackUser = devFallbackUser()
            if (fallbackUser) return fallbackUser

            return null
          }
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
