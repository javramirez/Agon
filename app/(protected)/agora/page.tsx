import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  getAgoraEventos,
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

  const [eventos, tiposPorEvento] = (await Promise.all([
    getAgoraEventos(reto.id, 50),
    getTiposAclamacionHoyPorEvento(agonista.id),
    sleep(Math.max(0, 4000 - (Date.now() - __pageLoadT0))),
  ])) as [
    Awaited<ReturnType<typeof getAgoraEventos>>,
    Awaited<ReturnType<typeof getTiposAclamacionHoyPorEvento>>,
    void,
  ]

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

      <p className="text-xs text-muted-foreground font-body px-1">
        {eventos.length} eventos en el Gran Agon
      </p>

      <AgoraConTriggerClient
        eventosIniciales={eventos}
        tiposPorEvento={tiposPorEvento}
      />
    </div>
  )
}
