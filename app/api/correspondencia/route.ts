import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { correspondencia } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { getAgonistaByClerkId } from '@/lib/db/queries'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const mensajes = await db
    .select()
    .from(correspondencia)
    .orderBy(desc(correspondencia.createdAt))
    .limit(50)

  return NextResponse.json({ mensajes: mensajes.reverse() })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const contenido =
    body && typeof body === 'object' && 'contenido' in body
      ? (body as { contenido?: unknown }).contenido
      : undefined

  if (typeof contenido !== 'string' || contenido.trim().length === 0) {
    return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 })
  }

  if (contenido.trim().length > 500) {
    return NextResponse.json(
      { error: 'El mensaje no puede superar 500 caracteres.' },
      { status: 400 }
    )
  }

  const mensaje = await db
    .insert(correspondencia)
    .values({
      id: crypto.randomUUID(),
      remitenteId: agonista.id,
      contenido: contenido.trim(),
    })
    .returning()

  return NextResponse.json({ mensaje: mensaje[0] })
}

export async function PATCH(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const mensajeId =
    body && typeof body === 'object' && 'mensajeId' in body
      ? (body as { mensajeId?: unknown }).mensajeId
      : undefined

  if (typeof mensajeId !== 'string' || !mensajeId) {
    return NextResponse.json({ error: 'Falta mensajeId' }, { status: 400 })
  }

  const [msg] = await db
    .select()
    .from(correspondencia)
    .where(eq(correspondencia.id, mensajeId))
    .limit(1)

  if (!msg) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  if (msg.remitenteId === agonista.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  await db
    .update(correspondencia)
    .set({ leido: true })
    .where(eq(correspondencia.id, mensajeId))

  return NextResponse.json({ ok: true })
}
