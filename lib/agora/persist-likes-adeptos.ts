import { db } from '@/lib/db'
import {
  agoraEventos,
  agonistas,
  faccionesAfinidad,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { FaccionId } from '@/lib/facciones/config'
import {
  calcularLikesAdeptos,
  calcularLikesAdeptosDuelo,
  type TipoPostAgora,
} from '@/lib/facciones/adeptos'
import type { AgoraEvento } from '@/lib/db/schema'
import { getAntagonistaPorReto } from '@/lib/db/queries'
import { esSolo } from '@/lib/retos/guards'

/** Mapea tipos del Ágora al dominio de cálculo de adeptos */
export function mapTipoAgoraATipoPostAdeptos(
  tipo: AgoraEvento['tipo']
): TipoPostAgora {
  switch (tipo) {
    case 'semana_sagrada':
      return 'semana_sagrada'
    case 'dia_perfecto':
      return 'dia_perfecto'
    case 'hegemonia_ganada':
      return 'hegemonia_ganada'
    case 'nivel_subido':
      return 'nivel_subido'
    case 'prueba_extraordinaria':
      return 'prueba_extraordinaria'
    case 'prueba_completada':
      return 'prueba_completada'
    case 'inscripcion_desbloqueada':
      return 'inscripcion_epica'
    default:
      return 'prueba_completada'
  }
}

async function cargarPuntosFaccion(agonistId: string) {
  const rows = await db
    .select()
    .from(faccionesAfinidad)
    .where(eq(faccionesAfinidad.agonistId, agonistId))
  return rows.map((r) => ({
    faccionId: r.faccionId as FaccionId,
    puntos: r.puntosAfinidad,
  }))
}

/**
 * Calcula likesAdeptos una sola vez y los guarda en metadata.
 * Si ya existe metadata.likesAdeptos (número), no recalcula.
 */
export async function persistLikesAdeptosParaEvento(eventoId: string): Promise<void> {
  const rows = await db
    .select()
    .from(agoraEventos)
    .where(eq(agoraEventos.id, eventoId))
    .limit(1)
  const ev = rows[0]
  if (!ev) return

  const meta = ev.metadata as Record<string, unknown> | null
  if (meta != null && typeof meta.likesAdeptos === 'number') return

  const agonistId = ev.agonistId
  const tipoPost = mapTipoAgoraATipoPostAdeptos(ev.tipo)

  const [puntosAutor, agonRow] = await Promise.all([
    cargarPuntosFaccion(agonistId),
    db
      .select({ retoId: agonistas.retoId })
      .from(agonistas)
      .where(eq(agonistas.id, agonistId))
      .limit(1),
  ])

  const retoId = agonRow[0]?.retoId ?? null

  let likesAdeptos: number

  if (await esSolo(retoId)) {
    likesAdeptos = calcularLikesAdeptos(puntosAutor, tipoPost, true)
  } else if (retoId) {
    const antagonista = await getAntagonistaPorReto(retoId, agonistId)
    if (antagonista) {
      const puntosRival = await cargarPuntosFaccion(antagonista.id)
      likesAdeptos = calcularLikesAdeptosDuelo(
        puntosAutor,
        puntosRival,
        tipoPost
      )
    } else {
      likesAdeptos = calcularLikesAdeptos(puntosAutor, tipoPost, false)
    }
  } else {
    likesAdeptos = calcularLikesAdeptos(puntosAutor, tipoPost, false)
  }

  const merged: Record<string, unknown> =
    meta != null && typeof meta === 'object' ? { ...meta } : {}

  merged.likesAdeptos = likesAdeptos

  await db
    .update(agoraEventos)
    .set({ metadata: merged })
    .where(eq(agoraEventos.id, eventoId))
}
