import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  pruebasDiarias,
  agonistas,
  kleosLog,
  llamas,
  agoraEventos,
  inscripciones,
  semanaSagrada,
} from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { getOrCreateAgonista, actualizarNivel } from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import {
  KLEOS_POR_PRUEBA,
  KLEOS_DIA_PERFECTO,
  KLEOS_DIA_PERFECTO_NIVEL_9,
  INSCRIPCIONES,
} from '@/lib/db/constants'
import { verificarInscripciones } from '@/lib/inscripciones/triggers'
import type { PruebaDiaria } from '@/lib/db/schema'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)
  const hoy = new Date().toISOString().split('T')[0]

  const semanaSagradaActiva = await db
    .select()
    .from(semanaSagrada)
    .where(eq(semanaSagrada.activa, true))
    .limit(1)

  const multiplicadorSagrado = semanaSagradaActiva.length > 0 ? 2 : 1

  const { campo, valor } = await req.json()

  const camposValidos = [
    'soloAgua',
    'sinComidaRapida',
    'pasos',
    'horasSueno',
    'paginasLeidas',
    'sesionesGym',
    'sesionesCardio',
  ] as const
  if (!camposValidos.includes(campo)) {
    return NextResponse.json({ error: 'Campo inválido' }, { status: 400 })
  }

  const existente = await db
    .select()
    .from(pruebasDiarias)
    .where(
      and(
        eq(pruebasDiarias.agonistId, agonista.id),
        eq(pruebasDiarias.fecha, hoy)
      )
    )
    .limit(1)

  let prueba = existente[0]

  if (!prueba) {
    const nueva = await db
      .insert(pruebasDiarias)
      .values({ id: crypto.randomUUID(), agonistId: agonista.id, fecha: hoy })
      .returning()
    prueba = nueva[0]
  }

  const kleosAnterior = prueba.kleosGanado
  const diaPerfectoAnterior = prueba.diaPerfecto

  await applyCampoUpdate(prueba.id, campo, valor)

  const actualizada = await db
    .select()
    .from(pruebasDiarias)
    .where(eq(pruebasDiarias.id, prueba.id))
    .limit(1)

  const p = actualizada[0]
  if (!p) {
    return NextResponse.json({ error: 'Registro no encontrado' }, { status: 500 })
  }

  const habitoId = campoToHabitoId(campo)
  if (habitoId && esCompletado(campo, valor)) {
    await actualizarLlama(agonista.id, habitoId, hoy)
  }

  let racha = 0
  if (habitoId) {
    const llamaActual = await db
      .select()
      .from(llamas)
      .where(
        and(eq(llamas.agonistId, agonista.id), eq(llamas.habitoId, habitoId))
      )
      .limit(1)
    racha = llamaActual[0]?.rachaActual ?? 0
  }

  const nivel = agonista.nivel
  const multiplicador =
    racha >= 7
      ? nivel === 'leyenda_del_agon' || nivel === 'inmortal'
        ? 1.6
        : 1.5
      : 1

  const kleos = calcularKleosTotal(p, multiplicador * multiplicadorSagrado)
  const bonusDiaPerfecto = esDiaPerfecto(p)
    ? nivel === 'leyenda_del_agon' || nivel === 'inmortal'
      ? KLEOS_DIA_PERFECTO_NIVEL_9
      : KLEOS_DIA_PERFECTO
    : 0
  const kleosTotalDia = kleos + bonusDiaPerfecto

  await db
    .update(pruebasDiarias)
    .set({
      kleosGanado: kleosTotalDia,
      diaPerfecto: esDiaPerfecto(p),
    })
    .where(eq(pruebasDiarias.id, prueba.id))

  const diferencia = kleosTotalDia - kleosAnterior

  if (diferencia !== 0) {
    await db
      .update(agonistas)
      .set({
        kleosTotal: agonista.kleosTotal + diferencia,
        updatedAt: new Date(),
      })
      .where(eq(agonistas.id, agonista.id))

    if (diferencia > 0) {
      await db.insert(kleosLog).values({
        id: crypto.randomUUID(),
        agonistId: agonista.id,
        cantidad: diferencia,
        motivo: campo,
        fecha: hoy,
      })
    }
  }

  if (esDiaPerfecto(p) && !diaPerfectoAnterior) {
    const yaPublicado = await db
      .select()
      .from(agoraEventos)
      .where(
        and(
          eq(agoraEventos.agonistId, agonista.id),
          eq(agoraEventos.tipo, 'dia_perfecto'),
          gte(agoraEventos.createdAt, new Date(`${hoy}T00:00:00`))
        )
      )
      .limit(1)

    if (yaPublicado.length === 0) {
      const eventoInsertado = await db
        .insert(agoraEventos)
        .values({
          id: crypto.randomUUID(),
          agonistId: agonista.id,
          tipo: 'dia_perfecto',
          contenido: `${agonista.nombre} completó todas las pruebas del agon de hoy. El agon es suyo.`,
          metadata: { fecha: hoy, kleos: kleosTotalDia },
        })
        .returning()

      if (eventoInsertado[0]) {
        void triggerComentariosDioses(eventoInsertado[0].id).catch((err) =>
          console.error('triggerComentariosDioses', err)
        )
      }
    }
  }

  const agonistaNuevo = await getOrCreateAgonista(userId)
  const pruebaFinalRows = await db
    .select()
    .from(pruebasDiarias)
    .where(eq(pruebasDiarias.id, prueba.id))
    .limit(1)
  const pruebaFinal = pruebaFinalRows[0]
  if (!pruebaFinal) {
    return NextResponse.json({ error: 'Registro no encontrado' }, { status: 500 })
  }

  const nuevasInscripciones = await verificarInscripciones(
    agonistaNuevo,
    pruebaFinal
  )

  for (const inscripcionId of nuevasInscripciones) {
    const config = INSCRIPCIONES.find((i) => i.id === inscripcionId)
    if (!config) continue

    const already = await db
      .select()
      .from(inscripciones)
      .where(
        and(
          eq(inscripciones.agonistId, agonistaNuevo.id),
          eq(inscripciones.inscripcionId, inscripcionId)
        )
      )
      .limit(1)
    if (already.length > 0) continue

    await db.insert(inscripciones).values({
      id: crypto.randomUUID(),
      agonistId: agonistaNuevo.id,
      inscripcionId,
      secreto: config.secreto,
    })

    const eventoInscripcionId = crypto.randomUUID()
    await db.insert(agoraEventos).values({
      id: eventoInscripcionId,
      agonistId: agonistaNuevo.id,
      tipo: 'inscripcion_desbloqueada',
      contenido: `${agonistaNuevo.nombre} desbloqueó: ${config.nombre}. ${config.descripcion}`,
      metadata: { inscripcionId },
    })

    void triggerComentariosDioses(eventoInscripcionId).catch((err) =>
      console.error('triggerComentariosDioses inscripcion_desbloqueada', err)
    )
  }

  const cambioNivel = await actualizarNivel(
    agonistaNuevo.id,
    agonistaNuevo.kleosTotal
  )

  return NextResponse.json({
    ok: true,
    kleos: kleosTotalDia,
    diaPerfecto: esDiaPerfecto(p),
    inscripcionDesbloqueada: nuevasInscripciones[0] ?? null,
    nivelSubido: cambioNivel,
  })
}

