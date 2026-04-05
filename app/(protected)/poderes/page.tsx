import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { VozDelAgon } from '@/components/agon/voz-del-agon'
import { SenalamientoPanel } from '@/components/agon/senalamiento-panel'
import { EkecheiriaPanel } from '@/components/agon/ekecheiria-panel'
import { SectionHeader } from '@/components/agon/section-header'
import { getAgonistaByClerkId } from '@/lib/db/queries'
import { AGONISTAS } from '@/lib/auth/agonistas'

export default async function PoderesPage() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const antagonistaConfig = Object.values(AGONISTAS).find(
    (a) => a.clerkId !== agonista.clerkId
  )
  const antagonista = antagonistaConfig
    ? await getAgonistaByClerkId(antagonistaConfig.clerkId)
    : null

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          Poderes del Agon
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">
          Úsalos con sabiduría.
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-1">
          El agon te da poder sobre tu antagonista. El Altis lo registra todo.
        </p>
      </div>

      <div className="space-y-3">
        <SectionHeader
          titulo="La Voz del Agon"
          subtitulo="Provoca al antagonista. El Ágora lo publicará."
        />
        <VozDelAgon nivel={agonista.nivel} />
      </div>

      <div className="space-y-3">
        <SectionHeader
          titulo="El Señalamiento"
          subtitulo="Una vez. Sin retorno. Nivel Campeón requerido."
        />
        <SenalamientoPanel
          nivel={agonista.nivel}
          nombreAntagonista={antagonista?.nombre ?? 'El Antagonista'}
        />
      </div>

      <div className="space-y-3">
        <SectionHeader
          titulo="La Ekecheiria"
          subtitulo="La tregua sagrada. Solo para lesión o enfermedad real."
        />
        <EkecheiriaPanel />
      </div>
    </div>
  )
}
