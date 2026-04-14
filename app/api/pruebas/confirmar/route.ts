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
} from '@/lib/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'
import {
  getOrCreateAgonista,
  getAgonistaByClerkId,
  actualizarNivel,
  getAmbosAgonistas,
} from '@/lib/db/queries'
import {
  crearNotificacion,
  notificarNivelSubido,
  notificarAntagonistaActivo,
} from '@/lib/notificaciones/crear'
import { AGONISTAS } from '@/lib/auth/agonistas'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import {
  KLEOS_POR_PRUEBA,
  KLEOS_DIA_PERFECTO,
  KLEOS_DIA_PERFECTO_NIVEL_9,
  NIVEL_LABELS,
} from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'
import { actualizarAfinidadHabitos } from '@/lib/facciones/afinidad'
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
import type { PruebaDiaria } from '@/lib/db/schema'

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

function contarPruebasCompletadas(p: PruebaDiaria): number {
  let count = 0
  if (p.soloAgua) count++
  if (p.sinComidaRapida) count++
  if (p.pasos >= 10000) count++
  if (p.horasSueno >= 7) count++
  if (p.paginasLeidas >= 10) count++
  if (p.sesionesGym >= 4) count++
  if (p.sesionesCardio >= 3) count++
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

  const agonista = await getOrCreateAgonista(userId)
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
  if (p.pasos >= 10000) habitosCompletados.push({ habitoId: 'pasos' })
  if (p.horasSueno >= 7) habitosCompletados.push({ habitoId: 'sueno' })
  if (p.paginasLeidas >= 10) habitosCompletados.push({ habitoId: 'lectura' })
  if (p.sesionesGym >= 4) habitosCompletados.push({ habitoId: 'gym' })
  if (p.sesionesCardio >= 3) habitosCompletados.push({ habitoId: 'cardio' })

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

  const bonusDiaPerfecto = esDiaPerfecto(p)
    ? nivel === 'leyenda_del_agon' || nivel === 'inmortal'
      ? KLEOS_DIA_PERFECTO_NIVEL_9
      : KLEOS_DIA_PERFECTO
    : 0
  const kleosTotalDia = calcularKleosTotal(p, multiplicador) + bonusDiaPerfecto

  await db
    .update(pruebasDiarias)
    .set({ kleosGanado: kleosTotalDia, diaPerfecto: esDiaPerfecto(p) })
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
    { diaPerfecto: esDiaPerfecto(p), rachaActual: rachaMax }
  ).catch(() => {})

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

  if (habitosCompletados.length > 0) {
    const antagonistaConfig = Object.values(AGONISTAS).find((a) => a.clerkId !== userId)
    if (antagonistaConfig) {
      const antagonista = await getAgonistaByClerkId(antagonistaConfig.clerkId)
      if (antagonista) {
        void notificarAntagonistaActivo(
          antagonista.id,
          agonista.nombre,
          contarPruebasCompletadas(p)
        ).catch(() => {})
      }
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

  const agonistaDef = await getOrCreateAgonista(userId)
  const pruebaDefRows = await db
    .select()
    .from(pruebasDiarias)
    .where(eq(pruebasDiarias.id, prueba.id))
    .limit(1)
  const pruebaDef = pruebaDefRows[0]

  return NextResponse.json({
    ok: true,
    kleos: kleosTotalDia,
    diaPerfecto: esDiaPerfecto(p),
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
