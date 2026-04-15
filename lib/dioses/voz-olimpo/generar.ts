import Anthropic from '@anthropic-ai/sdk'
import { DIOSES } from '@/lib/dioses/config'
import type { SeñalDetectada } from './detectar'

export interface PostVozOlimpo {
  titular: string
  descripcion: string
  links: {
    titulo: string
    url: string
    tipo: 'libro' | 'video' | 'articulo' | 'herramienta'
  }[]
  linksValidados: boolean
}

export type ArquetipoVoz = 'constante' | 'explosivo' | 'metodico' | 'caotico'

const TONO_POR_ARQUETIPO: Record<ArquetipoVoz, string> = {
  constante:
    'El agonista es del tipo CONSTANTE: valora la consistencia, el largo plazo y los sistemas sostenibles. Adapta tu mensaje para reforzar la identidad de quien construye despacio pero sin parar. Los recursos que recomiendes deben enfocarse en hábitos duraderos, no en picos de rendimiento.',
  explosivo:
    'El agonista es del tipo EXPLOSIVO: responde al desafío directo, la confrontación y la intensidad. Adapta tu mensaje para provocar, retar y encender. Los recursos que recomiendes deben ser intensos, directos y orientados a la acción inmediata.',
  metodico:
    'El agonista es del tipo METÓDICO: valora los frameworks, los datos y la estructura. Adapta tu mensaje para validar su enfoque sistemático y ofrecerle herramientas concretas. Los recursos que recomiendes deben tener evidencia, métricas o metodologías claras.',
  caotico:
    'El agonista es del tipo CAÓTICO: prospera en la variedad, la ruptura de rutinas y la imprevisibilidad. Adapta tu mensaje para sorprender, romper patrones y proponer algo inesperado. Los recursos que recomiendes deben ser poco convencionales o desafiar el pensamiento habitual.',
}

const INSTRUCCIONES_TIPO: Record<string, string> = {
  retomar_lectura:
    'Busca 2-3 recursos prácticos sobre cómo retomar el hábito de lectura diaria. Prioriza videos de YouTube y artículos de menos de 10 minutos.',
  recomendacion_libros_avanzados:
    'Busca 2-3 libros altamente valorados sobre desarrollo personal, disciplina o mentalidad de alto rendimiento. Prioriza libros con más de 4.5 estrellas en Goodreads.',
  higiene_sueno:
    'Busca 2-3 recursos sobre optimización del sueño y recuperación. Incluye al menos un video y un artículo científico accesible.',
  retomar_movimiento:
    'Busca 2-3 recursos sobre cómo reintegrarse al movimiento diario. Prioriza rutinas cortas y técnicas de zona 2.',
  retomar_entrenamiento:
    'Busca 2-3 recursos sobre cómo retomar el entrenamiento después de un parón. Incluye un video de rutina y un artículo sobre readaptación.',
  mentalidad_competitiva:
    'Busca 2-3 recursos sobre mentalidad de alto rendimiento y disciplina sostenida. Prioriza libros o charlas TED.',
  sostener_momentum:
    'Busca 2-3 recursos sobre cómo mantener hábitos en el largo plazo. Prioriza frameworks o sistemas probados.',
  sostener_excelencia:
    'Busca 2-3 recursos sobre cómo mantener la excelencia sin quemarse. Incluye al menos un recurso sobre recuperación y rendimiento.',
  sobreexigencia_moderada:
    'Busca 2-3 recursos sobre recuperación activa, overtraining y descanso estratégico. Incluye al menos un artículo científico.',
  sobreexigencia_critica:
    'Busca 2-3 recursos sobre overreaching, burnout en el deporte y la importancia del descanso. Prioriza contenido médico o de alto rendimiento contrastado.',
}

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  return new Anthropic({ apiKey: key })
}

function extractTextFromMessage(response: {
  content: Array<{ type: string; text?: string }>
}): string {
  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { text: string }).text)
    .join('')
    .trim()
}

function parseJsonFromLlm(raw: string): unknown {
  const sinCercas = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim()
  const start = sinCercas.indexOf('{')
  const end = sinCercas.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Sin objeto JSON')
  }
  return JSON.parse(sinCercas.slice(start, end + 1))
}

function buildPromptAnalisis(señal: SeñalDetectada, diosPersonalidad: string): string {
  return `${diosPersonalidad}

El sistema ha detectado la siguiente situación en el Gran Agon:
Contexto: ${señal.contextoNarrativo}
Datos concretos: ${señal.datosConcretos}
Intensidad: ${señal.intensidad}

¿Hay algo valioso que decirle al agonista en este momento, desde tu perspectiva como dios?
Responde SOLO con un JSON con este formato exacto, sin texto adicional:
{
  "intervenir": true | false,
  "razon": "breve explicación de por qué sí o no"
}`
}

