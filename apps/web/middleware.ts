import { adminAuth, totemAuth, tvAuth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default async function middleware(req: any) {
  const { pathname } = req.nextUrl

  // 1. ADMIN
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return
    const session = await adminAuth.auth()
    const role = (session?.user as any)?.role
    if (!session || role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin))
    }
  }

  // 2. TOTEM
  if (pathname.startsWith("/totem")) {
    if (pathname === "/totem/login") return
    const session = await totemAuth.auth()
    const role = (session?.user as any)?.role
    if (!session || (role !== "totem" && role !== "admin")) {
      return NextResponse.redirect(new URL("/totem/login", req.nextUrl.origin))
    }
  }

  // 3. TV
  if (pathname.startsWith("/tv")) {
    if (pathname === "/tv/login") return
    const session = await tvAuth.auth()
    const role = (session?.user as any)?.role
    if (!session || (role !== "tv" && role !== "admin")) {
      return NextResponse.redirect(new URL("/tv/login", req.nextUrl.origin))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/totem",
    "/totem/:path*",
    "/tv",
    "/tv/:path*",
  ],
}
