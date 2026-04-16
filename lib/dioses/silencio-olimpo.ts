import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/lib/db'
import { postsDioses, pruebasDiarias } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { DIOSES } from '@/lib/dioses/config'
import { getAmbosAgonistas } from '@/lib/db/queries'

function getAnthropicClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  return new Anthropic({ apiKey: key })
}

async function generarVeredictoFinal(
  diosKey: string,
  agonistaNombre: string,
  kleosTotal: number,
  diasPerfectos: number,
  rival: string
): Promise<string> {
  const anthropic = getAnthropicClient()
  if (!anthropic) return `${agonistaNombre} completó el Gran Agon. El Olimpo lo inscribe.`

  const dios = DIOSES[diosKey]
  if (!dios) return ''

  const prompt = `${dios.personalidad}

El Gran Agon de 29 días ha concluido. ${agonistaNombre} acumuló ${kleosTotal} kleos y ${diasPerfectos} días perfectos compitiendo contra ${rival}.

Es el último día. Emite tu veredicto final sobre ${agonistaNombre} en UNA sola oración desde tu perspectiva como ${dios.nombre}. 
Debe ser épico, definitivo y en tu voz característica. 
Sin guion largo. Sin hashtags. Sin emojis. Máximo 25 palabras.`

  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })
    return res.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('')
      .trim()
  } catch {
    return `${agonistaNombre} completó el Gran Agon. ${dios.nombre} lo ha visto todo.`
  }
}

export async function triggerSilencioDelOlimpo(): Promise<void> {
  try {
    const ambos = await getAmbosAgonistas()
    if (ambos.length < 2) return

    const [a1, a2] = ambos

    // Verificar que ya se ejecutó: si hay posts de tipo 'silencio_olimpo' no repetir
    const yaEjecutado = await db
      .select({ id: postsDioses.id })
      .from(postsDioses)
      .where(eq(postsDioses.tipo, 'silencio_olimpo'))
      .limit(1)

    if (yaEjecutado.length > 0) return

    const diosKeys = Object.keys(DIOSES)

    const ganador = a1.kleosTotal >= a2.kleosTotal ? a1 : a2
    const perdedor = ganador.id === a1.id ? a2 : a1

    const pruebasGanador = await db
      .select({ diaPerfecto: pruebasDiarias.diaPerfecto })
      .from(pruebasDiarias)
      .where(eq(pruebasDiarias.agonistId, ganador.id))

    const diasPerfectos = pruebasGanador.filter((p) => p.diaPerfecto).length

    // Generar veredictos de todos los dioses en paralelo
    await Promise.all(
      diosKeys.map(async (diosKey) => {
        const dios = DIOSES[diosKey]
        if (!dios) return

        const contenido = await generarVeredictoFinal(
          diosKey,
          ganador.nombre,
          ganador.kleosTotal,
          diasPerfectos,
          perdedor.nombre
        )

        if (!contenido) return

        await db.insert(postsDioses).values({
          id: crypto.randomUUID(),
          diosNombre: dios.nombre,
          tipo: 'silencio_olimpo',
          contenido,
          metadata: {
            diaFinal: true,
            ganador: ganador.nombre,
            perdedor: perdedor.nombre,
            kleosGanador: ganador.kleosTotal,
            kleosPerdedor: perdedor.kleosTotal,
          },
          cerrado: false,
        })
      })
    )

    // Post narrativo del Altis como cierre
    await db.insert(postsDioses).values({
      id: crypto.randomUUID(),
      diosNombre: 'El Altis',
      tipo: 'silencio_olimpo',
      contenido: `El Gran Agon de 29 días ha concluido. ${a1.nombre} y ${a2.nombre} han completado su reto. El Altis inscribe en piedra lo que ninguna palabra puede borrar.`,
      metadata: { diaFinal: true, esCierre: true },
      cerrado: false,
    })
  } catch (error) {
    console.error('[triggerSilencioDelOlimpo] Error:', error)
  }
}

export async function ambosConfirmaronHoy(hoy: string): Promise<boolean> {
  try {
    const ambos = await getAmbosAgonistas()
    if (ambos.length < 2) return false

    const [p1, p2] = await Promise.all([
      db
        .select({ id: pruebasDiarias.id })
        .from(pruebasDiarias)
        .where(and(eq(pruebasDiarias.agonistId, ambos[0].id), eq(pruebasDiarias.fecha, hoy)))
        .limit(1),
      db
        .select({ id: pruebasDiarias.id })
        .from(pruebasDiarias)
        .where(and(eq(pruebasDiarias.agonistId, ambos[1].id), eq(pruebasDiarias.fecha, hoy)))
        .limit(1),
    ])

    return p1.length > 0 && p2.length > 0
  } catch {
    return false
  }
}