function buildPromptGeneracion(
  señal: SeñalDetectada,
  diosPersonalidad: string,
  diosNombre: string,
  arquetipo: ArquetipoVoz | null
): string {
  const instruccionBusqueda =
    INSTRUCCIONES_TIPO[señal.tipoContenido] ??
    'Busca 2-3 recursos relevantes y de alta calidad sobre el tema.'

  const instruccionArquetipo = arquetipo
    ? `\nPERFIL DEL AGONISTA:\n${TONO_POR_ARQUETIPO[arquetipo]}\n`
    : ''

  return `${diosPersonalidad}
${instruccionArquetipo}
El Gran Agon ha revelado esta situación:
${señal.contextoNarrativo}
Datos: ${señal.datosConcretos}
Intensidad: ${señal.intensidad}

Tu misión: publicar un post en el Ágora como La Voz del Olimpo.

INSTRUCCIONES DE BÚSQUEDA:
${instruccionBusqueda}

FORMATO DE RESPUESTA (JSON estricto, sin texto adicional):
{
  "titular": "Frase épica de máximo 8 palabras en voz de ${diosNombre}",
  "descripcion": "Descripción de máximo 100 caracteres que mezcla narrativa griega con el mensaje práctico",
  "links": [
    {
      "titulo": "Título legible del recurso",
      "url": "URL real y verificada",
      "tipo": "libro" | "video" | "articulo" | "herramienta"
    }
  ]
}

REGLAS:
- El titular debe sonar épico y en voz del dios — no genérico
- La descripción conecta la situación del agonista con el recurso
- Los links deben ser reales, verificables y de alta calidad
- Máximo 3 links, mínimo 1
- No inventes URLs — usa web search para encontrar los recursos reales`
}

// ─── Validación de links ──────────────────────────────────────────────────────

async function validarUrl(url: string): Promise<boolean> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

async function validarYFiltrarLinks(
  links: PostVozOlimpo['links']
): Promise<{ links: PostVozOlimpo['links']; linksValidados: boolean }> {
  if (links.length === 0) return { links, linksValidados: false }

  const resultados = await Promise.all(
    links.map(async (link) => ({
      link,
      valido: await validarUrl(link.url),
    }))
  )

  const validos = resultados.filter((r) => r.valido).map((r) => r.link)
  const linksValidados = validos.length === links.length

  return { links: validos, linksValidados }
}

function buildPromptRegenerarLinks(
  señal: SeñalDetectada,
  _diosNombre: string,
  linksFallidos: PostVozOlimpo['links']
): string {
  const instruccionBusqueda =
    INSTRUCCIONES_TIPO[señal.tipoContenido] ??
    'Busca 2-3 recursos relevantes y de alta calidad sobre el tema.'

  const fallidos = linksFallidos.map((l) => `- ${l.titulo}: ${l.url}`).join('\n')

  return `Los siguientes links que generaste para el post de La Voz del Olimpo están caídos o no responden:
${fallidos}

Contexto del post: ${señal.contextoNarrativo}

INSTRUCCIONES DE BÚSQUEDA:
${instruccionBusqueda}

Genera links de reemplazo. Responde SOLO con un JSON sin texto adicional:
{
  "links": [
    {
      "titulo": "Título legible del recurso",
      "url": "URL real y verificada",
      "tipo": "libro" | "video" | "articulo" | "herramienta"
    }
  ]
}

REGLAS:
- Los links deben ser reales y accesibles ahora mismo
- Máximo 3 links, mínimo 1
- Usa web search para verificar que existen antes de incluirlos
- No repitas los links fallidos`
}

export async function generarPostVozOlimpo(
  señal: SeñalDetectada,
  arquetipo: ArquetipoVoz | null = null
): Promise<PostVozOlimpo | null> {
  const dios = DIOSES[señal.dios]
  if (!dios) return null

  const anthropic = getAnthropicClient()
  if (!anthropic) return null

  try {
    const analisis = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: buildPromptAnalisis(señal, dios.personalidad),
        },
      ],
    })

    const textoAnalisis = extractTextFromMessage(analisis)
    const parsedAnalisis = parseJsonFromLlm(textoAnalisis) as {
      intervenir?: boolean
    }
    if (!parsedAnalisis.intervenir) return null
  } catch (e) {
    console.error('generarPostVozOlimpo analisis', e)
    return null
  }

  try {
    const generacion = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
        },
      ],
      messages: [
        {
          role: 'user',
          content: buildPromptGeneracion(
            señal,
            dios.personalidad,
            dios.nombre,
            arquetipo
          ),
        },
      ],
    })

    const textoFinal = extractTextFromMessage(generacion)
    if (!textoFinal) return null

    const postRaw = parseJsonFromLlm(textoFinal) as Omit<PostVozOlimpo, 'linksValidados'>
    if (!postRaw.titular || !postRaw.descripcion || !postRaw.links?.length) return null

    const { links: linksValidos, linksValidados } = await validarYFiltrarLinks(
      postRaw.links
    )

    if (linksValidos.length === 0) {
      try {
        const regeneracion = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [
            {
              role: 'user',
              content: buildPromptRegenerarLinks(señal, dios.nombre, postRaw.links),
            },
          ],
        })

        const textoRegen = extractTextFromMessage(regeneracion)
        if (textoRegen) {
          const parsed = parseJsonFromLlm(textoRegen) as {
            links?: PostVozOlimpo['links']
          }
          if (parsed.links?.length) {
            return {
              ...postRaw,
              links: parsed.links,
              linksValidados: false,
            }
          }
        }
      } catch {
        // Si la regeneración también falla, publicar sin links
      }
      return { ...postRaw, links: [], linksValidados: false }
    }

    return { ...postRaw, links: linksValidos, linksValidados }
  } catch (e) {
    console.error('generarPostVozOlimpo generacion', e)
    return null
  }
}
