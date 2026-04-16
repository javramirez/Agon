import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getCurrentAgonista } from '@/lib/auth'
import { getRetoPorId } from '@/lib/db/queries'
import { EsperandoClient } from '@/components/agon/esperando-client'

export default async function EsperandoPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const agonista = await getCurrentAgonista()
  if (!agonista?.retoId) redirect('/seleccionar-modo')

  const reto = await getRetoPorId(agonista.retoId)
  if (!reto) redirect('/seleccionar-modo')

  // Si el reto ya está activo, no debería estar aquí
  if (reto.estado === 'activo') redirect('/dashboard')
  if (reto.estado === 'completado') redirect('/veredicto')

  return (
    <EsperandoClient
      modo={reto.modo}
      estado={reto.estado}
      codigoInvitacion={reto.codigoInvitacion ?? null}
      fechaInicio={reto.fechaInicio ?? null}
    />
  )
}
