import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { LandingPage } from '@/components/agon/landing-page'

export default async function Home() {
  const { userId } = await auth()
  if (userId) {
    const { getAgonistaByClerkId } = await import('@/lib/db/queries')
    const agonista = await getAgonistaByClerkId(userId)
    if (!agonista?.retoId) redirect('/seleccionar-modo')
    redirect('/dashboard')
  }
  return <LandingPage />
}
