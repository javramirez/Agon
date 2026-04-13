import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { agoraEventos } from '@/lib/db/schema'
import { getOrCreateAgonista, getAgonistaByClerkId } from '@/lib/db/queries'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'
import { notificarProvocacion } from '@/lib/notificaciones/crear'
import { PROVOCACIONES } from '@/lib/db/constants'
import { AGONISTAS } from '@/lib/auth/agonistas'

const BANCO = new Set<string>(PROVOCACIONES as readonly string[])

const NIVELES_PROVOCAR = [
  'agonista',
  'luchador',
  'campeon',
  'heroe',
  'semidios',
  'olimpico',
  'leyenda_del_agon',
  'inmortal',
] as const

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)

  if (!NIVELES_PROVOCAR.includes(agonista.nivel as (typeof NIVELES_PROVOCAR)[number])) {
    return NextResponse.json(
      { error: 'Debes alcanzar el nivel Agonista para provocar.' },
      { status: 403 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const mensaje =
    body && typeof body === 'object' && 'mensaje' in body
      ? (body as { mensaje?: unknown }).mensaje
      : undefined

  if (typeof mensaje !== 'string') {
    return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
  }

  const trimmed = mensaje.trim()
  const esDelBanco = BANCO.has(trimmed)
  const esMensajeCustom =
    trimmed.length > 0 && trimmed.length <= 200 && !esDelBanco

  if (!esDelBanco && !esMensajeCustom) {
    return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 })
  }

  const antagonistaConfig = Object.values(AGONISTAS).find(
    (a) => a.clerkId !== agonista.clerkId
  )
  const antagonista = antagonistaConfig
    ? await getAgonistaByClerkId(antagonistaConfig.clerkId)
    : null

  const contenido = `${agonista.nombre} envió La Voz del Agon a ${antagonista?.nombre ?? 'el antagonista'}: "${trimmed}"`

  const eventoId = crypto.randomUUID()
  await db.insert(agoraEventos).values({
    id: eventoId,
    agonistId: agonista.id,
    tipo: 'provocacion',
    contenido,
    metadata: {
      mensaje: trimmed,
      dirigidoA: antagonista?.id ?? null,
    },
  })

  void triggerComentariosDioses(eventoId).catch((err) =>
    console.error('triggerComentariosDioses provocacion', err)
  )

  if (antagonista) {
    void notificarProvocacion(
      antagonista.id,
      agonista.nombre,
      trimmed
    ).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
