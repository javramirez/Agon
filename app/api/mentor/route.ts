import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  mentorConversaciones,
  pruebasDiarias,
  llamas,
  consultaMediodia,
} from '@/lib/db/schema'
import { eq, asc, and } from 'drizzle-orm'
import { getCurrentAgonista, AGONISTAS } from '@/lib/auth'
import { getAgonistaByClerkId } from '@/lib/db/queries'
import { getMentor } from '@/lib/mentor/config'
import { crearNotificacion } from '@/lib/notificaciones/crear'
import Anthropic from '@anthropic-ai/sdk'

const MAX_HISTORIAL = 20 // máximo que se guarda en DB
const UMBRAL_COMPRESION = 16 // a partir de aquí se comprime
const MENSAJES_RECIENTES = 6 // cuántos mensajes recientes se pasan completos
const MENSAJES_A_COMPRIMIR = 10 // cuántos se comprimen en resumen

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  return new Anthropic({ apiKey: key })
}

async function comprimirHistorial(
  historial: { rol: string; contenido: string }[],
  mentorNombre: string,
  anthropic: Anthropic
): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
  if (historial.length < UMBRAL_COMPRESION) {
    // Sin compresión: pasar todo completo
    return historial.map((m) => ({
      role: m.rol === 'user' ? 'user' : 'assistant',
      content: m.contenido,
    }))
  }

  // Separar: primeros 10 a comprimir, últimos 6 completos
  const aComprimir = historial.slice(0, MENSAJES_A_COMPRIMIR)
  const recientes = historial.slice(-MENSAJES_RECIENTES)

  // Generar resumen de los primeros 10
  const transcripcion = aComprimir
    .map((m) => `${m.rol === 'user' ? 'Agonista' : mentorNombre}: ${m.contenido}`)
    .join('\n')

  const resumenResponse = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `Resume en máximo 5 oraciones los temas clave, preocupaciones y compromisos del agonista en esta conversación con su Mentor. Solo hechos relevantes, sin formato, sin listas.

Conversación:
${transcripcion}`,
      },
    ],
  })

  const resumen = resumenResponse.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('')
    .trim()

  // Construir historial comprimido: resumen como contexto + recientes completos
  const historialComprimido: { role: 'user' | 'assistant'; content: string }[] = [
    {
      role: 'user',
      content: `[Contexto de conversación anterior] ${resumen}`,
    },
    {
      role: 'assistant',
      content: 'Entendido. Continúo con ese contexto en mente.',
    },
    ...recientes.map((m) => ({
      role: m.rol === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.contenido,
    })),
  ]

  return historialComprimido
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getCurrentAgonista()
  if (!agonista) return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })

  const historial = await db
    .select()
    .from(mentorConversaciones)
    .where(eq(mentorConversaciones.agonistId, agonista.id))
    .orderBy(asc(mentorConversaciones.createdAt))
    .limit(MAX_HISTORIAL)

  return NextResponse.json({ historial, mentorAsignado: agonista.mentorAsignado })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getCurrentAgonista()
  if (!agonista) return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })

  if (!agonista.mentorAsignado) {
    return NextResponse.json({ error: 'No tienes un Mentor asignado aún.' }, { status: 400 })
  }

  const mentor = getMentor(agonista.mentorAsignado)
  if (!mentor) return NextResponse.json({ error: 'Mentor no encontrado.' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const mensaje = (body as Record<string, unknown>).mensaje
  if (typeof mensaje !== 'string' || mensaje.trim().length === 0) {
    return NextResponse.json({ error: 'Mensaje vacío.' }, { status: 400 })
  }

  const anthropic = getAnthropicClient()
  if (!anthropic) return NextResponse.json({ error: 'API no disponible.' }, { status: 503 })

  const hoy = new Date().toISOString().split('T')[0]

  const antagonistaConfig = Object.values(AGONISTAS).find((a) => a.clerkId !== agonista.clerkId)
  const rival = antagonistaConfig
    ? await getAgonistaByClerkId(antagonistaConfig.clerkId)
    : null

  const [pruebaHoyRows, llamasAgonista, historialPrevio, consultaRows] =
    await Promise.all([
    db
      .select()
      .from(pruebasDiarias)
      .where(and(eq(pruebasDiarias.agonistId, agonista.id), eq(pruebasDiarias.fecha, hoy)))
      .limit(1),
    db.select().from(llamas).where(eq(llamas.agonistId, agonista.id)),
    db
      .select()
      .from(mentorConversaciones)
      .where(eq(mentorConversaciones.agonistId, agonista.id))
      .orderBy(asc(mentorConversaciones.createdAt))
      .limit(MAX_HISTORIAL),
    db
      .select({
        elSacrificio: consultaMediodia.elSacrificio,
        elMomento: consultaMediodia.elMomento,
        queHaCambiado: consultaMediodia.queHaCambiado,
      })
      .from(consultaMediodia)
      .where(eq(consultaMediodia.agonistId, agonista.id))
      .limit(1),
    ])

  const pruebaHoy = pruebaHoyRows[0]
  const rachaMaxima = llamasAgonista.reduce((max, l) => Math.max(max, l.rachMaxima), 0)
  const rachaActual = llamasAgonista.reduce((max, l) => Math.max(max, l.rachaActual), 0)

  const consulta = consultaRows[0] ?? null
  const contextoConsulta = consulta
    ? `
Reflexiones del agonista en la Consulta del Mediodía (día 15):
- Lo que sacrificó para estar aquí: "${consulta.elSacrificio}"
- El momento que más recuerda del Agon hasta ahora: "${consulta.elMomento}"
- Lo que cambió en él: "${consulta.queHaCambiado}"`
    : ''

  const contextoAgonista = `
Datos del agonista que mentorizas:
- Nombre: ${agonista.nombre}
- Nivel actual: ${agonista.nivel}
- Kleos total: ${agonista.kleosTotal}
- Días perfectos: ${agonista.diasPerfectos}
- Racha actual (mejor hábito): ${rachaActual} días
- Racha máxima histórica: ${rachaMaxima} días
- Antagonista: ${rival?.nombre ?? 'desconocido'} con ${rival?.kleosTotal ?? 0} kleos
- Diferencia de kleos: ${agonista.kleosTotal - (rival?.kleosTotal ?? 0)} (positivo = va ganando)
${pruebaHoy ? `- Hoy (${hoy}): ${pruebaHoy.diaPerfecto ? 'día perfecto ✓' : `kleos ganados: ${pruebaHoy.kleosGanado}`}` : `- Hoy (${hoy}): sin registro aún`}
${contextoConsulta}
`.trim()

  const systemPrompt = `${mentor.personalidad}

${contextoAgonista}

Reglas de conversación:
- Máximo 4 oraciones por respuesta. Sé denso, no extenso.
- No uses hashtags, emojis ni listas.
- No uses guion largo en ningún caso. Usa coma, punto o dos puntos en su lugar.
- Habla en primera persona como ${mentor.nombre}.
- Si el agonista menciona algo nuevo sobre sí mismo, incorpóralo a tu modelo mental de él.`

  const isFirstMessage = historialPrevio.length === 0

  const messages: { role: 'user' | 'assistant'; content: string }[] = []

  if (isFirstMessage) {
    const saludoResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: mentor.saludoInicial }],
    })

    const saludoTexto = saludoResponse.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('')
      .trim()

    if (saludoTexto) {
      await db.insert(mentorConversaciones).values({
        id: crypto.randomUUID(),
        agonistId: agonista.id,
        rol: 'mentor',
        contenido: saludoTexto,
      })
      messages.push({ role: 'assistant', content: saludoTexto })
    }
  } else {
    const historialFormateado = await comprimirHistorial(
      historialPrevio,
      mentor.nombre,
      anthropic
    )
    messages.push(...historialFormateado)
  }

  messages.push({ role: 'user', content: mensaje.trim() })

  await db.insert(mentorConversaciones).values({
    id: crypto.randomUUID(),
    agonistId: agonista.id,
    rol: 'user',
    contenido: mensaje.trim(),
  })

  const respuesta = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: systemPrompt,
    messages,
  })

  const textoRespuesta = respuesta.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('')
    .trim()

  if (!textoRespuesta) {
    return NextResponse.json({ error: 'El Mentor no respondió.' }, { status: 500 })
  }

  await db.insert(mentorConversaciones).values({
    id: crypto.randomUUID(),
    agonistId: agonista.id,
    rol: 'mentor',
    contenido: textoRespuesta,
  })

  if (isFirstMessage) {
    await crearNotificacion({
      agonistId: agonista.id,
      tipo: 'mentor',
      titulo: `${mentor.nombre} te ha recibido`,
      descripcion:
        textoRespuesta.length > 80 ? textoRespuesta.slice(0, 80) + '...' : textoRespuesta,
      metadata: { mentorNombre: mentor.nombre },
    })
  }

  const historial = await db
    .select()
    .from(mentorConversaciones)
    .where(eq(mentorConversaciones.agonistId, agonista.id))
    .orderBy(asc(mentorConversaciones.createdAt))
    .limit(MAX_HISTORIAL)

  return NextResponse.json({ historial, respuesta: textoRespuesta })
}
