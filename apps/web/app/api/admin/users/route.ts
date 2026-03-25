import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

/**
 * GET /api/admin/users
 * Retorna os usuários do sistema (admin, totem, tv)
 */
export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const allUsers = await db.select({
    id: users.id,
    username: users.username,
    role: users.role,
  }).from(users)

  return NextResponse.json(allUsers)
}

/**
 * PATCH /api/admin/users
 * Permite a troca de senha dos usuários
 */
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { username, newPassword } = await req.json()

    if (!username || !newPassword) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10)

    await db.update(users)
      .set({ passwordHash })
      .where(eq(users.username, username))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar senha:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
