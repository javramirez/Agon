import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAgonistaByClerkId } from '@/lib/db/queries'
import { SeleccionarModoClient } from '@/components/agon/seleccionar-modo-client'

export default async function SeleccionarModoPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // Si ya tiene reto, no debería estar aquí
  const agonista = await getAgonistaByClerkId(userId)
  if (agonista?.retoId) redirect('/dashboard')

  return <SeleccionarModoClient />
}

