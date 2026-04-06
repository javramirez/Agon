import { db } from '@/lib/db'
import {
  agoraEventos,
  comentariosAgora,
  comentariosPendientes,
} from '@/lib/db/schema'
import { and, asc, eq, lte } from 'drizzle-orm'
import { generarComentarioDios } from './generar-comentario'

const MAX_POR_REQUEST = 3

/**
 * Ejecuta comentarios de dioses cuyo delay ya pasó (p. ej. al abrir Ágora / dashboard).
 */
export async function procesarComentariosPendientes(): Promise<void> {
  const ahora = new Date()

  const pendientes = await db
    .select()
    .from(comentariosPendientes)
    .where(
      and(
        eq(comentariosPendientes.procesado, false),
        lte(comentariosPendientes.procesarDespuesDe, ahora)
      )
    )
    .orderBy(asc(comentariosPendientes.procesarDespuesDe))
    .limit(MAX_POR_REQUEST)

  for (const pendiente of pendientes) {
    try {
      const evento = await db
        .select()
        .from(agoraEventos)
        .where(eq(agoraEventos.id, pendiente.eventoId))
        .limit(1)

      if (evento.length === 0) {
        await db
          .update(comentariosPendientes)
          .set({ procesado: true })
          .where(eq(comentariosPendientes.id, pendiente.id))
        continue
      }

      const previos = await db
        .select()
        .from(comentariosAgora)
        .where(eq(comentariosAgora.eventoId, pendiente.eventoId))

      const textosPrevios = previos.map(
        (c) => `${c.autorNombre}: ${c.contenido}`
      )

      await generarComentarioDios(
        pendiente.diosNombre,
        pendiente.eventoId,
        evento[0].contenido,
        textosPrevios,
        pendiente.tipoEvento
      )

      await db
        .update(comentariosPendientes)
        .set({ procesado: true })
        .where(eq(comentariosPendientes.id, pendiente.id))
    } catch (err) {
      console.error('Error procesando comentario pendiente:', err)
    }
  }
}
