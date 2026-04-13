import { db } from '@/lib/db'
import { postsDioses, agoraEventos } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { detectarSeñal } from './detectar'
import { generarPostVozOlimpo } from './generar'
import { getAmbosAgonistas } from '@/lib/db/queries'

const HORAS_ENTRE_POSTS = 12

async function horasDesdeUltimoPost(): Promise<number> {
  const ultimo = await db
    .select({ createdAt: postsDioses.createdAt })
    .from(postsDioses)
    .where(eq(postsDioses.tipo, 'voz_olimpo'))
    .orderBy(desc(postsDioses.createdAt))
    .limit(1)

  if (!ultimo[0]?.createdAt) return Number.POSITIVE_INFINITY

  const diff = Date.now() - new Date(ultimo[0].createdAt).getTime()
  return diff / (1000 * 60 * 60)
}

export async function orquestarVozOlimpo(agonistId: string): Promise<void> {
  const horas = await horasDesdeUltimoPost()
  if (horas < HORAS_ENTRE_POSTS) return

  if (Math.random() > 0.3) return

  const señal = await detectarSeñal(agonistId)
  if (!señal) return

  const post = await generarPostVozOlimpo(señal)
  if (!post) return

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
