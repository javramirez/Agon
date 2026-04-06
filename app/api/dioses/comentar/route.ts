import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { triggerComentariosDioses } from '@/lib/dioses/trigger-comentarios'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const eventoId =
    body && typeof body === 'object' && 'eventoId' in body
      ? (body as { eventoId?: unknown }).eventoId
      : undefined

  const tipoOverride =
    body && typeof body === 'object' && 'tipoOverride' in body
      ? (body as { tipoOverride?: unknown }).tipoOverride
      : undefined

  if (typeof eventoId !== 'string' || !eventoId) {
    return NextResponse.json({ error: 'Falta eventoId' }, { status: 400 })
  }

  const override =
    typeof tipoOverride === 'string' && tipoOverride.length > 0
      ? tipoOverride
      : undefined

  const resultado = await triggerComentariosDioses(eventoId, override)

  if (!resultado.ok) {
    return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    diosesNotificados: resultado.diosesNotificados,
  })
}
