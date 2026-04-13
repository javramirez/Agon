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
        kleosTotal: sql`kleos_total + ${diferencia}`,
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

      // Notificación de día perfecto — solo una por día (por título, no confunde con hegemonía)
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

  const llamaRachas = await db
    .select({ rachaActual: llamas.rachaActual })
    .from(llamas)
    .where(eq(llamas.agonistId, agonistaNuevo.id))
  const rachaMaxAgonista =
    llamaRachas.length > 0
      ? Math.max(...llamaRachas.map((l) => l.rachaActual))
      : 0

  // Sistema de afinidad de facciones
  void actualizarAfinidadHabitos(
    agonistaNuevo.id,
    {
      soloAgua: pruebaFinal.soloAgua,
      sinComidaRapida: pruebaFinal.sinComidaRapida,
      pasos: pruebaFinal.pasos,
      horasSueno: pruebaFinal.horasSueno,
      paginasLeidas: pruebaFinal.paginasLeidas,
      sesionesGym: pruebaFinal.sesionesGym,
      sesionesCardio: pruebaFinal.sesionesCardio,
    },
    existente.length > 0
      ? {
          sesionesGym: prueba.sesionesGym,
          sesionesCardio: prueba.sesionesCardio,
        }
      : null,
    {
      diaPerfecto: pruebaFinal.diaPerfecto,
      rachaActual: rachaMaxAgonista,
    }
  ).catch(() => {})

  const cambioNivel = await actualizarNivel(
    agonistaNuevo.id,
    agonistaNuevo.kleosTotal
  )

  if (cambioNivel) {
    const nk = cambioNivel.nivelNuevo as NivelKey
    void notificarNivelSubido(
      agonistaNuevo.id,
      cambioNivel.nivelNuevo,
      NIVEL_LABELS[nk] ?? cambioNivel.nivelNuevo
    ).catch(() => {})
    void verificarEspejoDelAgan(agonistaNuevo.id, cambioNivel.nivelNuevo).catch(() => {})
  }

  // Notificar al antagonista que completaste una prueba
  if (esCompletado(campo, valor)) {
    const antagonistaConfig = Object.values(AGONISTAS).find(
      (a) => a.clerkId !== userId
    )
    if (antagonistaConfig) {
      const antagonista = await getAgonistaByClerkId(antagonistaConfig.clerkId)
      if (antagonista) {
        const pruebasHoy = contarPruebasCompletadas(pruebaFinal)
        void notificarAntagonistaActivo(
          antagonista.id,
          agonista.nombre,
          pruebasHoy
        ).catch(() => {})
      }
    }
  }

  const agonistaDef = await getOrCreateAgonista(userId)
  const pruebaDefRows = await db
    .select()
    .from(pruebasDiarias)
    .where(eq(pruebasDiarias.id, prueba.id))
    .limit(1)
  const pruebaDef = pruebaDefRows[0]

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
