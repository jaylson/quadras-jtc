import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

/**
 * Configuração NextAuth v5 (Auth.js)
 * Isolamos os imports do Banco de Dados dentro da função authorize para evitar
 * erros de "Configuration" no Middleware do Vercel (que roda em Edge Runtime).
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

        if (!username || !password) return null

        // Imports dinâmicos para rodar apenas no Node Runtime da API Route,
        // não quebrando o Middleware (Edge)
        const { db } = await import("./db")
        const { users } = await import("./db/schema")
        const { eq } = await import("drizzle-orm")

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1)

        if (!user) return null

        const valid = await compare(password, user.passwordHash)
        if (!valid) return null

        return {
          id: String(user.id),
          name: user.username,
          role: user.role, // Adicionando o papel do usuário
        }
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
})
