import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  getAgoraEventos,
  getAclamacionesHoy,
  getTiposAclamacionHoyPorEvento,
} from '@/lib/db/queries'
import { AgoraConTrigger } from '@/components/agon/agora-con-trigger'

export const revalidate = 30

export default async function AgoraPage() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const [eventos, aclamacionesHoy, tiposPorEvento] = await Promise.all([
    getAgoraEventos(50),
    getAclamacionesHoy(agonista.id),
    getTiposAclamacionHoyPorEvento(agonista.id),
  ])

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
        <p className="text-xs text-muted-foreground font-body mt-1">
          Donde las hazañas se comparten y el Altis las presencia.
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

      <AgoraConTrigger
        eventosIniciales={eventos}
        aclamacionesHoy={usadas}
        tiposPorEvento={tiposPorEvento}
      />
    </div>
  )
}
