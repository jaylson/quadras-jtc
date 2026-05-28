import postgres from "postgres"

const envKeys = ["DATABASE_URL", "SUPABASE_DB_URL", "SUPABASE_DATABASE_URL"]

function getDatabaseUrl() {
  for (const key of envKeys) {
    const value = process.env[key]
    if (value) {
      return { key, value }
    }
  }

  return null
}

function inferAdvice(host, hasSslMode) {
  const tips = []

  if (host.includes("pooler.supabase.com")) {
    tips.push("Host de pooler detectado. O usuario costuma ser postgres.<project_ref>.")
  }

  if (!hasSslMode) {
    tips.push("Adicione sslmode=require na URL para conexao TLS explicita.")
  }

  tips.push("Se a senha tiver caracteres especiais (@, :, /, #), use URL encoding na senha.")
  tips.push("Se erro for 28P01, redefina a senha do banco no Supabase e atualize o .env.local.")

  return tips
}

async function main() {
  const entry = getDatabaseUrl()

  if (!entry) {
    console.log("DB_CHECK=NOT_CONFIGURED")
    console.log("Nenhuma URL encontrada. Defina DATABASE_URL, SUPABASE_DB_URL ou SUPABASE_DATABASE_URL.")
    process.exit(1)
  }

  let parsed
  try {
    parsed = new URL(entry.value)
  } catch {
    console.log("DB_CHECK=INVALID_URL")
    console.log(`Variavel ${entry.key} contem URL invalida.`)
    process.exit(1)
  }

  const host = parsed.hostname
  const port = parsed.port || "5432"
  const user = parsed.username || "<empty>"
  const hasSslMode = parsed.searchParams.has("sslmode")

  console.log("DB_CHECK=START")
  console.log(`SOURCE_VAR=${entry.key}`)
  console.log(`HOST=${host}`)
  console.log(`PORT=${port}`)
  console.log(`USER=${user}`)
  console.log(`SSLMODE=${parsed.searchParams.get("sslmode") ?? "<none>"}`)

  const sql = postgres(entry.value, {
    prepare: false,
    connect_timeout: 8,
  })

  try {
    await sql`select 1 as ok`
    console.log("DB_CHECK=OK")
    process.exit(0)
  } catch (error) {
    const err = error
    const code = typeof err === "object" && err && "code" in err ? err.code : "unknown"
    const message =
      typeof err === "object" && err && "message" in err
        ? String(err.message).split("\n")[0]
        : "unknown"

    console.log("DB_CHECK=ERROR")
    console.log(`ERROR_CODE=${code}`)
    console.log(`ERROR_MESSAGE=${message}`)

    for (const tip of inferAdvice(host, hasSslMode)) {
      console.log(`TIP=${tip}`)
    }

    process.exit(1)
  } finally {
    await sql.end({ timeout: 1 })
  }
}

main()
