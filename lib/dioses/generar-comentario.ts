import Anthropic from '@anthropic-ai/sdk'
import { DIOSES } from './config'
import { db } from '@/lib/db'
import {
  comentariosAgora,
  postsDioses,
  likesAgora,
  agoraEventos,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notificarComentarioDios } from '@/lib/notificaciones/crear'

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  return new Anthropic({ apiKey: key })
}

function extractText(
  response: { content: Array<{ type: string; text?: string }> }
): string {
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('')
    .trim()
}

/** Solo genera el texto — sin insertar en DB. */
export async function generarTextoComentario(
  diosNombre: string,
  contextoEvento: string,
  otrosComentarios: string[] = [],
  tipoEvento: string = 'prueba_completada'
): Promise<string | null> {
  const dios = DIOSES[diosNombre]
  if (!dios) return null

  const anthropic = getAnthropicClient()
  if (!anthropic) {
    console.warn('ANTHROPIC_API_KEY no configurada — sin comentario de dios')
    return null
  }

  const eventosEpicos = ['dia_perfecto', 'hegemonia_ganada', 'semana_sagrada']
  const esEpico = eventosEpicos.includes(tipoEvento)

  const contextoConversacion =
    otrosComentarios.length > 0
      ? `\nComentarios previos:\n${otrosComentarios.join('\n')}`
      : ''

  const instruccionLongitud = esEpico
    ? 'Escribe un comentario de 2-3 oraciones con peso dramático.'
    : 'Escribe UN comentario de UNA SOLA oración. Breve, directo, con carácter.'

  const prompt = `${dios.personalidad}

El evento en El Ágora es:
"${contextoEvento}"
${contextoConversacion}

${instruccionLongitud}
${
  diosNombre === 'eris' && otrosComentarios.length > 0
    ? 'Si hay comentarios de Apolo, interrúmpelo con humor irreverente.'
    : ''
}
No uses hashtags ni emojis. Habla en primera persona como dios.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: esEpico ? 150 : 80,
      messages: [{ role: 'user', content: prompt }],
    })

    return extractText(response) || null
  } catch (error) {
    console.error(`Error generando texto de ${diosNombre}:`, error)
    return null
  }
}

/** Genera texto e inserta inmediatamente (sin cola). */
export async function generarComentarioDios(
  diosNombre: string,
  eventoId: string,
  contextoEvento: string,
  otrosComentarios: string[] = [],
  tipoEvento: string = 'prueba_completada'
): Promise<string | null> {
  const dios = DIOSES[diosNombre]
  if (!dios) return null

  const texto = await generarTextoComentario(
    diosNombre,
    contextoEvento,
    otrosComentarios,
    tipoEvento
  )

  if (!texto) return null

  await db.insert(comentariosAgora).values({
    id: crypto.randomUUID(),
    eventoId,
    autorTipo: 'dios',
    autorId: diosNombre,
    autorNombre: dios.nombre,
    contenido: texto,
    procesado: true,
    procesarDespuesDe: null,
    tipoGeneracion: null,
    visto: false,
  })

  // Notificar al dueño del evento
  try {
    const evento = await db
      .select({ agonistId: agoraEventos.agonistId })
      .from(agoraEventos)
      .where(eq(agoraEventos.id, eventoId))
      .limit(1)

    if (evento[0]) {
      void notificarComentarioDios(
        evento[0].agonistId,
        dios.nombre,
        texto
      ).catch(() => {})
    }
  } catch {
    // Silencioso
  }

  await db
    .insert(likesAgora)
    .values({
      id: crypto.randomUUID(),
      eventoId,
      autorTipo: 'dios',
      autorId: diosNombre,
    })
    .onConflictDoNothing({ target: [likesAgora.eventoId, likesAgora.autorId] })

  return texto
}

export async function generarPostDios(
  diosNombre: string,
  tipo: 'oraculo' | 'voz_olimpo',
  contexto: string,
  eventoRelacionadoId?: string
): Promise<string | null> {
  const dios = DIOSES[diosNombre]
  if (!dios) return null
  if (tipo === 'oraculo' && !dios.puedeSerOraculo) return null

  const anthropic = getAnthropicClient()
  if (!anthropic) return null

  const instruccionTipo =
    tipo === 'oraculo'
      ? `Escribe un post del Oráculo: comparte conocimiento real y práctico sobre tu dominio (${dios.dominio.join(', ')}).
       El agonista podrá hacerte UNA pregunta de seguimiento.
       El post debe terminar con una invitación sutil a preguntar.
       Máximo 4 oraciones.`
      : `Escribe un post de La Voz del Olimpo: una opinión, provocación o reacción.
       Los agonistas solo podrán reaccionar con aclamaciones — no responder.
       Máximo 2 oraciones. Directo y memorable.`

  const prompt = `${dios.personalidad}

Contexto del Gran Agon en este momento:
${contexto}

${instruccionTipo}

No uses hashtags ni formato especial. Habla en primera persona como dios.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    const texto = extractText(response)
    if (!texto) return null

    const post = await db
      .insert(postsDioses)
      .values({
        id: crypto.randomUUID(),
        diosNombre,
        tipo,
        contenido: texto,
        eventoRelacionadoId: eventoRelacionadoId ?? null,
        cerrado: false,
        metadata: { dominio: dios.dominio },
      })
      .returning()

    const { getAmbosAgonistas } = await import('@/lib/db/queries')
    const ambos = await getAmbosAgonistas()
    if (ambos.length > 0 && post[0]) {
      await db.insert(agoraEventos).values({
        id: crypto.randomUUID(),
        agonistId: ambos[0].id,
        tipo: 'prueba_completada',
        contenido: texto,
        metadata: {
          esDios: true,
          diosNombre,
          tipoDios: tipo,
          postDiosId: post[0].id,
        },
      })
    }

    return texto
  } catch (error) {
    console.error(`Error generando post de ${diosNombre}:`, error)
    return null
  }
}

