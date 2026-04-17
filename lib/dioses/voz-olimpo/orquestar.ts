import { db } from '@/lib/db'
import { postsDioses, agoraEventos, pactoInicial } from '@/lib/db/schema'
import { eq, and, gte, desc } from 'drizzle-orm'
import { detectarSeñal } from './detectar'
import { generarPostVozOlimpo, type ArquetipoVoz } from './generar'
import { getAmbosAgonistas, getRetoPorId } from '@/lib/db/queries'

const HORAS_NORMAL = 12
const HORAS_INTENSIVA = 8
const PROB_NORMAL = 0.3
const PROB_INTENSIVA = 0.5

function fechaRetoToString(
  fecha: string | Date | null | undefined
): string | null {
  if (fecha == null) return null
  if (typeof fecha === 'string') return fecha
  return fecha.toISOString().slice(0, 10)
}

// ─── Semana actual desde fechaInicio del reto ─────────────────────────────────

function getSemanaReto(fechaInicio: string): number {
  const start = new Date(`${fechaInicio}T12:00:00`)
  const hoy = new Date()
  const diasTranscurridos = Math.floor(
    (hoy.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.max(1, Math.floor(diasTranscurridos / 7) + 1)
}

function getParametrosSemana(semana: number): { horas: number; prob: number } {
  const esIntensiva = semana === 2 || semana === 4
  return {
    horas: esIntensiva ? HORAS_INTENSIVA : HORAS_NORMAL,
    prob: esIntensiva ? PROB_INTENSIVA : PROB_NORMAL,
  }
}

// ─── Verificar ventana temporal por reto ─────────────────────────────────────

async function puedePublicar(horas: number, retoId: string): Promise<boolean> {
  const ventana = new Date(Date.now() - horas * 60 * 60 * 1000)

  const recientes = await db
    .select({
      id: postsDioses.id,
      metadata: postsDioses.metadata,
    })
    .from(postsDioses)
    .where(
      and(eq(postsDioses.tipo, 'voz_olimpo'), gte(postsDioses.createdAt, ventana))
    )
    .orderBy(desc(postsDioses.createdAt))
    .limit(80)

  for (const row of recientes) {
    const meta = row.metadata as { retoId?: string } | null
    if (meta?.retoId === retoId) return false
  }

  return true
}

// ─── Orquestador principal ────────────────────────────────────────────────────

export async function orquestarVozOlimpo(
  agonistId: string,
  retoId?: string
): Promise<void> {
  if (!retoId) return

  const reto = await getRetoPorId(retoId)
  if (!reto || reto.estado !== 'activo') return

  const fechaInicioStr = fechaRetoToString(reto.fechaInicio)
  if (!fechaInicioStr) return

  const fechaFinStr = fechaRetoToString(reto.fechaFin)
  if (fechaFinStr) {
    const hoy = new Date().toISOString().split('T')[0]!
    if (hoy > fechaFinStr) return
  }

  const semana = getSemanaReto(fechaInicioStr)
  const { horas, prob } = getParametrosSemana(semana)

  if (Math.random() > prob) return

  const puede = await puedePublicar(horas, retoId)
  if (!puede) return

  const esSolo = reto.modo === 'solo'

  const señal = await detectarSeñal(agonistId, esSolo, fechaInicioStr)
  if (!señal) return

  const pactoRows = await db
    .select({ arquetipo: pactoInicial.arquetipo })
    .from(pactoInicial)
    .where(eq(pactoInicial.agonistId, agonistId))
    .limit(1)
  const arquetipo = (pactoRows[0]?.arquetipo as ArquetipoVoz | undefined) ?? null

  const post = await generarPostVozOlimpo(señal, arquetipo)
  if (!post) return

  const puedeAun = await puedePublicar(horas, retoId)
  if (!puedeAun) return

  const [postInsertado] = await db
    .insert(postsDioses)
    .values({
      id: crypto.randomUUID(),
      diosNombre: señal.dios,
      tipo: 'voz_olimpo',
      contenido: post.titular,
      cerrado: true,
      metadata: {
        titular: post.titular,
        descripcion: post.descripcion,
        links: post.links,
        tipoContenido: señal.tipoContenido,
        intensidad: señal.intensidad,
        esSobreexigencia: señal.esSobreexigencia,
        semanaReto: semana,
        arquetipo,
        linksValidados: post.linksValidados,
        retoId,
      },
    })
    .returning()

  if (!postInsertado) return

  const ambos = await getAmbosAgonistas(retoId)
  for (const agonista of ambos) {
    await db.insert(agoraEventos).values({
      id: crypto.randomUUID(),
      agonistId: agonista.id,
      tipo: 'prueba_completada',
      contenido: post.titular,
      metadata: {
        esDios: true,
        diosNombre: señal.dios,
        tipoDios: 'voz_olimpo',
        postDiosId: postInsertado.id,
        titular: post.titular,
        descripcion: post.descripcion,
        links: post.links,
        esSobreexigencia: señal.esSobreexigencia,
        intensidad: señal.intensidad,
        retoId,
      },
    })
  }
}
