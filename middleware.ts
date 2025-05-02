import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")
  const isLoginPage = request.nextUrl.pathname === "/login"

  // If trying to access login page and already authenticated, redirect to home
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If trying to access protected route and not authenticated, redirect to login
  if (!isLoginPage && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
