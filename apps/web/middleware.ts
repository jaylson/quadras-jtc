import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname }  = req.nextUrl
  const isAdminRoute  = pathname.startsWith("/admin")
  const isLoginPage   = pathname === "/admin/login"
  const isLoggedIn    = !!req.auth

  if (isAdminRoute && !isLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin))
  }
})

export const config = {
  matcher: ["/admin/:path*"],
}
