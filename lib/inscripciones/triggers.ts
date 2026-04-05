import { db } from '@/lib/db'
import { pruebasDiarias, llamas, inscripciones } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { Agonista, PruebaDiaria } from '@/lib/db/schema'

export async function verificarInscripciones(
  agonista: Agonista,
  pruebaNueva: PruebaDiaria
): Promise<string[]> {
  const desbloqueadas: string[] = []

  const [todasLasPruebas, todasLasLlamas, yaDesbloqueadas] = await Promise.all([
    db.select().from(pruebasDiarias).where(eq(pruebasDiarias.agonistId, agonista.id)),
    db.select().from(llamas).where(eq(llamas.agonistId, agonista.id)),
    db.select().from(inscripciones).where(eq(inscripciones.agonistId, agonista.id)),
  ])

  const desbloqueadasIds = new Set(yaDesbloqueadas.map((i) => i.inscripcionId))

  async function desbloquear(id: string) {
    if (desbloqueadasIds.has(id)) return
    desbloqueadas.push(id)
    desbloqueadasIds.add(id)
  }

  const diasPerfectos = todasLasPruebas.filter((p) => p.diaPerfecto)
  const diasOrdenados = diasPerfectos
    .map((p) => String(p.fecha))
    .sort()

  if (diasPerfectos.length >= 3) {
    const racha = calcularRachaDias(diasOrdenados)
    if (racha >= 3) await desbloquear('la_llama_viva')
  }

  const diasAgua = todasLasPruebas.filter((p) => p.soloAgua).length
  if (diasAgua >= 7) await desbloquear('agua_sagrada')

  if (diasPerfectos.length >= 7) {
    const racha = calcularRachaDias(diasOrdenados)
    if (racha >= 7) await desbloquear('semana_olimpica')
  }

  if (pruebaNueva.sesionesGym >= 5) await desbloquear('furia_del_agon')

  const hora = new Date().getHours()
  if (hora < 7) await desbloquear('el_heraldo')

  const totalPaginas = todasLasPruebas.reduce(
    (sum, p) => sum + (p.paginasLeidas ?? 0),
    0
  )
  if (totalPaginas >= 100) await desbloquear('filosofo_del_agon')

  const diasSinComida = todasLasPruebas.filter((p) => p.sinComidaRapida).length
  if (diasSinComida >= 14) await desbloquear('ayuno_de_hierro')

  if (diasPerfectos.length >= 14) await desbloquear('imparable')

  if (todasLasPruebas.length >= 29) await desbloquear('el_gran_agon')

  if (hora >= 2 && hora < 5) await desbloquear('guardian_de_la_noche')

  const diasOchoHoras = todasLasPruebas
    .filter((p) => p.horasSueno === 8)
    .map((p) => String(p.fecha))
    .sort()
  if (calcularRachaDias(diasOchoHoras) >= 3) {
    await desbloquear('precision_del_sabio')
  }

  const rachaCardio =
    todasLasLlamas.find((l) => l.habitoId === 'cardio')?.rachaActual ?? 0
  if (rachaCardio >= 7) await desbloquear('mas_alla_del_contrato')

  return desbloqueadas
}

function calcularRachaDias(fechasOrdenadas: string[]): number {
  if (fechasOrdenadas.length === 0) return 0

  let rachaMax = 1
  let rachaActual = 1

  for (let i = 1; i < fechasOrdenadas.length; i++) {
    const prev = new Date(fechasOrdenadas[i - 1] + 'T12:00:00')
    const curr = new Date(fechasOrdenadas[i] + 'T12:00:00')
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)

    if (diff === 1) {
      rachaActual++
      rachaMax = Math.max(rachaMax, rachaActual)
    } else {
      rachaActual = 1
    }
  }

  return rachaMax
}
