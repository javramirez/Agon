import { db } from '@/lib/db'
import { postsDioses, agoraEventos, pactoInicial } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { detectarSeñal } from './detectar'
import { generarPostVozOlimpo, type ArquetipoVoz } from './generar'
import { getAmbosAgonistas } from '@/lib/db/queries'

const HORAS_NORMAL = 12
const HORAS_INTENSIVA = 8
const PROB_NORMAL = 0.3 // 30% → Math.random() > 0.3 sale
const PROB_INTENSIVA = 0.5 // 50% → Math.random() > 0.5 sale

// ─── Verificar si el reto está activo ────────────────────────────────────────

function retoActivo(): boolean {
  const startDate = process.env.NEXT_PUBLIC_AGON_START_DATE
  const endDate = process.env.NEXT_PUBLIC_AGON_END_DATE
  if (!startDate || !endDate) return false

  const hoy = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return hoy >= start && hoy <= end
}

// ─── Calcular semana actual del reto (1-indexed) ─────────────────────────────

function getSemanaReto(): number {
  const startDate = process.env.NEXT_PUBLIC_AGON_START_DATE
  if (!startDate) return 1

  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const diasTranscurridos = Math.floor(
    (hoy.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.floor(diasTranscurridos / 7) + 1
}

// ─── Parámetros según semana ──────────────────────────────────────────────────

function getParametrosSemana(): { horas: number; prob: number } {
  const semana = getSemanaReto()
  const esIntensiva = semana === 2 || semana === 4
  return {
    horas: esIntensiva ? HORAS_INTENSIVA : HORAS_NORMAL,
    prob: esIntensiva ? PROB_INTENSIVA : PROB_NORMAL,
  }
}

// ─── Verificar ventana temporal ───────────────────────────────────────────────

async function puedePublicar(horas: number): Promise<boolean> {
  const ventana = new Date(Date.now() - horas * 60 * 60 * 1000)

  const reciente = await db
    .select({ id: postsDioses.id })
    .from(postsDioses)
    .where(and(eq(postsDioses.tipo, 'voz_olimpo'), gte(postsDioses.createdAt, ventana)))
    .limit(1)

  return reciente.length === 0
}

// ─── Orquestador principal ───────────────────────────────────────────────────

export async function orquestarVozOlimpo(agonistId: string): Promise<void> {
  if (!retoActivo()) return

  const { horas, prob } = getParametrosSemana()

  if (Math.random() > prob) return

  const puede = await puedePublicar(horas)
  if (!puede) return

  const señal = await detectarSeñal(agonistId)
  if (!señal) return

  const pactoRows = await db
    .select({ arquetipo: pactoInicial.arquetipo })
    .from(pactoInicial)
    .where(eq(pactoInicial.agonistId, agonistId))
    .limit(1)
  const arquetipo = (pactoRows[0]?.arquetipo as ArquetipoVoz | undefined) ?? null

  const post = await generarPostVozOlimpo(señal, arquetipo)
  if (!post) return

  const puedeAun = await puedePublicar(horas)
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
        semanaReto: getSemanaReto(),
        arquetipo,
        linksValidados: post.linksValidados,
      },
    })
    .returning()

  if (!postInsertado) return

  const ambos = await getAmbosAgonistas()
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
      },
    })
  }
}
