import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentAgonista } from '@/lib/auth'
import { getRetoPorId } from '@/lib/db/queries'
import { db } from '@/lib/db'
import { pactoInicial, agoraEventos, cronicas } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { CodexClient } from '@/components/agon/codex-client'
import { sleep } from '@/lib/utils/sleep'

const TIPOS_BITACORA = [
  'dia_perfecto',
  'nivel_subido',
  'inscripcion_desbloqueada',
  'hegemonia_ganada',
  'prueba_extraordinaria',
  'senalamiento',
  'cronica_semanal',
] as const

export default async function CodexPage() {
  const __t0 = Date.now()
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const reto =
    agonista.retoId != null ? await getRetoPorId(agonista.retoId) : null

  const [pactoRows, bitacoraRows, cronicasRows] = await Promise.all([
    db.select().from(pactoInicial).where(eq(pactoInicial.agonistId, agonista.id)).limit(1),
    db
      .select()
      .from(agoraEventos)
      .where(eq(agoraEventos.agonistId, agonista.id))
      .orderBy(desc(agoraEventos.createdAt))
      .limit(50),
    db.select().from(cronicas).orderBy(desc(cronicas.semana)).limit(10),
  ])

  const bitacora = bitacoraRows.filter((e) =>
    (TIPOS_BITACORA as readonly string[]).includes(e.tipo)
  )

  await sleep(Math.max(0, 4000 - (Date.now() - __t0)))

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          El Códex
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">La biblioteca del Agon.</h1>
      </div>

      <Suspense fallback={null}>
        <CodexClient
          agonistaNombre={agonista.nombre}
          agonistaNivel={agonista.nivel}
          mentorAsignado={agonista.mentorAsignado ?? null}
          pacto={pactoRows[0] ?? null}
          bitacora={bitacora}
          cronicas={cronicasRows}
          fechaInicioReto={reto?.fechaInicio ?? null}
        />
      </Suspense>
    </div>
  )
}
