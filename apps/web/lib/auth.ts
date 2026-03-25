import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

/**
 * Configuração NextAuth v5 (Auth.js)
 *
 * Fase atual: valida contra usuário hardcoded (igual ao protótipo).
 * Quando F1-16 for concluído, substituir por consulta ao banco:
 *   const [user] = await db.select().from(users).where(eq(users.username, username))
 *   const valid = await compare(password, user.passwordHash)
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Usuário", type: "text" },
        password: { label: "Senha",   type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string
          password: string
        }

        // ──────────────────────────────────────────────────────────
        // TODO (F1-16+): trocar por consulta ao Azure MySQL
        // const [user] = await db.select().from(users)
        //   .where(eq(users.username, username)).limit(1)
        // if (!user) return null
        // const valid = await compare(password, user.passwordHash)
        // if (!valid) return null
        // return { id: String(user.id), name: user.username }
        // ──────────────────────────────────────────────────────────

        // Fase atual: credencial mockada (admin / admin123)
        const MOCK_USERNAME = "admin"
        const MOCK_PASSWORD = "admin123"

        if (username !== MOCK_USERNAME || password !== MOCK_PASSWORD) return null

        return { id: "1", name: "Administrador" }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
