import { getCurrentAgonista, getAntagonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NivelBadge } from '@/components/agon/nivel-badge'
import { KleosBadge } from '@/components/agon/kleos-badge'
import { PulsoRealtime } from '@/components/agon/pulso-realtime'
import { PruebasDelDia } from '@/components/agon/pruebas-del-dia'
import { getDiaDelAgan, getDiasRestantes, getMensajeHora, isUltimoDia } from '@/lib/utils'
import {
  getOrCreatePruebaDiariaHoy,
  getLlamasAgonista,
  getPruebaDiariaAntagonista,
} from '@/lib/db/queries'
import { db } from '@/lib/db'
import { faccionesAfinidad } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getMetasEfectivas, getVentajasActivas } from '@/lib/facciones/afinidad'
import { SemanaSagradaBanner } from '@/components/agon/semana-sagrada-banner'
import { UltimoDiaBanner } from '@/components/agon/ultimo-dia-banner'
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

  const antagonista =
    agonista.retoId != null
      ? await getAntagonista(agonista.retoId, agonista.id)
      : null

  const [pruebaHoy, llamas, pruebaAntagonista, afinidades] = (await Promise.all([
    getOrCreatePruebaDiariaHoy(agonista.id),
    getLlamasAgonista(agonista.id),
    antagonista
      ? getPruebaDiariaAntagonista(antagonista.id)
      : Promise.resolve(null),
    db.select().from(faccionesAfinidad).where(eq(faccionesAfinidad.agonistId, agonista.id)),
    sleep(Math.max(0, 4000 - (Date.now() - __pageLoadT0))),
  ])) as [
    Awaited<ReturnType<typeof getOrCreatePruebaDiariaHoy>>,
    Awaited<ReturnType<typeof getLlamasAgonista>>,
    Awaited<ReturnType<typeof getPruebaDiariaAntagonista>> | null,
    (typeof faccionesAfinidad.$inferSelect)[],
    void,
  ]

  const ventajasActivas = getVentajasActivas(afinidades)
  const metasEfectivas = getMetasEfectivas(ventajasActivas)

  const diaActual = getDiaDelAgan()
  const diasRestantes = getDiasRestantes()
  const esUltimoDia = isUltimoDia()

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
      {esUltimoDia && <UltimoDiaBanner />}
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

      <PulsoRealtime
        nombrePropio={agonista.nombre}
        nombreAntagonista={antagonista?.nombre ?? 'El Antagonista'}
      />

      <PruebasDelDia
        prueba={pruebaHoy}
        llamas={llamas}
        nivel={agonista.nivel}
        nombreAntagonista={antagonista?.nombre ?? 'El Antagonista'}
        pruebasAntagonista={
          pruebaAntagonista ? pruebasCompletadasAntagonista(pruebaAntagonista) : {}
        }
        metasEfectivas={metasEfectivas}
      />

    </div>
  )
}
