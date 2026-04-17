import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { count, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { agoraEventos, likesAgora } from '@/lib/db/schema'
import type { AgoraEvento } from '@/lib/db/schema'
import {
  getAgoraEventos,
  getAclamacionesHoy,
  getTiposAclamacionHoyPorEvento,
  getAgonistaByClerkId,
} from '@/lib/db/queries'
import { persistLikesAdeptosParaEvento } from '@/lib/agora/persist-likes-adeptos'

const TIPOS_AGORA_CREAR = [
  'prueba_completada',
  'dia_perfecto',
  'foto_subida',
  'nivel_subido',
  'inscripcion_desbloqueada',
  'hegemonia_ganada',
  'senalamiento',
  'provocacion',
  'cronica_semanal',
  'semana_sagrada',
  'prueba_extraordinaria',
] as const satisfies readonly AgoraEvento['tipo'][]

function esTipoAgoraValido(s: string): s is AgoraEvento['tipo'] {
  return (TIPOS_AGORA_CREAR as readonly string[]).includes(s)
}

export type AgoraEventoFeed = AgoraEvento & {
  likesReales: number
  totalLikes: number
}

async function likesRealesPorEventoIds(
  eventoIds: string[]
): Promise<Record<string, number>> {
  if (eventoIds.length === 0) return {}
  const rows = await db
    .select({
      eventoId: likesAgora.eventoId,
      n: count(),
    })
    .from(likesAgora)
    .where(inArray(likesAgora.eventoId, eventoIds))
    .groupBy(likesAgora.eventoId)

  const map: Record<string, number> = {}
  for (const r of rows) {
    map[r.eventoId] = Number(r.n)
  }
  return map
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }
  if (!agonista.retoId) {
    return NextResponse.json({ eventos: [], aclamacionesHoy: 0, tiposPorEvento: {} })
  }
  const [eventosRaw, aclamacionesHoy, tiposPorEvento] = await Promise.all([
    getAgoraEventos(agonista.retoId, 50),
    getAclamacionesHoy(agonista.id),
    getTiposAclamacionHoyPorEvento(agonista.id),
  ])

  const ids = eventosRaw.map((e) => e.id)
  const conteos = await likesRealesPorEventoIds(ids)

  const eventos: AgoraEventoFeed[] = eventosRaw.map((evento) => {
    const meta = evento.metadata as { likesAdeptos?: number } | null
    const likesAdeptos =
      meta != null && typeof meta.likesAdeptos === 'number'
        ? meta.likesAdeptos
        : 0
    const likesReales = conteos[evento.id] ?? 0
    return {
      ...evento,
      likesReales,
      totalLikes: likesReales + likesAdeptos,
    }
  })

  return NextResponse.json({ eventos, aclamacionesHoy, tiposPorEvento })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }
  if (!agonista.retoId) {
    return NextResponse.json({ error: 'Sin reto activo' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const contenido =
    body &&
    typeof body === 'object' &&
    body !== null &&
    'contenido' in body &&
    typeof (body as { contenido?: unknown }).contenido === 'string'
      ? (body as { contenido: string }).contenido.trim()
      : ''

  if (!contenido || contenido.length > 8000) {
    return NextResponse.json({ error: 'Contenido inválido' }, { status: 400 })
  }

  const tipoRaw =
    body &&
    typeof body === 'object' &&
    body !== null &&
    'tipo' in body &&
    typeof (body as { tipo?: unknown }).tipo === 'string'
      ? (body as { tipo: string }).tipo
      : 'provocacion'

  const tipo = esTipoAgoraValido(tipoRaw) ? tipoRaw : 'provocacion'

  const metadataExtra =
    body &&
    typeof body === 'object' &&
    body !== null &&
    'metadata' in body &&
    typeof (body as { metadata?: unknown }).metadata === 'object' &&
    (body as { metadata?: unknown }).metadata !== null
      ? ((body as { metadata: Record<string, unknown> }).metadata as Record<
          string,
          unknown
        >)
      : {}

  const eventoId = crypto.randomUUID()

  await db.insert(agoraEventos).values({
    id: eventoId,
    agonistId: agonista.id,
    tipo,
    contenido,
    metadata: { ...metadataExtra },
  })

  await persistLikesAdeptosParaEvento(eventoId)

  return NextResponse.json({ ok: true, id: eventoId })
}