async function applyCampoUpdate(
  id: string,
  campo: string,
  valor: unknown
) {
  const v = valor as boolean | number
  const base = { updatedAt: new Date() }
  switch (campo) {
    case 'soloAgua':
      await db
        .update(pruebasDiarias)
        .set({ soloAgua: Boolean(v), ...base })
        .where(eq(pruebasDiarias.id, id))
      break
    case 'sinComidaRapida':
      await db
        .update(pruebasDiarias)
        .set({ sinComidaRapida: Boolean(v), ...base })
        .where(eq(pruebasDiarias.id, id))
      break
    case 'pasos':
      await db
        .update(pruebasDiarias)
        .set({ pasos: Number(v), ...base })
        .where(eq(pruebasDiarias.id, id))
      break
    case 'horasSueno':
      await db
        .update(pruebasDiarias)
        .set({ horasSueno: Number(v), ...base })
        .where(eq(pruebasDiarias.id, id))
      break
    case 'paginasLeidas':
      await db
        .update(pruebasDiarias)
        .set({ paginasLeidas: Number(v), ...base })
        .where(eq(pruebasDiarias.id, id))
      break
    case 'sesionesGym':
      await db
        .update(pruebasDiarias)
        .set({ sesionesGym: Number(v), ...base })
        .where(eq(pruebasDiarias.id, id))
      break
    case 'sesionesCardio':
      await db
        .update(pruebasDiarias)
        .set({ sesionesCardio: Number(v), ...base })
        .where(eq(pruebasDiarias.id, id))
      break
    default:
      break
  }
}

