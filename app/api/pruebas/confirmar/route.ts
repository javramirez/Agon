import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  pruebasDiarias,
  agonistas,
  kleosLog,
  llamas,
  agoraEventos,
  semanaSagrada,
  notificaciones,
  faccionesAfinidad,
} from '@/lib/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'
import {
  getAgonistaByClerkId,
  getAntagonistaPorReto,
  actualizarNivel,
  getAmbosAgonistas,
} from '@/lib/db/queries'
import {
  crearNotificacion,
  notificarNivelSubido,
  notificarAntagonistaActivo,
} from '@/lib/notificaciones/crear'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import {
  KLEOS_POR_PRUEBA,
  KLEOS_DIA_PERFECTO,
  KLEOS_DIA_PERFECTO_NIVEL_9,
  NIVEL_LABELS,
} from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'
import {
  actualizarAfinidadHabitos,
  getVentajasFaseB,
  getVentajasActivas,
  getMetasEfectivas,
  type MetasEfectivas,
} from '@/lib/facciones/afinidad'
import { actualizarPuntosDisputaHabitos } from '@/lib/facciones/disputa'
import {
  verificarInscripciones,
  verificarGemelosDelAgan,
  verificarPiedraDelAgan,
  verificarEasterEggsDuales,
  verificarRemontada,
  verificarAtrapalosATodos,
  verificarEspejoDelAgan,
  verificarEspeciaDebeFluir,
} from '@/lib/inscripciones/triggers'
import { isUltimoDia } from '@/lib/utils'
import { ambosConfirmaronHoy, triggerSilencioDelOlimpo } from '@/lib/dioses/silencio-olimpo'
import type { PruebaDiaria } from '@/lib/db/schema'

function calcularKleosTotal(
  p: PruebaDiaria,
  mult: number,
  metas: MetasEfectivas
): number {
  let total = 0
  const k = KLEOS_POR_PRUEBA
  if (p.soloAgua) total += Math.round(k.agua.base * mult)
  if (p.sinComidaRapida) total += Math.round(k.comida.base * mult)
  if (p.pasos >= metas.pasos) total += Math.round(k.pasos.base * mult)
  if (p.horasSueno >= metas.horasSueno) total += Math.round(k.sueno.base * mult)
  if (p.paginasLeidas >= metas.paginasLeidas) total += Math.round(k.lectura.base * mult)
  if (p.sesionesGym >= metas.sesionesGym) total += Math.round(k.gym.base * mult)
  if (p.sesionesCardio >= metas.sesionesCardio) total += Math.round(k.cardio.base * mult)
  return total
}

function esDiaPerfecto(p: PruebaDiaria, metas: MetasEfectivas): boolean {
  return (
    p.soloAgua &&
    p.sinComidaRapida &&
    p.pasos >= metas.pasos &&
    p.horasSueno >= metas.horasSueno &&
    p.paginasLeidas >= metas.paginasLeidas &&
    p.sesionesGym >= metas.sesionesGym &&
    p.sesionesCardio >= metas.sesionesCardio
  )
}

function contarPruebasCompletadas(p: PruebaDiaria, metas: MetasEfectivas): number {
  let count = 0
  if (p.soloAgua) count++
  if (p.sinComidaRapida) count++
  if (p.pasos >= metas.pasos) count++
  if (p.horasSueno >= metas.horasSueno) count++
  if (p.paginasLeidas >= metas.paginasLeidas) count++
  if (p.sesionesGym >= metas.sesionesGym) count++
  if (p.sesionesCardio >= metas.sesionesCardio) count++
  return count
}

