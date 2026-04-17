import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getCurrentAgonista } from '@/lib/auth'
import { getRetoPorId, getAgonistaByClerkId } from '@/lib/db/queries'
import { EsperandoClient } from '@/components/agon/esperando-client'
import { activarRetosListos } from '@/lib/retos/activar'

export default async function EsperandoPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const agonista = await getCurrentAgonista()
  if (!agonista?.retoId) redirect('/seleccionar-modo')

  await activarRetosListos().catch(() => {})
  const reto = await getRetoPorId(agonista.retoId)
  if (!reto) redirect('/seleccionar-modo')

  if (reto.estado === 'activo') redirect('/dashboard')
  if (reto.estado === 'completado') redirect('/veredicto')

  let ambosSellaronPacto = false
  if (reto.modo === 'solo') {
    ambosSellaronPacto = agonista.oraculoSellado
  } else if (reto.invitadoClerkId) {
    const invitado = await getAgonistaByClerkId(reto.invitadoClerkId)
    ambosSellaronPacto = agonista.oraculoSellado && Boolean(invitado?.oraculoSellado)
  }

  const rolActual = reto.creadorClerkId === userId ? 'creador' : 'invitado'

  return (
    <EsperandoClient
      modo={reto.modo}
      estado={reto.estado}
      codigoInvitacion={reto.codigoInvitacion ?? null}
      fechaInicio={reto.fechaInicio ?? null}
      rolActual={rolActual}
      ambosSellaronPacto={ambosSellaronPacto}
      fechaConfirmadaPorCreador={reto.fechaConfirmadaPorCreador}
      fechaConfirmadaPorInvitado={reto.fechaConfirmadaPorInvitado}
    />
  )
}
