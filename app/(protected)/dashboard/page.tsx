import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NivelBadge } from '@/components/agon/nivel-badge'
import { KleosBadge } from '@/components/agon/kleos-badge'
import { PulsoRealtime } from '@/components/agon/pulso-realtime'
import { PruebasDelDia } from '@/components/agon/pruebas-del-dia'
import { getDiaDelAgan, getDiasRestantes, getMensajeHora } from '@/lib/utils'
import { getOrCreatePruebaDiariaHoy, getLlamasAgonista } from '@/lib/db/queries'
import { AGONISTAS } from '@/lib/auth'
import { SemanaSagradaBanner } from '@/components/agon/semana-sagrada-banner'
import { PruebaExtraordinariaBanner } from '@/components/agon/prueba-extraordinaria-banner'

export default async function DashboardPage() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const antagonistaConfig = Object.values(AGONISTAS).find(
    (a) => a.clerkId !== agonista.clerkId
  )

  const [pruebaHoy, llamas] = await Promise.all([
    getOrCreatePruebaDiariaHoy(agonista.id),
    getLlamasAgonista(agonista.id),
  ])

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
      <PruebaExtraordinariaBanner />

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
        nombreAntagonista={antagonistaConfig?.nombre ?? 'El Antagonista'}
      />

      <PruebasDelDia
        prueba={pruebaHoy}
        llamas={llamas}
      />

    </div>
  )
}
