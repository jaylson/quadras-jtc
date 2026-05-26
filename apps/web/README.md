This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

If you are in the monorepo folder `apps`, you can also run:

```bash
cd /workspaces/quadras-jtc/apps
npm run dev
```

The command above changes into `apps/web` and runs `next dev` there.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase

Esta aplicação usa PostgreSQL via Drizzle e pode conectar diretamente no Supabase.

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

2. Preencha apenas uma URL de banco em `.env.local`:

```env
DATABASE_URL=postgresql://...
# ou
SUPABASE_DB_URL=postgresql://...
```

3. Rode as migrations:

```bash
npm run db:migrate
```

4. Verifique a conectividade em runtime:

```bash
curl http://localhost:3000/api/health/db
```

Respostas esperadas:

- `200`: banco acessível.
- `503` com `not-configured`: variáveis de banco ausentes.
- `503` com `unreachable`: URL configurada, mas conexão indisponível.

## Auth Secret e Build

Este projeto usa Auth.js e aceita `AUTH_SECRET` (ou `NEXTAUTH_SECRET`).

- Producao real: `AUTH_SECRET` e obrigatorio.
- Build local sem secret: use `npm run build:local` para permitir fallback apenas no ambiente local.

Scripts:

```bash
npm run build:strict   # exige AUTH_SECRET/NEXTAUTH_SECRET
npm run build:local    # permite fallback local (nao usar em producao)
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
