import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getCurrentAgonista } from '@/lib/auth'
import { getMentor } from '@/lib/mentor/config'
import { db } from '@/lib/db'
import { agonistas, agoraEventos } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import Anthropic from '@anthropic-ai/sdk'

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  return new Anthropic({ apiKey: key })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getCurrentAgonista()
  if (!agonista) return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })

  const mentorKey = agonista.mentorAsignado ?? 'quiron'
  const mentor = getMentor(mentorKey) ?? getMentor('quiron')
  if (!mentor) return NextResponse.json({ error: 'Mentor no encontrado' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const eventoId = b.eventoId as string
  const tipoEvento = b.tipoEvento as string
  const contenidoEvento = b.contenidoEvento as string
  const fechaEvento = b.fechaEvento as string

  if (!tipoEvento || !contenidoEvento || !eventoId) {
    return NextResponse.json({ error: 'Faltan datos del evento.' }, { status: 400 })
  }

  const eventoRows = await db
    .select()
    .from(agoraEventos)
    .where(
      and(eq(agoraEventos.id, eventoId), eq(agoraEventos.agonistId, agonista.id))
    )
    .limit(1)

  const evento = eventoRows[0]
  if (!evento) {
    return NextResponse.json({ error: 'Evento no encontrado.' }, { status: 404 })
  }

  if (evento.narracion && evento.narracionMentor) {
    return NextResponse.json({
      narracion: evento.narracion,
      mentorNombre: evento.narracionMentor,
    })
  }

  const anthropic = getAnthropicClient()
  if (!anthropic) return NextResponse.json({ error: 'API no disponible.' }, { status: 503 })

  const ambos = await db.select().from(agonistas).limit(2)
  const rival = ambos.find((a) => a.id !== agonista.id)

  const prompt = `${mentor.personalidad}

Estás narrando un momento específico de la bitácora del agonista ${agonista.nombre}.

Evento: ${tipoEvento}
Fecha: ${fechaEvento}
Descripción: ${contenidoEvento}
Kleos actual del agonista: ${agonista.kleosTotal}
${rival ? `Kleos del antagonista (${rival.nombre}): ${rival.kleosTotal}` : ''}

Escribe una narración de 2-3 oraciones sobre qué estaba ocurriendo en ese momento del Gran Agon.
Habla en segunda persona, dirigiéndote al agonista directamente.
Usa tu voz característica como ${mentor.nombre}.
No uses hashtags ni emojis. Evoca el momento con precisión.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })

    const narracion = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { text: string }).text)
      .join('')
      .trim()

    await db
      .update(agoraEventos)
      .set({
        narracion,
        narracionMentor: mentor.nombre,
      })
      .where(
        and(eq(agoraEventos.id, eventoId), eq(agoraEventos.agonistId, agonista.id))
      )

    return NextResponse.json({ narracion, mentorNombre: mentor.nombre })
  } catch (error) {
    console.error('Error generando narración:', error)
    return NextResponse.json({ error: 'Error al generar narración.' }, { status: 500 })
  }
}
