import { db } from '@/lib/db'
import { postsDioses, agoraEventos } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { detectarSeñal } from './detectar'
import { generarPostVozOlimpo } from './generar'
import { getAmbosAgonistas } from '@/lib/db/queries'

const HORAS_ENTRE_POSTS = 12

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

// ─── Verificar ventana temporal (sin post en las últimas 12 h) ───────────────

async function puedePublicar(): Promise<boolean> {
  const hace12h = new Date(Date.now() - HORAS_ENTRE_POSTS * 60 * 60 * 1000)

  const reciente = await db
    .select({ id: postsDioses.id })
    .from(postsDioses)
    .where(and(eq(postsDioses.tipo, 'voz_olimpo'), gte(postsDioses.createdAt, hace12h)))
    .limit(1)

  return reciente.length === 0
}

// ─── Orquestador principal ───────────────────────────────────────────────────

export async function orquestarVozOlimpo(agonistId: string): Promise<void> {
  if (!retoActivo()) return

  if (Math.random() > 0.3) return

  const puede = await puedePublicar()
  if (!puede) return

  const señal = await detectarSeñal(agonistId)
  if (!señal) return

  const post = await generarPostVozOlimpo(señal)
  if (!post) return

  const puedeAun = await puedePublicar()
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
