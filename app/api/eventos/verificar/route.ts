import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  comentariosAgora,
  agoraEventos,
  likesAgora,
  cronicas,
} from '@/lib/db/schema'
import { and, asc, eq, isNotNull, lte } from 'drizzle-orm'
import {
  verificarYActivarPruebas,
  activarEventoDestino,
} from '@/lib/pruebas-extraordinarias/calendario'
import {
  verificarYActivarSemanaSagrada,
  desactivarSemanaSagradaSiTermino,
} from '@/lib/pruebas-extraordinarias/semana-sagrada'
import { getDiaDelAgan, isGranAgonActivo } from '@/lib/utils'
import {
  calcularYGuardarHegemonia,
  getAgonistaByClerkId,
  getRetoPorId,
  getSemanaActual,
} from '@/lib/db/queries'
import { generarCronica } from '@/lib/cronica/generar'
import { procesarPruebasExpiradas } from '@/lib/pruebas-extraordinarias/expirar-pruebas'
import {
  generarTextoComentario,
  generarTextoRivalidad,
} from '@/lib/dioses/generar-comentario'
import { DIOSES } from '@/lib/dioses/config'

const MAX_COMENTARIOS_POR_REQUEST = 3

async function procesarComentariosPendientes(): Promise<number> {
  const ahora = new Date()

  const pendientes = await db
    .select()
    .from(comentariosAgora)
    .where(
      and(
        eq(comentariosAgora.procesado, false),
        eq(comentariosAgora.autorTipo, 'dios'),
        isNotNull(comentariosAgora.procesarDespuesDe),
        lte(comentariosAgora.procesarDespuesDe, ahora)
      )
    )
    .orderBy(asc(comentariosAgora.createdAt))
    .limit(MAX_COMENTARIOS_POR_REQUEST)

  let procesados = 0

  for (const pendiente of pendientes) {
    try {
      const evento = await db
        .select()
        .from(agoraEventos)
        .where(eq(agoraEventos.id, pendiente.eventoId))
        .limit(1)

      if (evento.length === 0) {
        await db
          .delete(comentariosAgora)
          .where(eq(comentariosAgora.id, pendiente.id))
        continue
      }

      const previos = await db
        .select()
        .from(comentariosAgora)
        .where(
          and(
            eq(comentariosAgora.eventoId, pendiente.eventoId),
            eq(comentariosAgora.procesado, true)
          )
        )

      const textosPrevios = previos.map(
        (c) => `${c.autorNombre}: ${c.contenido}`
      )

      const dios = DIOSES[pendiente.autorId]
      if (!dios) continue

      const tipoEvento =
        pendiente.tipoGeneracion ?? String(evento[0].tipo)

      let texto: string | null = null

      if (tipoEvento.startsWith('rivalidad_')) {
        let contextoRivalidad = pendiente.contenido
        try {
          const parsed = JSON.parse(pendiente.contenido) as { contexto?: string }
          contextoRivalidad = parsed.contexto ?? pendiente.contenido
        } catch {
          // usar contenido tal cual si no es JSON
        }
        texto = await generarTextoRivalidad(
          pendiente.autorId,
          tipoEvento,
          contextoRivalidad
        )
      } else {
        texto = await generarTextoComentario(
          pendiente.autorId,
          evento[0].contenido,
          textosPrevios,
          tipoEvento
        )
      }

      if (!texto) {
        await db
          .delete(comentariosAgora)
          .where(eq(comentariosAgora.id, pendiente.id))
        continue
      }

      await db
        .update(comentariosAgora)
        .set({
          contenido: texto,
          autorNombre: dios.nombre,
          procesado: true,
          procesarDespuesDe: null,
          tipoGeneracion: null,
          visto: false,
        })
        .where(eq(comentariosAgora.id, pendiente.id))

      await db
        .insert(likesAgora)
        .values({
          id: crypto.randomUUID(),
          eventoId: pendiente.eventoId,
          autorTipo: 'dios',
          autorId: pendiente.autorId,
        })
        .onConflictDoNothing({
          target: [likesAgora.eventoId, likesAgora.autorId],
        })

      procesados++
    } catch (err) {
      console.error(`Error procesando comentario ${pendiente.id}:`, err)
    }
  }

  return procesados
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let comentariosNuevosCount = 0
  try {
    comentariosNuevosCount = await procesarComentariosPendientes()
  } catch {
    /* no bloquear */
  }

  const comentariosNuevos = comentariosNuevosCount > 0

  const agonista = await getAgonistaByClerkId(userId)
  const reto =
    agonista?.retoId != null ? await getRetoPorId(agonista.retoId) : null
  const fi = reto?.fechaInicio
  const ff = reto?.fechaFin

  if (!fi || !ff || !isGranAgonActivo(fi, ff) || !reto?.id) {
    return NextResponse.json({
      tripticoActivado: false,
      destinoLatente: null,
      semanaSagradaActivada: false,
      comentariosNuevos,
    })
  }

  const diaActual = getDiaDelAgan(fi)
  const resultado = await verificarYActivarPruebas(diaActual, fi, reto.id)

  const semanaActual = getSemanaActual(fi)
  if (semanaActual > 1) {
    for (let s = 1; s < semanaActual; s++) {
      const cronicaExistente = await db
        .select({ id: cronicas.id })
        .from(cronicas)
        .where(and(eq(cronicas.semana, s), eq(cronicas.retoId, reto.id)))
        .limit(1)

      if (cronicaExistente.length === 0) {
        void generarCronica(reto.id, fi, s).catch((err) =>
          console.error(`generarCronica auto semana ${s}`, err)
        )
        break
      }
    }
  }

  const esInicioSemana = diaActual > 1 && (diaActual - 1) % 7 === 0
  if (esInicioSemana && reto.modo === 'duelo') {
    const semanaAnterior = getSemanaActual(fi) - 1
    if (semanaAnterior >= 1) {
      void calcularYGuardarHegemonia(semanaAnterior, reto.id, fi).catch((err) =>
        console.error('calcularYGuardarHegemonia auto', err)
      )
    }
  }

  const semanaSagradaActivada = await verificarYActivarSemanaSagrada(reto.id, fi)

  await desactivarSemanaSagradaSiTermino(reto.id)

  try {
    await procesarPruebasExpiradas(userId)
  } catch {
    /* silencioso */
  }

  return NextResponse.json({
    ...resultado,
    semanaSagradaActivada,
    comentariosNuevos,
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  const reto =
    agonista?.retoId != null ? await getRetoPorId(agonista.retoId) : null
  const fi = reto?.fechaInicio
  const ff = reto?.fechaFin

  if (!fi || !ff || !isGranAgonActivo(fi, ff) || !reto?.id) {
    return NextResponse.json({ activado: false })
  }

  const { pruebaId } = (await req.json()) as { pruebaId?: string }
  if (!pruebaId) {
    return NextResponse.json({ error: 'Falta pruebaId' }, { status: 400 })
  }

  const diaActual = getDiaDelAgan(fi)
  const activado = await activarEventoDestino(pruebaId, diaActual, fi, reto.id)

  return NextResponse.json({ activado })
}
