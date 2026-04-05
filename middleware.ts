import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/perfil(.*)',
  '/altis(.*)',
  '/agora(.*)',
  '/poderes(.*)',
  '/inscripciones(.*)',
  '/cronicas(.*)',
  '/oraculo(.*)',
  '/correspondencia(.*)',
  '/contrato(.*)',
  '/veredicto(.*)',
  '/admin(.*)',
  '/api/(.*)',
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])

const AUTHORIZED_USER_IDS = [
  process.env.CLERK_JAVIER_USER_ID,
  process.env.CLERK_MATIAS_USER_ID,
].filter(Boolean) as string[]

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  if (isProtectedRoute(req) || isOnboardingRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    if (!AUTHORIZED_USER_IDS.includes(userId)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
