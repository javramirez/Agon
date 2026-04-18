import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  pruebaExtraordinaria,
  agonistas,
  kleosLog,
  agoraEventos,
  semanaSagrada,
} from '@/lib/db/schema'
import { eq, and, gte, like } from 'drizzle-orm'
import { procesarPruebasExpiradas } from '@/lib/pruebas-extraordinarias/expirar-pruebas'
import {
  getAgonistaByClerkId,
  getSemanaActual,
  getRetoPorId,
} from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import { desbloquearInscripcion } from '@/lib/inscripciones/desbloquear'
import { TODAS_PRUEBAS_EXTRAORDINARIAS } from '@/lib/db/constants'

const MAX_TRIPTICO_SEMANA = 2
const MAX_DESTINO_SEMANA = 3

/** Completación por agonista vía kleos_log (motivo `prueba_extraordinaria_row` + id de fila). */
function motivoCompletacionFila(filaId: string) {
  return `prueba_extraordinaria_row:${filaId}`
}

async function completadaPorAgonista(
  agonistId: string,
  filaId: string
): Promise<boolean> {
  const r = await db
    .select({ id: kleosLog.id })
    .from(kleosLog)
    .where(
      and(
        eq(kleosLog.agonistId, agonistId),
        eq(kleosLog.motivo, motivoCompletacionFila(filaId))
      )
    )
    .limit(1)
  return r.length > 0
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista) {
    return NextResponse.json({
      triptico: {
        disponibles: [] as unknown[],
        completadasEstaSemana: 0,
        maxSemana: MAX_TRIPTICO_SEMANA,
      },
      destino: { disponibles: [] as unknown[] },
    })
  }

  if (!agonista.retoId) {
    return NextResponse.json({
      triptico: {
        disponibles: [] as unknown[],
        completadasEstaSemana: 0,
        maxSemana: MAX_TRIPTICO_SEMANA,
      },
      destino: { disponibles: [] as unknown[] },
    })
  }

  const ahora = new Date()
  const reto = await getRetoPorId(agonista.retoId)
  const fechaInicio =
    reto?.fechaInicio ?? new Date().toISOString().split('T')[0]!
  const semana = getSemanaActual(fechaInicio)

  const activas = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(
      and(
        eq(pruebaExtraordinaria.activa, true),
        gte(pruebaExtraordinaria.fechaExpira, ahora),
        eq(pruebaExtraordinaria.retoId, agonista.retoId)
      )
    )

  const conPorMi = await Promise.all(
    activas.map(async (p) => ({
      p,
      porMi: await completadaPorAgonista(agonista.id, p.id),
    }))
  )

  const tripticoCompletadasEstaSemana = conPorMi.filter(
    (x) =>
      x.p.tipo === 'triptico' &&
      x.p.semana === semana &&
      x.porMi
  ).length

  const tripticosDisponibles = conPorMi
    .filter(
      (x) =>
        x.p.tipo === 'triptico' &&
        x.p.semana === semana &&
        !x.porMi
    )
    .map((x) => x.p)

  const destinosDisponibles = conPorMi
    .filter((x) => x.p.tipo === 'destino' && !x.porMi)
    .map((x) => x.p)

  return NextResponse.json({
    triptico: {
      disponibles: tripticosDisponibles,
      completadasEstaSemana: tripticoCompletadasEstaSemana,
      maxSemana: MAX_TRIPTICO_SEMANA,
    },
    destino: {
      disponibles: destinosDisponibles,
    },
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }
  if (!agonista.retoId) {
    return NextResponse.json({ error: 'Sin reto asignado.' }, { status: 400 })
  }
  const { pruebaId: filaId } = (await req.json()) as { pruebaId: string }
  const hoy = new Date().toISOString().split('T')[0]
  const reto = await getRetoPorId(agonista.retoId)
  const fechaInicio =
    reto?.fechaInicio ?? new Date().toISOString().split('T')[0]!
  const semana = getSemanaActual(fechaInicio)

  if (!filaId) {
    return NextResponse.json({ error: 'Falta pruebaId.' }, { status: 400 })
  }

  const pruebaRows = await db
    .select()
    .from(pruebaExtraordinaria)
    .where(eq(pruebaExtraordinaria.id, filaId))
    .limit(1)

  if (pruebaRows.length === 0) {
    return NextResponse.json({ error: 'Prueba no encontrada.' }, { status: 404 })
  }

  const p = pruebaRows[0]

  if (p.retoId !== agonista.retoId) {
    return NextResponse.json({ error: 'Prueba no pertenece a tu reto.' }, { status: 403 })
  }

  if (new Date(p.fechaExpira) < new Date()) {
    return NextResponse.json({ error: 'Esta prueba ya expiró.' }, { status: 400 })
  }

  if (await completadaPorAgonista(agonista.id, p.id)) {
    return NextResponse.json({ error: 'Ya completaste esta prueba.' }, { status: 400 })
  }

  if (p.tipo === 'triptico') {
    const filasSemana = await db
      .select()
      .from(pruebaExtraordinaria)
      .where(
        and(
          eq(pruebaExtraordinaria.tipo, 'triptico'),
          eq(pruebaExtraordinaria.semana, semana),
          eq(pruebaExtraordinaria.retoId, agonista.retoId)
        )
      )

    let completadas = 0
    for (const row of filasSemana) {
      if (await completadaPorAgonista(agonista.id, row.id)) completadas += 1
    }

    if (completadas >= MAX_TRIPTICO_SEMANA) {
      return NextResponse.json(
        {
          error:
            'Ya completaste el máximo de 2 pruebas del Tríptico esta semana.',
        },
        { status: 400 }
      )
    }
  }

  if (p.tipo === 'destino') {
    const filasSemana = await db
      .select()
      .from(pruebaExtraordinaria)
      .where(
        and(
          eq(pruebaExtraordinaria.tipo, 'destino'),
          eq(pruebaExtraordinaria.semana, semana),
          eq(pruebaExtraordinaria.retoId, agonista.retoId)
        )
      )

    let completadas = 0
    for (const row of filasSemana) {
      if (await completadaPorAgonista(agonista.id, row.id)) completadas += 1
    }

    if (completadas >= MAX_DESTINO_SEMANA) {
      return NextResponse.json(
        {
          error:
            'Ya completaste el máximo de 3 Eventos del Destino esta semana.',
        },
        { status: 400 }
      )
    }
  }

  const sagradaActiva = await db
    .select()
    .from(semanaSagrada)
    .where(
      and(
        eq(semanaSagrada.activa, true),
        eq(semanaSagrada.retoId, agonista.retoId ?? '')
      )
    )
    .limit(1)

  const multiplicador = sagradaActiva.length > 0 ? 2 : 1
  const kleosFinales = p.kleosBonus * multiplicador

  await db
    .update(agonistas)
    .set({
      kleosTotal: agonista.kleosTotal + kleosFinales,
      updatedAt: new Date(),
    })
    .where(eq(agonistas.id, agonista.id))

  await db.insert(kleosLog).values({
    id: crypto.randomUUID(),
    agonistId: agonista.id,
    cantidad: kleosFinales,
    motivo: motivoCompletacionFila(filaId),
    fecha: hoy,
  })

  const tipoLabel = p.tipo === 'triptico' ? 'del Tríptico' : 'del Destino'
  const eventoId = crypto.randomUUID()
  await db.insert(agoraEventos).values({
    id: eventoId,
    agonistId: agonista.id,
    tipo: 'prueba_extraordinaria',
    contenido: `${agonista.nombre} completó la Prueba Extraordinaria ${tipoLabel}: "${p.descripcion}" +${kleosFinales} kleos${multiplicador === 2 ? ' (⚡ Semana Sagrada)' : ''}.`,
    metadata: { pruebaId: p.pruebaId, tipo: p.tipo, kleos: kleosFinales },
  })

  void triggerComentariosDioses(eventoId).catch((err) =>
    console.error('triggerComentariosDioses prueba_extraordinaria', err)
  )

  const todasMias = await db
    .select({ id: kleosLog.id })
    .from(kleosLog)
    .where(
      and(
        eq(kleosLog.agonistId, agonista.id),
        like(kleosLog.motivo, 'prueba_extraordinaria_row:%')
      )
    )
  const totalCompletadas = todasMias.length

  if (totalCompletadas === 1) {
    void desbloquearInscripcion(agonista.id, agonista.nombre, 'el_extraordinario')
  }
  if (totalCompletadas >= 10) {
    void desbloquearInscripcion(agonista.id, agonista.nombre, 'mas_alla_de_lo_ordinario')
  }

  const configPrueba = TODAS_PRUEBAS_EXTRAORDINARIAS.find((c) => c.id === p.pruebaId)
  if (p.tipo === 'destino' && configPrueba?.dificultad === 'dificil') {
    void desbloquearInscripcion(agonista.id, agonista.nombre, 'sin_tiempo_para_morir')
  }

  return NextResponse.json({ ok: true, kleos: kleosFinales, multiplicador })
}

export async function DELETE() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { expiradas } = await procesarPruebasExpiradas(userId)
  return NextResponse.json({ ok: true, expiradas })
}
