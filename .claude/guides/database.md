# Guia – Banco de Dados (Drizzle ORM + Azure MySQL)

## Conexão (Azure MySQL)

| Campo | Valor |
|---|---|
| **Host** | `newdataserver.mysql.database.azure.com` |
| **Usuário** | `dataserver_wp` |
| **Senha** | `.env.local` → `DATABASE_PASSWORD` |
| **SSL** | Obrigatório (`sslaccept=strict`) |
| **Driver** | `mysql2` |

### Template `.env.local`

```bash
# Nunca commitar este arquivo
DATABASE_URL="mysql://dataserver_wp:SENHA_AQUI@newdataserver.mysql.database.azure.com:3306/jtc?sslaccept=strict"
DATABASE_PASSWORD="SENHA_AQUI"

# NextAuth
NEXTAUTH_SECRET="gerar-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

> ⚠️ Adicionar `.env.local` ao `.gitignore`. Nunca expor credenciais no repositório.

---

## Estratégia de Dados: Mock → Banco Real

O desenvolvimento inicial usa **dados mockados** em `lib/mock/` (TypeScript estático).
Quando a conexão com o Azure for validada, a troca é feita trocando a importação nos Route Handlers — sem alterar componentes.

```
lib/
├── mock/
│   ├── courts.ts        # Court[] estático (4 quadras)
│   ├── blocks.ts        # AdminBlock[] estático
│   ├── reservations.ts  # Reservation[] estático
│   └── settings.ts      # { rainMode: false }
└── db/
    ├── schema.ts        # Definições Drizzle
    ├── index.ts         # Instância do cliente Drizzle
    └── seed.ts          # Seed para produção
```

**Interface comum** — cada módulo mock exporta as mesmas funções que o Drizzle usará:

```typescript
// Exemplo: lib/mock/courts.ts
export const mockCourts: Court[] = [ /* ... */ ]

// Em produção, substituir por:
// const courts = await db.select().from(schema.courts)
```

---

## Schemas das Tabelas

### `courts` (Quadras)

```typescript
import { mysqlTable, int, varchar, boolean, date, mysqlEnum } from 'drizzle-orm/mysql-core'

export const courts = mysqlTable('courts', {
  id:                 int('id').primaryKey().autoincrement(),
  name:               varchar('name', { length: 100 }).notNull(),
  type:               mysqlEnum('type', ['coberta', 'descoberta']).notNull(),
  surface:            mysqlEnum('surface', ['saibro', 'hard', 'grama']).notNull(),
  active:             boolean('active').notNull().default(true),
  deactivateStart:    date('deactivate_start'),
  deactivateEnd:      date('deactivate_end'),
  usageMinutesDry:    int('usage_minutes_dry').notNull().default(60),
  usageMinutesRain:   int('usage_minutes_rain').notNull().default(60),
  intervalMinutes:    int('interval_minutes').notNull().default(15),
})
```

### `admin_blocks` (Travas)

```typescript
export const adminBlocks = mysqlTable('admin_blocks', {
  id:         int('id').primaryKey().autoincrement(),
  title:      varchar('title', { length: 200 }).notNull(),
  category:   mysqlEnum('category', ['aula', 'campeonato', 'evento', 'manutencao', 'outro']).notNull(),
  courtIds:   json('court_ids').$type<number[]>().notNull(),   // array de IDs
  date:       date('date').notNull(),
  startTime:  varchar('start_time', { length: 5 }).notNull(),  // HH:MM
  endTime:    varchar('end_time', { length: 5 }).notNull(),    // HH:MM
  recurring:  mysqlEnum('recurring', ['nenhuma', 'semanal']).notNull().default('nenhuma'),
  notes:      varchar('notes', { length: 500 }),
})
```

### `reservations` (Reservas)

```typescript
export const reservations = mysqlTable('reservations', {
  id:         int('id').primaryKey().autoincrement(),
  courtId:    int('court_id').notNull().references(() => courts.id),
  courtName:  varchar('court_name', { length: 100 }).notNull(),
  playerName: varchar('player_name', { length: 500 }).notNull(),
  playerPhone:varchar('player_phone', { length: 20 }).notNull(),
  players:    json('players').$type<Player[]>().notNull(),
  gameType:   mysqlEnum('game_type', ['simples', 'duplas']).notNull(),
  startTime:  datetime('start_time').notNull(),
  endTime:    datetime('end_time').notNull(),
  status:     mysqlEnum('status', ['em uso', 'agendada', 'concluída']).notNull(),
})
```

### `users` (Usuários Admin)

```typescript
export const users = mysqlTable('users', {
  id:           int('id').primaryKey().autoincrement(),
  username:     varchar('username', { length: 50 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt:    timestamp('created_at').defaultNow(),
})
```

### `settings` (Configurações Globais)

```typescript
export const settings = mysqlTable('settings', {
  key:   varchar('key', { length: 50 }).primaryKey(),
  value: text('value').notNull(),
})
// Chaves: 'rain_mode' → '0' | '1'
```

## Comandos Drizzle

```bash
npm run db:generate    # drizzle-kit generate
npm run db:migrate     # drizzle-kit migrate
npm run db:studio      # drizzle-kit studio (UI visual)
npm run db:seed        # executa /lib/db/seed.ts
```

## Seed Esperado

- 4 quadras: Q1 (coberta/saibro), Q2 (coberta/hard), Q3 (descoberta/saibro), Q4 (descoberta/grama)
- 1 usuário admin: `admin` / senha hasheada com bcrypt
- Configuração: `rain_mode = '0'`
