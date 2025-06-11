import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Routes protégées
  const protectedRoutes = ["/dashboard", "/profile", "/settings"] // Ajoutez vos routes protégées
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Routes d'authentification
  const authRoutes = ["/auth/login", "/auth/register"]
  const isAuthRoute = authRoutes.includes(pathname)

  // Redirection si non authentifié sur route protégée
  if (isProtectedRoute && !token) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // Redirection si déjà authentifié sur route d'auth
  if (isAuthRoute && token) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/auth/:path*", // Protection spécifique des routes d'authentification
    "/dashboard/:path*", // Exemple de route protégée
  ],
}