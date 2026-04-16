import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CorrespondenciaChat } from '@/components/agon/correspondencia-chat'
import { getAntagonistaPorReto } from '@/lib/db/queries'
import { sleep } from '@/lib/utils/sleep'

export default async function CorrespondenciaPage() {
  const __pageLoadT0 = Date.now()
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const antagonista =
    agonista.retoId != null
      ? await getAntagonistaPorReto(agonista.retoId, agonista.id)
      : null

  await sleep(Math.max(0, 4000 - (Date.now() - __pageLoadT0)))

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-surface-2 border border-border rounded-xl p-4 mb-4">
        <p className="text-xs font-body text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">La Correspondencia</span>{' '}
          ha sido reemplazada por los comentarios en{' '}
          <Link href="/agora" className="text-amber hover:underline">
            El Ágora
          </Link>
          . Los mensajes anteriores siguen disponibles aquí.
        </p>
      </div>

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
