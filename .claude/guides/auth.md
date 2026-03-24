# Guia – Autenticação (NextAuth.js v5)

## Configuração Base

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'
import { db } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials as { username: string; password: string }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1)

        if (!user) return null

        const valid = await compare(password, user.passwordHash)
        if (!valid) return null

        return { id: String(user.id), name: user.username }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
})
```

## Middleware de Proteção

```typescript
// middleware.ts (raiz do projeto)
import { auth } from './lib/auth'

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage  = req.nextUrl.pathname === '/admin/login'
  const isLoggedIn   = !!req.auth

  if (isAdminRoute && !isLoginPage && !isLoggedIn) {
    return Response.redirect(new URL('/admin/login', req.nextUrl.origin))
  }
})

export const config = {
  matcher: ['/admin/:path*'],
}
```

## Fluxo de Login

1. Usuário acessa `/admin` → middleware redireciona para `/admin/login`
2. Login com usuário + senha → credentials provider valida contra MySQL
3. JWT gerado e armazenado em cookie HttpOnly seguro
4. Acesso liberado ao `/admin`
5. Logout → `signOut()` limpa sessão → redirect para `/` (Landing Page)

## Feedback de Erro (RF-02)

```tsx
// Em /admin/login/page.tsx
const [error, setError] = useState<string | null>(null)

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  const result = await signIn('credentials', {
    username, password, redirect: false
  })
  if (result?.error) {
    setError('Usuário ou senha inválidos.')   // inline, em vermelho
  } else {
    router.push('/admin')
  }
}
```

## Credenciais de Desenvolvimento

```
Usuário: admin
Senha: admin123
```

> ⚠️ Alterar antes do deploy em produção! Usar `.env.local` para configurar.
