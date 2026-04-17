import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  getAgoraEventos,
  getAclamacionesHoy,
  getTiposAclamacionHoyPorEvento,
  getRetoPorId,
} from '@/lib/db/queries'
import { AgoraConTriggerClient } from '@/components/agon/agora-con-trigger-client'
import { sleep } from '@/lib/utils/sleep'

export const revalidate = 30

export default async function AgoraPage() {
  const __pageLoadT0 = Date.now()
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  if (!agonista.retoId) redirect('/esperando')
  const reto = await getRetoPorId(agonista.retoId)
  if (!reto) redirect('/esperando')

  const [eventos, aclamacionesHoy, tiposPorEvento] = (await Promise.all([
    getAgoraEventos(reto.id, 50),
    getAclamacionesHoy(agonista.id),
    getTiposAclamacionHoyPorEvento(agonista.id),
    sleep(Math.max(0, 4000 - (Date.now() - __pageLoadT0))),
  ])) as [
    Awaited<ReturnType<typeof getAgoraEventos>>,
    number,
    Awaited<ReturnType<typeof getTiposAclamacionHoyPorEvento>>,
    void,
  ]

  const usadas = aclamacionesHoy

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          El Ágora
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">
          La Plaza del Agon.
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-1 leading-relaxed">
          La plaza donde el agon se hace público. Los dioses observan. Los
          agonistas hablan.
        </p>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground font-body">
          {eventos.length} eventos en el Gran Agon
        </p>
        <p className="text-xs text-amber font-body">
          {5 - usadas} aclamaciones disponibles hoy
        </p>
      </div>

      <AgoraConTriggerClient
        eventosIniciales={eventos}
        aclamacionesHoy={usadas}
        tiposPorEvento={tiposPorEvento}
      />
    </div>
  )
}
