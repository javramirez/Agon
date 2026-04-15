import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getCurrentAgonista } from '@/lib/auth'
import { getMentor } from '@/lib/mentor/config'
import { db } from '@/lib/db'
import { agonistas, agoraEventos, llamas } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
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

  const [ambos, llamasRows] = await Promise.all([
    db.select().from(agonistas).limit(2),
    db
      .select({ rachaActual: llamas.rachaActual, habitoId: llamas.habitoId })
      .from(llamas)
      .where(eq(llamas.agonistId, agonista.id))
      .orderBy(desc(llamas.rachaActual)),
  ])

  const rival = ambos.find((a) => a.id !== agonista.id)
  const rachaMaxActual = llamasRows[0]?.rachaActual ?? 0
  const habitoRachaMaxima = llamasRows[0]?.habitoId ?? null
  const diferenciaKleos = rival ? agonista.kleosTotal - rival.kleosTotal : 0
  const posicion = diferenciaKleos >= 0 ? 'liderando' : 'por debajo'

  const meta = (evento.metadata ?? {}) as Record<string, unknown>

  const kleosHistorico: number | null =
    (meta.kleos as number | undefined) ??
    (meta.kleosAlSubir as number | undefined) ??
    (meta.kleosAlDesbloquear as number | undefined) ??
    (meta.kleosPropio as number | undefined) ??
    null

  const tipoEventoDb = evento.tipo
  const contextoHistorico = (() => {
    switch (tipoEventoDb) {
      case 'dia_perfecto':
        return `Kleos ganado ese día: ${meta.kleos ?? '—'}`
      case 'nivel_subido':
        return `Subió de ${meta.nivelAnterior ?? '—'} a ${meta.nivelNuevo ?? '—'} con ${meta.kleosAlSubir ?? '—'} kleos acumulados. Días perfectos al subir: ${meta.diasPerfectosAlSubir ?? '—'}.`
      case 'inscripcion_desbloqueada':
        return `Kleos acumulados al desbloquear: ${meta.kleosAlDesbloquear ?? '—'}.`
      case 'hegemonia_ganada':
        return `Semana ${meta.semana ?? '—'}. Kleos del ganador esa semana: ${meta.kleos ?? '—'}.`
      case 'prueba_extraordinaria':
        return `Tipo: ${meta.tipo ?? '—'}. Kleos bonus obtenido: ${meta.kleos ?? '—'}. Semana ${meta.semana ?? '—'}.`
      case 'cronica_semanal':
        return `Semana ${meta.semana ?? '—'} (${meta.fechaInicio ?? ''} → ${meta.fechaFin ?? ''}). Kleos propio: ${meta.kleosPropio ?? '—'}. Kleos del rival: ${meta.kleosRival ?? '—'}.`
      default:
        return null
    }
  })()

  const prompt = `${mentor.personalidad}

Estás narrando un momento específico de la bitácora del agonista ${agonista.nombre}.

EVENTO:
Tipo: ${tipoEvento}
Fecha: ${fechaEvento}
Descripción: ${contenidoEvento}

DATOS EXACTOS DE ESE MOMENTO:
${contextoHistorico ?? `Kleos acumulado aproximado: ${kleosHistorico ?? agonista.kleosTotal}`}

CONTEXTO ACTUAL DEL AGONISTA (para dar perspectiva):
- Nivel actual: ${agonista.nivel}
- Racha más alta activa: ${rachaMaxActual} días${habitoRachaMaxima ? ` (${habitoRachaMaxima})` : ''}
${rival ? `- Hoy frente a ${rival.nombre}: ${posicion} por ${Math.abs(diferenciaKleos)} kleos` : ''}

INSTRUCCIONES:
Escribe una narración de 2-3 oraciones sobre qué estaba ocurriendo en ese momento del Gran Agon.
Prioriza los DATOS EXACTOS DE ESE MOMENTO — no los actuales.
Debes mencionar al menos un dato concreto: kleos, nivel, racha o resultado específico.
Habla en segunda persona, dirigiéndote al agonista directamente.
Usa tu voz característica como ${mentor.nombre}.
Máximo 350 caracteres incluyendo espacios.
No uses hashtags ni emojis. Evoca el momento con precisión y epicidad.`

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
