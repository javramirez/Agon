import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { faccionesAfinidad, agonistas } from '@/lib/db/schema'
import { getCurrentAgonista, getAntagonista } from '@/lib/auth'
import { OlimpiaClient } from '@/components/agon/olimpia-client'
import { LoadingOlimpia } from '@/components/agon/loadings/loading-olimpia'
import { Suspense } from 'react'
import { sleep } from '@/lib/utils/sleep'

async function OlimpiaData() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const antagonista = await getAntagonista(agonista.clerkId)

  const start = Date.now()

  const [todasAfinidades, todosAgonistas] = await Promise.all([
    db.select().from(faccionesAfinidad),
    db.select().from(agonistas),
    sleep(Math.max(0, 4000 - (Date.now() - start))),
  ])

  const miAfinidad = todasAfinidades.filter((a) => a.agonistId === agonista.id)
  const rivalAfinidad = antagonista
    ? todasAfinidades.filter((a) => a.agonistId === antagonista.id)
    : []

  const rival =
    antagonista ?? todosAgonistas.find((a) => a.id !== agonista.id) ?? null

  return (
    <OlimpiaClient
      agonistaNombre={agonista.nombre}
      rivalNombre={rival?.nombre ?? 'Tu rival'}
      miAfinidad={miAfinidad}
      rivalAfinidad={rivalAfinidad}
    />
  )
}

export default function OlimpiaPage() {
  return (
    <Suspense fallback={<LoadingOlimpia />}>
      <OlimpiaData />
    </Suspense>
  )
}
