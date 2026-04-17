import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { consultaMediodia, agonistas, pactoInicial } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'
import { getCurrentAgonista } from '@/lib/auth'
import {
  getMentorParaArquetipo,
  OPCIONES_CAMBIO,
  consultaDisponible,
} from '@/lib/consulta-mediodia/config'
import { MENTORES } from '@/lib/mentor/config'
import { crearNotificacion } from '@/lib/notificaciones/crear'
import type { ArquetipoKey } from '@/lib/db/schema'
import { getRetoPorId } from '@/lib/db/queries'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getCurrentAgonista()
  if (!agonista) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  if (agonista.consultaMediaCompleta) {
    return NextResponse.json({ error: 'Consulta ya completada' }, { status: 400 })
  }

  const reto =
    agonista.retoId != null ? await getRetoPorId(agonista.retoId) : null
  const startDate = reto?.fechaInicio ?? ''
  if (!consultaDisponible(startDate, Boolean(agonista.consultaMediaCompleta))) {
    return NextResponse.json({ error: 'Consulta no disponible' }, { status: 400 })
  }

  const [pactoRow] = await db
    .select()
    .from(pactoInicial)
    .where(eq(pactoInicial.agonistId, agonista.id))
    .orderBy(asc(pactoInicial.acto))
    .limit(1)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { elSacrificio, elMomento, queHaCambiado, aceptoCambioMentor } = body as Record<
    string,
    unknown
  >

  if (
    typeof elSacrificio !== 'string' ||
    !elSacrificio.trim() ||
    typeof elMomento !== 'string' ||
    !elMomento.trim() ||
    typeof queHaCambiado !== 'string' ||
    !queHaCambiado
  ) {
    return NextResponse.json({ error: 'Campos incompletos' }, { status: 400 })
  }

  const opcion = OPCIONES_CAMBIO.find((o) => o.valor === queHaCambiado)
  if (!opcion) {
    return NextResponse.json({ error: 'Opción inválida' }, { status: 400 })
  }

  const mentorActual = agonista.mentorAsignado ?? 'quiron'
  const arquetipoActual = pactoRow?.arquetipo ?? null

  let mentorNuevo: string | null = null
  if (
    opcion.arquetipoResultante &&
    arquetipoActual &&
    opcion.arquetipoResultante !== arquetipoActual
  ) {
    mentorNuevo = getMentorParaArquetipo(
      opcion.arquetipoResultante,
      pactoRow?.puntoPartida ?? 'default'
    )
  }

  const acepta = Boolean(aceptoCambioMentor)
  const mentorFinal =
    mentorNuevo && acepta ? mentorNuevo : mentorActual

  const aplicarCambioArquetipo = Boolean(
    opcion.arquetipoResultante &&
      arquetipoActual &&
      opcion.arquetipoResultante !== arquetipoActual &&
      acepta
  )

  const consultaId = crypto.randomUUID()

  await db.transaction(async (tx) => {
    await tx.insert(consultaMediodia).values({
      id: consultaId,
      agonistId: agonista.id,
      elSacrificio: elSacrificio.trim(),
      elMomento: elMomento.trim(),
      queHaCambiado,
      mentorAnterior: mentorActual,
      mentorNuevo,
      aceptoCambioMentor: acepta,
    })

    await tx
      .update(agonistas)
      .set({
        consultaMediaCompleta: true,
        mentorAsignado: mentorFinal,
        updatedAt: new Date(),
      })
      .where(eq(agonistas.id, agonista.id))

    if (pactoRow && aplicarCambioArquetipo && opcion.arquetipoResultante) {
      await tx
        .update(pactoInicial)
        .set({
          arquetipo: opcion.arquetipoResultante as ArquetipoKey,
          mentorAsignado: mentorFinal,
        })
        .where(eq(pactoInicial.id, pactoRow.id))
    }
  })

  if (mentorNuevo && acepta && mentorNuevo !== mentorActual) {
    const mentorData = MENTORES[mentorNuevo as keyof typeof MENTORES]
    await crearNotificacion({
      agonistId: agonista.id,
      tipo: 'mentor',
      titulo: `${mentorData?.nombre ?? mentorNuevo} toma el relevo`,
      descripcion:
        'En el punto medio del Agon, un nuevo guía se presenta. Tu camino continúa.',
      metadata: { mentorAnterior: mentorActual, mentorNuevo },
    })
  }

  return NextResponse.json({
    ok: true,
    mentorCambio: Boolean(mentorNuevo && acepta && mentorNuevo !== mentorActual),
    mentorFinal,
  })
}
