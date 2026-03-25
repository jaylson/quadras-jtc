import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminShell from "@/components/admin/AdminShell"

/**
 * Layout do grupo (protected) — aplica apenas a /admin e outras rotas
 * DENTRO do grupo, excluindo /admin/login que fica fora do grupo.
 */
export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/admin/login")

  return <AdminShell session={session}>{children}</AdminShell>
}
