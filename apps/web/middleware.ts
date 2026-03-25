import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const user = req.auth?.user as any
  const isLoggedIn = !!user
  const role = user?.role

  // 1. ADMIN
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return
    if (!isLoggedIn || role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin))
    }
  }

  // 2. TOTEM
  if (pathname.startsWith("/totem")) {
    if (pathname === "/totem/login") return
    if (!isLoggedIn || (role !== "totem" && role !== "admin")) {
      return NextResponse.redirect(new URL("/totem/login", req.nextUrl.origin))
    }
  }

  // 3. TV
  if (pathname.startsWith("/tv")) {
    if (pathname === "/tv/login") return
    if (!isLoggedIn || (role !== "tv" && role !== "admin")) {
      return NextResponse.redirect(new URL("/tv/login", req.nextUrl.origin))
    }
  }
})

export const config = {
  matcher: ["/admin/:path*", "/totem/:path*", "/tv/:path*"],
}
