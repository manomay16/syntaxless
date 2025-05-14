import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the request is for a protected route
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/ide") ||
    req.nextUrl.pathname.startsWith("/learn") ||
    req.nextUrl.pathname.startsWith("/settings")

  // If accessing a protected route without a session, redirect to sign in
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/auth/sign-in", req.url)
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing auth routes with a session, redirect to dashboard
  if (
    (req.nextUrl.pathname.startsWith("/auth/sign-in") || req.nextUrl.pathname.startsWith("/auth/sign-up")) &&
    session
  ) {
    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ide/:path*",
    "/learn/:path*",
    "/settings/:path*",
    "/auth/sign-in",
    "/auth/sign-up",
    "/auth/reset-password",
    "/auth/update-password",
  ],
}
