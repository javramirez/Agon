import { getCurrentAgonista, getAntagonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NivelBadge } from '@/components/agon/nivel-badge'
import { KleosBadge } from '@/components/agon/kleos-badge'
import { PulsoRealtime } from '@/components/agon/pulso-realtime'
import { DistanciaAlFrente } from '@/components/agon/distancia-al-frente'
import { PruebasDelDia } from '@/components/agon/pruebas-del-dia'
import { getDiaDelAgan, getDiasRestantes, getMensajeHora } from '@/lib/utils'
import {
  getOrCreatePruebaDiariaHoy,
  getLlamasAgonista,
  getPruebaDiariaAntagonista,
} from '@/lib/db/queries'
import { AGONISTAS } from '@/lib/auth'
import { SemanaSagradaBanner } from '@/components/agon/semana-sagrada-banner'
import { DashboardEventos } from '@/components/agon/dashboard-eventos'
import { sleep } from '@/lib/utils/sleep'
import type { PruebaDiaria } from '@/lib/db/schema'

function pruebasCompletadasAntagonista(p: PruebaDiaria): Record<string, boolean> {
  return {
    agua: p.soloAgua,
    comida: p.sinComidaRapida,
    pasos: p.pasos >= 10000,
    sueno: p.horasSueno >= 7,
    lectura: p.paginasLeidas >= 10,
    gym: p.sesionesGym >= 4,
    cardio: p.sesionesCardio >= 3,
  }
}

export default async function DashboardPage() {
  const __pageLoadT0 = Date.now()
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const antagonistaConfig = Object.values(AGONISTAS).find(
    (a) => a.clerkId !== agonista.clerkId
  )

  const antagonista = await getAntagonista(agonista.clerkId)

  const [pruebaHoy, llamas, pruebaAntagonista] = (await Promise.all([
    getOrCreatePruebaDiariaHoy(agonista.id),
    getLlamasAgonista(agonista.id),
    antagonista
      ? getPruebaDiariaAntagonista(antagonista.id)
      : Promise.resolve(null),
    sleep(Math.max(0, 4000 - (Date.now() - __pageLoadT0))),
  ])) as [
    Awaited<ReturnType<typeof getOrCreatePruebaDiariaHoy>>,
    Awaited<ReturnType<typeof getLlamasAgonista>>,
    Awaited<ReturnType<typeof getPruebaDiariaAntagonista>> | null,
    void,
  ]

  const diaActual = getDiaDelAgan()
  const diasRestantes = getDiasRestantes()

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="space-y-1 pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
          Día {diaActual} · {diasRestantes} días restantes
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">
          El Agon de Hoy,{' '}
          <span className="text-amber">{agonista.nombre}.</span>
        </h1>
        <p className="text-xs text-muted-foreground/60 font-body italic mt-1">
          {getMensajeHora()}
        </p>
      </div>

      <SemanaSagradaBanner />
      <DashboardEventos />

      <div className="bg-surface-1 rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <KleosBadge cantidad={agonista.kleosTotal} size="lg" />
          <span className="text-xs text-muted-foreground font-body">kleos acumulado</span>
        </div>
        <NivelBadge
          nivel={agonista.nivel}
          kleosTotal={agonista.kleosTotal}
          showProgress
        />
      </div>

      {antagonista && (
        <DistanciaAlFrente
          kleosPropio={agonista.kleosTotal}
          kleosAntagonista={antagonista.kleosTotal}
          nombreAntagonista={antagonistaConfig?.nombre ?? 'El Antagonista'}
        />
      )}

      <PulsoRealtime
        nombrePropio={agonista.nombre}
        nombreAntagonista={antagonistaConfig?.nombre ?? 'El Antagonista'}
      />

      <PruebasDelDia
        prueba={pruebaHoy}
        llamas={llamas}
        nivel={agonista.nivel}
        nombreAntagonista={antagonistaConfig?.nombre ?? 'El Antagonista'}
        pruebasAntagonista={
          pruebaAntagonista ? pruebasCompletadasAntagonista(pruebaAntagonista) : {}
        }
      />

    </div>
  )
}