function campoToHabitoId(campo: string): string | null {
  const map: Record<string, string> = {
    soloAgua: 'agua',
    sinComidaRapida: 'comida',
    pasos: 'pasos',
    horasSueno: 'sueno',
    paginasLeidas: 'lectura',
    sesionesGym: 'gym',
    sesionesCardio: 'cardio',
  }
  return map[campo] ?? null
}

function esCompletado(campo: string, valor: unknown): boolean {
  const metas: Record<string, number | boolean> = {
    soloAgua: true,
    sinComidaRapida: true,
    pasos: 10000,
    horasSueno: 7,
    paginasLeidas: 10,
    sesionesGym: 4,
    sesionesCardio: 3,
  }
  const meta = metas[campo]
  if (typeof meta === 'boolean') return valor === true
  return typeof valor === 'number' && valor >= meta
}

function calcularKleosTotal(p: PruebaDiaria, mult: number): number {
  let total = 0
  const k = KLEOS_POR_PRUEBA

  if (p.soloAgua) total += Math.round(k.agua.base * mult)
  if (p.sinComidaRapida) total += Math.round(k.comida.base * mult)
  if (p.pasos >= 10000) total += Math.round(k.pasos.base * mult)
  if (p.horasSueno >= 7) total += Math.round(k.sueno.base * mult)
  if (p.paginasLeidas >= 10) total += Math.round(k.lectura.base * mult)
  if (p.sesionesGym >= 4) total += Math.round(k.gym.base * mult)
  if (p.sesionesCardio >= 3) total += Math.round(k.cardio.base * mult)

  return total
}

function esDiaPerfecto(p: PruebaDiaria): boolean {
  return (
    p.soloAgua &&
    p.sinComidaRapida &&
    p.pasos >= 10000 &&
    p.horasSueno >= 7 &&
    p.paginasLeidas >= 10 &&
    p.sesionesGym >= 4 &&
    p.sesionesCardio >= 3
  )
}

async function actualizarLlama(
  agonistId: string,
  habitoId: string,
  fecha: string
) {
  const existing = await db
    .select()
    .from(llamas)
    .where(and(eq(llamas.agonistId, agonistId), eq(llamas.habitoId, habitoId)))
    .limit(1)

  if (existing.length === 0) {
    await db.insert(llamas).values({
      id: crypto.randomUUID(),
      agonistId,
      habitoId,
      rachaActual: 1,
      rachMaxima: 1,
      ultimaFecha: fecha,
    })
    return
  }

  const llama = existing[0]
  if (llama.ultimaFecha === fecha) {
    return
  }

  const ayer = new Date()
  ayer.setDate(ayer.getDate() - 1)
  const ayerStr = ayer.toISOString().split('T')[0]

  const nuevaRacha =
    llama.ultimaFecha === ayerStr ? llama.rachaActual + 1 : 1

  await db
    .update(llamas)
    .set({
      rachaActual: nuevaRacha,
      rachMaxima: Math.max(nuevaRacha, llama.rachMaxima),
      ultimaFecha: fecha,
      updatedAt: new Date(),
    })
    .where(eq(llamas.id, llama.id))
}
