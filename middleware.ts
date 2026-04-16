import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/perfil(.*)',
  '/altis(.*)',
  '/agora(.*)',
  '/poderes(.*)',
  '/codex(.*)',
  '/cronicas(.*)',
  '/oraculo(.*)',
  '/correspondencia(.*)',
  '/mentor(.*)',
  '/contrato(.*)',
  '/veredicto(.*)',
  '/ekecheiria-activa(.*)',
  '/ekecheiria-expirada(.*)',
  '/consulta-mediodia(.*)',
  '/admin(.*)',
  '/api/(.*)',
])

const isOnboardingRoute = createRouteMatcher([
  '/onboarding(.*)',
  '/seleccionar-modo(.*)',
  '/unirse(.*)',
  '/esperando(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  if (isProtectedRoute(req) || isOnboardingRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    // Sin allowlist — cualquier usuario autenticado pasa.
    // La app decide qué mostrar según estado en DB.
  }

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', req.nextUrl.pathname)
  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
