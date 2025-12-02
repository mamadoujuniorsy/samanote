import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Routes protégées (l'application)
  const protectedRoutes = [
    "/dashboard", 
    "/profile", 
    "/settings",
    "/notes",
    "/quiz",
    "/subjects",
    "/ai",
    "/pdf-analyzer"
  ]
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Routes d'authentification
  const authRoutes = ["/auth/signin", "/auth/signup", "/auth/login", "/auth/register"]
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Redirection si non authentifié sur route protégée
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/signin"
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Redirection si déjà authentifié sur route d'auth
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
