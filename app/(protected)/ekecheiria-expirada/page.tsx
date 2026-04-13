import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { EkecheiriaExpiradaClient } from '@/components/agon/ekecheiria-expirada-client'

export default async function EkecheiriaExpiradaPage() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  return <EkecheiriaExpiradaClient nombreAgonista={agonista.nombre} />
}
