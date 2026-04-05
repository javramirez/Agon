import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getCurrentAgonista } from '@/lib/auth'
import { OnboardingClient } from '@/components/agon/onboarding-client'

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')
  if (agonista.oraculoSellado) redirect('/dashboard')

  return <OnboardingClient nombre={agonista.nombre} />
}
