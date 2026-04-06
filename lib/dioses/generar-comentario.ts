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

export async function generarComentarioDios(
  diosNombre: string,
  eventoId: string,
  contextoEvento: string,
  otrosComentarios: string[] = []
): Promise<string | null> {
  const dios = DIOSES[diosNombre]
  if (!dios) return null

  const anthropic = getAnthropicClient()
  if (!anthropic) {
    console.warn('ANTHROPIC_API_KEY no configurada — sin comentario de dios')
    return null
  }

  const contextoConversacion =
    otrosComentarios.length > 0
      ? `\nComentarios previos en este evento:\n${otrosComentarios.join('\n')}`
      : ''

  const prompt = `${dios.personalidad}

El evento en El Ágora del Gran Agon es:
"${contextoEvento}"
${contextoConversacion}

Escribe UN comentario breve (máximo 3 oraciones) en tu voz y personalidad.
Si hay comentarios previos de otros dioses, puedes responderles o ignorarlos según tu carácter.
Si eres Eris y hay comentarios de Apolo, es probable que quieras interrumpir.
No uses hashtags, emojis excesivos ni formato especial.
Habla en primera persona como dios.
Sé conciso — menos es más en el Ágora.`

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
      eventoId,
      autorTipo: 'dios',
      autorId: diosNombre,
      autorNombre: dios.nombre,
      contenido: texto,
    })

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
  } catch (error) {
    console.error(`Error generando comentario de ${diosNombre}:`, error)
    return null
  }
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
    })

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
