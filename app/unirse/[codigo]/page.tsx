import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { retos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentAgonista } from '@/lib/auth'
import { UnirseClient } from '@/components/agon/unirse-client'

interface Props {
  params: Promise<{ codigo: string }>
}

export default async function UnirsePage({ params }: Props) {
  const { codigo } = await params
  const { userId } = await auth()
  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/unirse/${codigo}`)}`)
  }

  const result = await db
    .select()
    .from(retos)
    .where(eq(retos.codigoInvitacion, codigo.toUpperCase()))
    .limit(1)

  const reto = result[0] ?? null

  if (!reto) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-6xl">⚡</p>
          <h2 className="font-display text-2xl font-bold text-white">
            Código inválido
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            Este link de invitación no existe o ya expiró.
          </p>
        </div>
      </div>
    )
  }

  if (reto.estado === 'completado') {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-6xl">🏛️</p>
          <h2 className="font-display text-2xl font-bold text-white">
            El Agon ha concluido
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            Este reto ya finalizó. Los dioses ya dictaron su veredicto.
          </p>
        </div>
      </div>
    )
  }

  const agonista = await getCurrentAgonista()
  if (agonista?.retoId === reto.id) {
    redirect('/esperando')
  }

  if (agonista?.retoId && agonista.retoId !== reto.id) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-6xl">⚔️</p>
          <h2 className="font-display text-2xl font-bold text-white">
            Ya tienes un reto activo
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            No puedes unirte a otro reto mientras tienes uno en curso.
          </p>
        </div>
      </div>
    )
  }

  if (reto.invitadoClerkId) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-6xl">🛡️</p>
          <h2 className="font-display text-2xl font-bold text-white">
            El duelo ya está completo
          </h2>
          <p className="text-sm text-muted-foreground font-body">
            Este reto ya tiene dos agonistas.
          </p>
        </div>
      </div>
    )
  }

  return <UnirseClient codigo={codigo.toUpperCase()} retoId={reto.id} />
}