async function actualizarLlama(agonistId: string, habitoId: string, fecha: string) {
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
  if (llama.ultimaFecha === fecha) return

  const ayer = new Date()
  ayer.setDate(ayer.getDate() - 1)
  const ayerStr = ayer.toISOString().split('T')[0]
  const nuevaRacha = llama.ultimaFecha === ayerStr ? llama.rachaActual + 1 : 1

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

interface ConfirmarBody {
  soloAgua: boolean
  sinComidaRapida: boolean
  pasos: number
  horasSueno: number
  paginasLeidas: number
  sesionesGym: number
  sesionesCardio: number
}

function parseConfirmarBody(raw: unknown): ConfirmarBody | null {
  if (!raw || typeof raw !== 'object') return null
  const b = raw as Record<string, unknown>
  const nums = ['pasos', 'horasSueno', 'paginasLeidas', 'sesionesGym', 'sesionesCardio'] as const
  for (const k of nums) {
    const v = b[k]
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return null
  }
  if (typeof b.soloAgua !== 'boolean' || typeof b.sinComidaRapida !== 'boolean') return null
  return {
    soloAgua: b.soloAgua,
    sinComidaRapida: b.sinComidaRapida,
    pasos: b.pasos as number,
    horasSueno: b.horasSueno as number,
    paginasLeidas: b.paginasLeidas as number,
    sesionesGym: b.sesionesGym as number,
    sesionesCardio: b.sesionesCardio as number,
  }
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }
  const hoy = new Date().toISOString().split('T')[0]!

  let body: ConfirmarBody
  try {
    const raw = await req.json()
    const parsed = parseConfirmarBody(raw)
    if (!parsed) return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
    body = parsed
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const {
    soloAgua,
    sinComidaRapida,
    pasos,
    horasSueno,
    paginasLeidas,
    sesionesGym,
    sesionesCardio,
  } = body

  const [afinidadesAgonista, ventajasFaseB] = await Promise.all([
    db.select().from(faccionesAfinidad).where(eq(faccionesAfinidad.agonistId, agonista.id)),
    getVentajasFaseB(agonista.id),
  ])
  const ventajasActivas = getVentajasActivas(afinidadesAgonista)
  const metasEfectivas = getMetasEfectivas(ventajasActivas)

  const semanaSagradaActiva = await db
    .select()
    .from(semanaSagrada)
    .where(eq(semanaSagrada.activa, true))
    .limit(1)
  const multiplicadorSagrado = semanaSagradaActiva.length > 0 ? 2 : 1

  const existente = await db
    .select()
    .from(pruebasDiarias)
    .where(and(eq(pruebasDiarias.agonistId, agonista.id), eq(pruebasDiarias.fecha, hoy)))
    .limit(1)

  let prueba = existente[0]
  const esNueva = !prueba

  if (!prueba) {
    const nueva = await db
      .insert(pruebasDiarias)
      .values({ id: crypto.randomUUID(), agonistId: agonista.id, fecha: hoy })
      .returning()
    prueba = nueva[0]!
  }

  const kleosAnterior = prueba.kleosGanado
  const diaPerfectoAnterior = prueba.diaPerfecto
  const gymAnterior = prueba.sesionesGym
  const cardioAnterior = prueba.sesionesCardio

  await db
    .update(pruebasDiarias)
    .set({
      soloAgua,
      sinComidaRapida,
      pasos,
      horasSueno,
      paginasLeidas,
      sesionesGym,
      sesionesCardio,
      updatedAt: new Date(),
    })
    .where(eq(pruebasDiarias.id, prueba.id))

  const actualizada = await db
    .select()
    .from(pruebasDiarias)
    .where(eq(pruebasDiarias.id, prueba.id))
    .limit(1)
  const p = actualizada[0]
  if (!p) return NextResponse.json({ error: 'Registro no encontrado' }, { status: 500 })

  const habitosCompletados: Array<{ habitoId: string }> = []
  if (p.soloAgua) habitosCompletados.push({ habitoId: 'agua' })
  if (p.sinComidaRapida) habitosCompletados.push({ habitoId: 'comida' })
  if (p.pasos >= metasEfectivas.pasos) habitosCompletados.push({ habitoId: 'pasos' })
  if (p.horasSueno >= metasEfectivas.horasSueno) habitosCompletados.push({ habitoId: 'sueno' })
  if (p.paginasLeidas >= metasEfectivas.paginasLeidas)
    habitosCompletados.push({ habitoId: 'lectura' })
  if (p.sesionesGym >= metasEfectivas.sesionesGym) habitosCompletados.push({ habitoId: 'gym' })
  if (p.sesionesCardio >= metasEfectivas.sesionesCardio)
    habitosCompletados.push({ habitoId: 'cardio' })

  for (const { habitoId } of habitosCompletados) {
    await actualizarLlama(agonista.id, habitoId, hoy)
  }

  const llamasActualizadas = await db
    .select({ rachaActual: llamas.rachaActual })
    .from(llamas)
    .where(eq(llamas.agonistId, agonista.id))
  const rachaMax =
    llamasActualizadas.length > 0
      ? Math.max(...llamasActualizadas.map((l) => l.rachaActual))
      : 0

  const nivel = agonista.nivel
  const multiplicadorRacha =
    rachaMax >= 7
      ? nivel === 'leyenda_del_agon' || nivel === 'inmortal'
        ? 1.6
        : 1.5
      : 1
  const multiplicador = multiplicadorRacha * multiplicadorSagrado

  const bonusDiaPerfectoBase = esDiaPerfecto(p, metasEfectivas)
    ? nivel === 'leyenda_del_agon' || nivel === 'inmortal'
      ? KLEOS_DIA_PERFECTO_NIVEL_9
      : KLEOS_DIA_PERFECTO
    : 0

  const bonusDiaPerfecto =
    ventajasFaseB.nikeIndiscutido && bonusDiaPerfectoBase > 0
      ? Math.round(bonusDiaPerfectoBase * 1.2)
      : bonusDiaPerfectoBase

  const kleosTotalDia =
    calcularKleosTotal(p, multiplicador, metasEfectivas) + bonusDiaPerfecto

  await db
    .update(pruebasDiarias)
    .set({ kleosGanado: kleosTotalDia, diaPerfecto: esDiaPerfecto(p, metasEfectivas) })
    .where(eq(pruebasDiarias.id, prueba.id))

  const diferencia = kleosTotalDia - kleosAnterior
  if (diferencia !== 0) {
    await db
      .update(agonistas)
      .set({
        kleosTotal: sql`GREATEST(0, kleos_total + ${diferencia})`,
        updatedAt: new Date(),
      })
      .where(eq(agonistas.id, agonista.id))

    if (diferencia > 0) {
      await db.insert(kleosLog).values({
        id: crypto.randomUUID(),
        agonistId: agonista.id,
        cantidad: diferencia,
        motivo: 'confirmacion_dia',
        fecha: hoy,
      })
    }
  }

  if (esDiaPerfecto(p, metasEfectivas) && !diaPerfectoAnterior) {
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
        void triggerComentariosDioses(eventoInsertado[0].id).catch(() => {})
      }

      const yaNotificado = await db
        .select()
        .from(notificaciones)
        .where(
          and(
            eq(notificaciones.agonistId, agonista.id),
            eq(notificaciones.titulo, '¡Día Perfecto!'),
            gte(notificaciones.createdAt, new Date(`${hoy}T00:00:00`))
          )
        )
        .limit(1)

      if (yaNotificado.length === 0) {
        void crearNotificacion({
          agonistId: agonista.id,
          tipo: 'hegemonia_ganada',
          titulo: '¡Día Perfecto!',
          descripcion:
            'Completaste todas las pruebas del agon de hoy. El Altis lo inscribe.',
          metadata: { fecha: hoy },
        }).catch(() => {})
      }
    }
  }

  void actualizarAfinidadHabitos(
    agonista.id,
    {
      soloAgua: p.soloAgua,
      sinComidaRapida: p.sinComidaRapida,
      pasos: p.pasos,
      horasSueno: p.horasSueno,
      paginasLeidas: p.paginasLeidas,
      sesionesGym: p.sesionesGym,
      sesionesCardio: p.sesionesCardio,
    },
    esNueva ? null : { sesionesGym: gymAnterior, sesionesCardio: cardioAnterior },
    { diaPerfecto: esDiaPerfecto(p, metasEfectivas), rachaActual: rachaMax }
  ).catch(() => {})

  void actualizarPuntosDisputaHabitos(
    agonista.id,
    {
      soloAgua: p.soloAgua,
      sinComidaRapida: p.sinComidaRapida,
      pasos: p.pasos,
      horasSueno: p.horasSueno,
      paginasLeidas: p.paginasLeidas,
      sesionesGym: p.sesionesGym,
      sesionesCardio: p.sesionesCardio,
      diaPerfecto: esDiaPerfecto(p, metasEfectivas),
    },
    {
      soloAgua: prueba.soloAgua,
      sinComidaRapida: prueba.sinComidaRapida,
      pasos: prueba.pasos,
      horasSueno: prueba.horasSueno,
      paginasLeidas: prueba.paginasLeidas,
      sesionesGym: gymAnterior,
      sesionesCardio: cardioAnterior,
      diaPerfecto: diaPerfectoAnterior,
    }
  ).catch(() => {})

  const agonistaNuevo = await getAgonistaByClerkId(userId)
  if (!agonistaNuevo) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }
  const pruebaFinalRows = await db
    .select()
    .from(pruebasDiarias)
    .where(eq(pruebasDiarias.id, prueba.id))
    .limit(1)
  const pruebaFinal = pruebaFinalRows[0]
  if (!pruebaFinal) {
    return NextResponse.json({ error: 'Registro no encontrado' }, { status: 500 })
  }

  const nuevasInscripciones = await verificarInscripciones(agonistaNuevo, pruebaFinal)

  const cambioNivel = await actualizarNivel(agonistaNuevo.id, agonistaNuevo.kleosTotal)

  if (cambioNivel) {
    const nk = cambioNivel.nivelNuevo as NivelKey
    void notificarNivelSubido(
      agonistaNuevo.id,
      cambioNivel.nivelNuevo,
      NIVEL_LABELS[nk] ?? cambioNivel.nivelNuevo
    ).catch(() => {})
    void verificarEspejoDelAgan(agonistaNuevo.id, cambioNivel.nivelNuevo).catch(() => {})
  }

  if (habitosCompletados.length > 0 && agonistaNuevo.retoId) {
    const antagonista = await getAntagonistaPorReto(
      agonistaNuevo.retoId,
      agonistaNuevo.id
    )
    if (antagonista) {
      void notificarAntagonistaActivo(
        antagonista.id,
        agonista.nombre,
        contarPruebasCompletadas(p, metasEfectivas)
      ).catch(() => {})
    }
  }

  void getAmbosAgonistas()
    .then((ambos) => {
      const antagonistaOtro = ambos.find((a) => a.id !== agonistaNuevo.id)
      return Promise.all([
        verificarGemelosDelAgan(hoy),
        verificarPiedraDelAgan(hoy),
        verificarEasterEggsDuales(agonistaNuevo.id, hoy),
        verificarRemontada(
          agonistaNuevo.id,
          agonistaNuevo.nombre,
          agonistaNuevo.kleosTotal,
          antagonistaOtro?.kleosTotal ?? 0
        ),
        verificarAtrapalosATodos(agonistaNuevo.id, agonistaNuevo.nombre),
        verificarEspeciaDebeFluir(
          agonistaNuevo.id,
          cambioNivel?.nivelNuevo ?? '',
          agonistaNuevo.nombre
        ),
      ])
    })
    .catch(() => {})

  const agonistaDef = await getAgonistaByClerkId(userId)
  if (!agonistaDef) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }
  const pruebaDefRows = await db
    .select()
    .from(pruebasDiarias)
    .where(eq(pruebasDiarias.id, prueba.id))
    .limit(1)
  const pruebaDef = pruebaDefRows[0]

  // Silencio del Olimpo: trigger automático el día 29
  if (isUltimoDia()) {
    const ambosConfirmaron = await ambosConfirmaronHoy(hoy)
    if (ambosConfirmaron) {
      void triggerSilencioDelOlimpo().catch(() => {})
    }
  }

  return NextResponse.json({
    ok: true,
    kleos: kleosTotalDia,
    diaPerfecto: esDiaPerfecto(p, metasEfectivas),
    inscripcionesDesbloqueadas: nuevasInscripciones,
    inscripcionDesbloqueada: nuevasInscripciones[0] ?? null,
    nivelSubido: cambioNivel,
    estadoReal: pruebaDef
      ? {
          soloAgua: pruebaDef.soloAgua,
          sinComidaRapida: pruebaDef.sinComidaRapida,
          pasos: pruebaDef.pasos,
          horasSueno: pruebaDef.horasSueno,
          paginasLeidas: pruebaDef.paginasLeidas,
          sesionesGym: pruebaDef.sesionesGym,
          sesionesCardio: pruebaDef.sesionesCardio,
          kleosGanado: pruebaDef.kleosGanado,
          diaPerfecto: pruebaDef.diaPerfecto,
        }
      : null,
    kleosTotal: agonistaDef.kleosTotal,
  })
}
