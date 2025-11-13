import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Check for demo mode parameter
  const isDemoMode = req.nextUrl.searchParams.get("demo") === "true"
  
  if (isDemoMode) {
    // Allow access to protected routes in demo mode
    return res
  }
  
  try {
    const supabase = createMiddlewareClient({ req, res })

    // Add timeout to prevent hanging on slow connections
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Auth timeout')), 10000) // 10 seconds
    )

    const {
      data: { session },
    } = await Promise.race([sessionPromise, timeoutPromise]) as any

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
  } catch (error) {
    console.warn("Middleware auth timeout/error (continuing without auth):", error instanceof Error ? error.message : String(error))
    // On timeout or network error, continue without authentication
    // This prevents the app from crashing due to latency issues
    return res
  }
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
