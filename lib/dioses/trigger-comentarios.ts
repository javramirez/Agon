import { db } from '@/lib/db'
import { agoraEventos, comentariosAgora } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getDiosesParaEvento } from './config'
import { generarComentarioDios } from './generar-comentario'

/**
 * Genera comentarios de dioses para un evento del Ágora.
 * Usado desde la API (con sesión) y desde rutas servidor sin cookies (p. ej. día perfecto).
 */
export async function triggerComentariosDioses(eventoId: string): Promise<{
  ok: boolean
  diosesNotificados: string[]
}> {
  const evento = await db
    .select()
    .from(agoraEventos)
    .where(eq(agoraEventos.id, eventoId))
    .limit(1)

  if (evento.length === 0) {
    return { ok: false, diosesNotificados: [] }
  }

  const e = evento[0]
  const dioses = getDiosesParaEvento(String(e.tipo))
  const diosesNotificados: string[] = []

  for (const diosNombre of dioses) {
    const previos = await db
      .select()
      .from(comentariosAgora)
      .where(eq(comentariosAgora.eventoId, eventoId))

    const textosPrevios = previos.map(
      (c) => `${c.autorNombre}: ${c.contenido}`
    )

    await generarComentarioDios(
      diosNombre,
      eventoId,
      e.contenido,
      textosPrevios
    )
    diosesNotificados.push(diosNombre)
  }

  return { ok: true, diosesNotificados }
}
