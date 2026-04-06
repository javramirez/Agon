import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comentariosAgora, postsDioses } from '@/lib/db/schema'
import { eq, and, asc, count } from 'drizzle-orm'
import { getOrCreateAgonista } from '@/lib/db/queries'
import { responderOraculo } from '@/lib/dioses/generar-comentario'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const eventoId = searchParams.get('eventoId')
  const postDiosId = searchParams.get('postDiosId')
  const countOnly = searchParams.get('countOnly') === 'true'

  if (!eventoId) {
    return NextResponse.json({ error: 'Falta eventoId' }, { status: 400 })
  }

  if (countOnly) {
    const total = await db
      .select({ count: count() })
      .from(comentariosAgora)
      .where(
        and(
          eq(comentariosAgora.eventoId, eventoId),
          eq(comentariosAgora.procesado, true)
        )
      )

    return NextResponse.json({
      total: Number(total[0]?.count ?? 0),
    })
  }

  const comentarios = await db
    .select()
    .from(comentariosAgora)
    .where(
      and(
        eq(comentariosAgora.eventoId, eventoId),
        eq(comentariosAgora.procesado, true)
      )
    )
    .orderBy(asc(comentariosAgora.createdAt))

  let oraculoCerrado = false
  if (postDiosId) {
    const post = await db
      .select()
      .from(postsDioses)
      .where(eq(postsDioses.id, postDiosId))
      .limit(1)
    oraculoCerrado = post[0]?.cerrado ?? false
  }

  const agonista = await getOrCreateAgonista(userId)
  let yaPreguntoOraculo = false
  if (postDiosId) {
    const mios = await db
      .select()
      .from(comentariosAgora)
      .where(
        and(
          eq(comentariosAgora.eventoId, eventoId),
          eq(comentariosAgora.autorTipo, 'agonista'),
          eq(comentariosAgora.autorId, agonista.clerkId),
          eq(comentariosAgora.procesado, true)
        )
      )
    yaPreguntoOraculo = mios.length > 0
  }

  return NextResponse.json({
    comentarios,
    oraculoCerrado,
    yaPreguntoOraculo,
  })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)

  let body: {
    eventoId?: string
    contenido?: string
    esOraculo?: boolean
    diosNombre?: string
    postDiosId?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { eventoId, contenido, esOraculo, diosNombre, postDiosId } = body

  if (!eventoId || typeof contenido !== 'string') {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const texto = contenido.trim()
  if (texto.length === 0) {
    return NextResponse.json({ error: 'Comentario vacío' }, { status: 400 })
  }

  if (texto.length > 300) {
    return NextResponse.json(
      { error: 'Máximo 300 caracteres.' },
      { status: 400 }
    )
  }

  if (esOraculo && diosNombre && postDiosId) {
    const post = await db
      .select()
      .from(postsDioses)
      .where(eq(postsDioses.id, postDiosId))
      .limit(1)

    if (post.length === 0 || post[0].cerrado) {
      return NextResponse.json(
        { error: 'El Oráculo está cerrado.' },
        { status: 400 }
      )
    }

    const yaPregunta = await db
      .select()
      .from(comentariosAgora)
      .where(
        and(
          eq(comentariosAgora.eventoId, eventoId),
          eq(comentariosAgora.autorTipo, 'agonista'),
          eq(comentariosAgora.autorId, agonista.clerkId),
          eq(comentariosAgora.procesado, true)
        )
      )
      .limit(1)

    if (yaPregunta.length > 0) {
      return NextResponse.json(
        { error: 'Solo puedes hacer una pregunta al Oráculo.' },
        { status: 400 }
      )
    }

    const preguntaId = crypto.randomUUID()
    await db.insert(comentariosAgora).values({
      id: preguntaId,
      eventoId,
      autorTipo: 'agonista',
      autorId: agonista.clerkId,
      autorNombre: agonista.nombre,
      contenido: texto,
      procesado: true,
      procesarDespuesDe: null,
      tipoGeneracion: null,
      visto: true,
    })

    const respuesta = await responderOraculo(
      diosNombre,
      eventoId,
      postDiosId,
      texto,
      post[0].contenido
    )

    if (!respuesta) {
      await db.delete(comentariosAgora).where(eq(comentariosAgora.id, preguntaId))
      return NextResponse.json(
        { error: 'El Oráculo no pudo responder. Intenta de nuevo.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ ok: true, respuesta })
  }

  await db.insert(comentariosAgora).values({
    id: crypto.randomUUID(),
    eventoId,
    autorTipo: 'agonista',
    autorId: agonista.clerkId,
    autorNombre: agonista.nombre,
    contenido: texto,
    procesado: true,
    procesarDespuesDe: null,
    tipoGeneracion: null,
    visto: true,
  })

  return NextResponse.json({ ok: true })
}
