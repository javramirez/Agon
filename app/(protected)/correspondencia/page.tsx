import { getCurrentAgonista, AGONISTAS } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CorrespondenciaChat } from '@/components/agon/correspondencia-chat'
import { getAgonistaByClerkId } from '@/lib/db/queries'

export default async function CorrespondenciaPage() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const antagonistaConfig = Object.values(AGONISTAS).find(
    (a) => a.clerkId !== agonista.clerkId
  )
  const antagonista = antagonistaConfig
    ? await getAgonistaByClerkId(antagonistaConfig.clerkId)
    : null

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          La Correspondencia
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">
          Escribe al antagonista.
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-1">
          Lo que se dice en la correspondencia, el Altis también lo presencia.
        </p>
      </div>

      <CorrespondenciaChat
        agonistId={agonista.id}
        nombrePropio={agonista.nombre}
        nombreAntagonista={antagonista?.nombre ?? 'El Antagonista'}
      />
    </div>
  )
}