export async function responderOraculo(
  diosNombre: string,
  agoraEventoId: string,
  postDiosId: string,
  pregunta: string,
  contextoOriginal: string
): Promise<string | null> {
  const dios = DIOSES[diosNombre]
  if (!dios || !dios.puedeSerOraculo) return null

  const anthropic = getAnthropicClient()
  if (!anthropic) return null

  const prompt = `${dios.personalidad}

Tu post original fue:
"${contextoOriginal}"

El agonista te pregunta:
"${pregunta}"

Responde en máximo 3 oraciones. Directo, en tu voz, con conocimiento real.
Después de tu respuesta, el Oráculo se cierra — no habrá más preguntas.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })

    const texto = extractText(response)
    if (!texto) return null

    await db.insert(comentariosAgora).values({
      id: crypto.randomUUID(),
      eventoId: agoraEventoId,
      autorTipo: 'dios',
      autorId: diosNombre,
      autorNombre: dios.nombre,
      contenido: texto,
      procesado: true,
      procesarDespuesDe: null,
      tipoGeneracion: null,
      visto: false,
    })

    try {
      const evento = await db
        .select({ agonistId: agoraEventos.agonistId })
        .from(agoraEventos)
        .where(eq(agoraEventos.id, agoraEventoId))
        .limit(1)

      if (evento[0]) {
        void notificarComentarioDios(
          evento[0].agonistId,
          dios.nombre,
          texto
        ).catch(() => {})
      }
    } catch {
      // Silencioso
    }

    await db
      .update(postsDioses)
      .set({ cerrado: true })
      .where(eq(postsDioses.id, postDiosId))

    return texto
  } catch (error) {
    console.error('Error en respuesta del Oráculo:', error)
    return null
  }
}

/** Genera texto para eventos de rivalidad — recibe contexto de ambos agonistas. */
export async function generarTextoRivalidad(
  diosNombre: string,
  tipoEvento: string,
  contextoRivalidad: string
): Promise<string | null> {
  const dios = DIOSES[diosNombre]
  if (!dios) return null

  const anthropic = getAnthropicClient()
  if (!anthropic) {
    console.warn('ANTHROPIC_API_KEY no configurada — sin comentario de rivalidad')
    return null
  }

  const prompt = `${dios.personalidad}

El Gran Agon enfrenta a dos agonistas en una batalla épica por la gloria.

Evento de rivalidad (${tipoEvento}):
"${contextoRivalidad}"

Escribe un comentario de 2-3 oraciones sobre esta rivalidad.
Habla de AMBOS contendientes, no de uno solo.
Sin hashtags ni emojis. Habla en primera persona como dios.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })

    return extractText(response) || null
  } catch (error) {
    console.error(`Error generando texto de rivalidad de ${diosNombre}:`, error)
    return null
  }
}
