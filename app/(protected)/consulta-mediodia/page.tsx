import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getCurrentAgonista } from '@/lib/auth'
import { consultaDisponible } from '@/lib/consulta-mediodia/config'
import { ConsultaMediadiaClient } from '@/components/agon/consulta-mediodia-client'
import { db } from '@/lib/db'
import { pactoInicial } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'

export default async function ConsultaMediadiaPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const startDate = process.env.NEXT_PUBLIC_AGON_START_DATE ?? ''
  const disponible = consultaDisponible(
    startDate,
    agonista.consultaMediaCompleta ?? false
  )

  if (!disponible) redirect('/dashboard')

  const [pactoRow] = await db
    .select({
      arquetipo: pactoInicial.arquetipo,
      puntoPartida: pactoInicial.puntoPartida,
    })
    .from(pactoInicial)
    .where(eq(pactoInicial.agonistId, agonista.id))
    .orderBy(asc(pactoInicial.acto))
    .limit(1)

  return (
    <ConsultaMediadiaClient
      mentorActual={agonista.mentorAsignado ?? 'quiron'}
      arquetipoActual={pactoRow?.arquetipo ?? 'constante'}
      puntoPartida={pactoRow?.puntoPartida ?? 'default'}
    />
  )
}
