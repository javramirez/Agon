import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getCurrentAgonista } from '@/lib/auth'
import { OnboardingClient } from '@/components/agon/onboarding-client'
import { sleep } from '@/lib/utils/sleep'

export default async function OnboardingPage() {
  const __pageLoadT0 = Date.now()
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')
  if (agonista.oraculoSellado) redirect('/dashboard')

  await sleep(Math.max(0, 3000 - (Date.now() - __pageLoadT0)))

  return <OnboardingClient nombre={agonista.nombre} />
}
