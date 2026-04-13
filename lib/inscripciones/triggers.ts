import { db } from '@/lib/db'
import { pruebasDiarias, llamas, agoraEventos, kleosLog, inscripciones } from '@/lib/db/schema'
import { eq, and, gte, asc } from 'drizzle-orm'
import type { Agonista, PruebaDiaria } from '@/lib/db/schema'
import { getDiaDelAgan } from '@/lib/utils'
import { getAmbosAgonistas } from '@/lib/db/queries'
import { desbloquearInscripcion, yaDesbloqueada } from './desbloquear'

// ─── HELPER: calcular racha de días consecutivos ───────────────────────────────

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

// ─── VERIFICADOR PRINCIPAL ────────────────────────────────────────────────────

export async function verificarInscripciones(
  agonista: Agonista,
  pruebaNueva: PruebaDiaria
): Promise<string[]> {
  const desbloqueadas: string[] = []
  const horaActual = new Date().getHours()
  const minutosActual = new Date().getMinutes()
  const horaDecimal = horaActual + minutosActual / 60
  const diaActual = getDiaDelAgan()

  async function desbloquear(id: string) {
    const exito = await desbloquearInscripcion(agonista.id, agonista.nombre, id)
    if (exito) desbloqueadas.push(id)
  }

  // ─── CARGAR DATOS NECESARIOS ───────────────────────────────────────────────

  const [todasLasPruebas, todasLasLlamas] = await Promise.all([
    db.select().from(pruebasDiarias).where(eq(pruebasDiarias.agonistId, agonista.id)),
    db.select().from(llamas).where(eq(llamas.agonistId, agonista.id)),
  ])

  const diasPerfectos = todasLasPruebas.filter((p) => p.diaPerfecto)
  const diasPerfectosOrdenados = diasPerfectos.map((p) => String(p.fecha)).sort()

  // ─── PÚBLICAS EXISTENTES ───────────────────────────────────────────────────

  // La Llama Viva — 3 días perfectos consecutivos
  if (diasPerfectos.length >= 3) {
    if (calcularRachaDias(diasPerfectosOrdenados) >= 3) {
      await desbloquear('la_llama_viva')
    }
  }

  // El Agua Sagrada — 7 días solo agua
  const diasAgua = todasLasPruebas.filter((p) => p.soloAgua).length
  if (diasAgua >= 7) await desbloquear('agua_sagrada')

  // La Semana Olímpica — 7 días perfectos consecutivos
  if (diasPerfectos.length >= 7) {
    if (calcularRachaDias(diasPerfectosOrdenados) >= 7) {
      await desbloquear('semana_olimpica')
    }
  }

  // La Furia del Agon — 5 sesiones de gym en una semana
  if (pruebaNueva.sesionesGym >= 5) await desbloquear('furia_del_agon')

  // El Heraldo — antes de las 7am
  if (horaActual < 7) await desbloquear('el_heraldo')

  // El Filósofo del Agon — 100 páginas totales
  const totalPaginas = todasLasPruebas.reduce((sum, p) => sum + (p.paginasLeidas ?? 0), 0)
  if (totalPaginas >= 100) await desbloquear('filosofo_del_agon')

  // El Ayuno de Hierro — 14 días sin comida rápida
  const diasSinComida = todasLasPruebas.filter((p) => p.sinComidaRapida).length
  if (diasSinComida >= 14) await desbloquear('ayuno_de_hierro')

  // Imparable — 14 días perfectos totales
  if (diasPerfectos.length >= 14) await desbloquear('imparable')

  // El Gran Agon — 29 días completados
  if (todasLasPruebas.length >= 29) await desbloquear('el_gran_agon')

  // La Precisión del Sabio — exactamente 8h sueño 3 días consecutivos
  const diasOchoHoras = todasLasPruebas
    .filter((p) => p.horasSueno === 8)
    .map((p) => String(p.fecha))
    .sort()
  if (calcularRachaDias(diasOchoHoras) >= 3) await desbloquear('precision_del_sabio')

  // Más Allá del Contrato — cardio 7 días consecutivos
  const rachaCardio = todasLasLlamas.find((l) => l.habitoId === 'cardio')?.rachaActual ?? 0
  if (rachaCardio >= 7) await desbloquear('mas_alla_del_contrato')

  // El Guardián de la Noche — entre 2am y 5am
  if (horaActual >= 2 && horaActual < 5) await desbloquear('guardian_de_la_noche')

  // ─── PÚBLICAS NUEVAS ───────────────────────────────────────────────────────

  // El Iniciado — primer día perfecto
  if (pruebaNueva.diaPerfecto && diasPerfectos.length === 1) {
    await desbloquear('el_iniciado')
  }

  // El Primer Paso — primer día con 10.000+ pasos
  const diasConPasos = todasLasPruebas.filter((p) => p.pasos >= 10000)
  if (diasConPasos.length === 1 && pruebaNueva.pasos >= 10000) {
    await desbloquear('el_primer_paso')
  }

  // El Primer Combate — primera sesión de gym
  const diasConGym = todasLasPruebas.filter((p) => p.sesionesGym > 0)
  if (diasConGym.length === 1 && pruebaNueva.sesionesGym > 0) {
    await desbloquear('el_primer_combate')
  }

  // La Primera Carrera — primera sesión de cardio
  const diasConCardio = todasLasPruebas.filter((p) => p.sesionesCardio > 0)
  if (diasConCardio.length === 1 && pruebaNueva.sesionesCardio > 0) {
    await desbloquear('la_primera_carrera')
  }

  // El Bautismo — primer día solo agua
  const diasSoloAgua = todasLasPruebas.filter((p) => p.soloAgua)
  if (diasSoloAgua.length === 1 && pruebaNueva.soloAgua) {
    await desbloquear('el_bautismo')
  }

  // El Despertar de Apolo — primer día con 10+ páginas
  const diasConLectura = todasLasPruebas.filter((p) => p.paginasLeidas >= 10)
  if (diasConLectura.length === 1 && pruebaNueva.paginasLeidas >= 10) {
    await desbloquear('el_despertar_de_apolo')
  }

  // El Madrugador — 7 pruebas antes del mediodía, 3 veces
  if (horaActual < 12 && pruebaNueva.diaPerfecto) {
    const diasMadrugador = todasLasPruebas.filter((p) => {
      const hora = new Date(p.updatedAt).getHours()
      return p.diaPerfecto && hora < 12
    })
    if (diasMadrugador.length >= 3) await desbloquear('el_madrugador')
  }

  // La Bestia — gym + cardio mismo día, 5 veces totales
  const diasDobleEntrenamiento = todasLasPruebas.filter(
    (p) => p.sesionesGym > 0 && p.sesionesCardio > 0
  )
  if (diasDobleEntrenamiento.length >= 5) await desbloquear('la_bestia')

  // El Estoico — 5 días perfectos consecutivos
  if (diasPerfectos.length >= 5) {
    if (calcularRachaDias(diasPerfectosOrdenados) >= 5) {
      await desbloquear('el_estoico')
    }
  }

  // El Caminante — 10.000+ pasos en 14 días totales
  const totalDiasPasos = todasLasPruebas.filter((p) => p.pasos >= 10000).length
  if (totalDiasPasos >= 14) await desbloquear('el_caminante')

  // El Discípulo de Morfeo — 7+ horas sueño en 14 días totales
  const totalDiasSueno = todasLasPruebas.filter((p) => p.horasSueno >= 7).length
  if (totalDiasSueno >= 14) await desbloquear('el_discipulo_de_morfeo')

  // El Punto Sin Retorno — completar el día 14
  if (diaActual === 14 && pruebaNueva.diaPerfecto) {
    await desbloquear('el_punto_sin_retorno')
  }

  // Kleos milestones
  if (agonista.kleosTotal >= 1000) await desbloquear('el_mil_kleos')
  if (agonista.kleosTotal >= 2000) await desbloquear('los_dos_mil')
  if (agonista.kleosTotal >= 3000) await desbloquear('la_gloria_maxima')

  // Días perfectos milestones
  if (diasPerfectos.length >= 10) await desbloquear('los_diez_del_altis')
  if (diasPerfectos.length >= 20) await desbloquear('los_veinte_del_olimpo')

  // Páginas milestones
  if (totalPaginas >= 200) await desbloquear('el_lector_voraz')
  if (totalPaginas >= 300) await desbloquear('la_biblioteca_del_agon')

  // Niveles
  const nivelMap: Record<string, string> = {
    atleta: 'el_atleta_forjado',
    agonista: 'el_agonista_forjado',
    campeon: 'el_campeon_del_altis',
    heroe: 'el_heroe_del_altis',
    semidios: 'el_semidios',
    olimpico: 'el_olimpico',
    inmortal: 'el_inmortal',
  }
  const inscripcionNivel = nivelMap[agonista.nivel]
  if (inscripcionNivel) await desbloquear(inscripcionNivel)

  // La Constancia — misma prueba 10 días consecutivos
  const habitosParaConstancia = ['agua', 'comida', 'pasos', 'sueno', 'lectura', 'gym', 'cardio']
  for (const habitoId of habitosParaConstancia) {
    const llama = todasLasLlamas.find((l) => l.habitoId === habitoId)
    if ((llama?.rachaActual ?? 0) >= 10) {
      await desbloquear('la_constancia')
      break
    }
  }

  // El Rey del Cardio — 3 sesiones cardio/semana durante 3 semanas consecutivas
  const rachaCardioPorSemana = todasLasLlamas.find((l) => l.habitoId === 'cardio')?.rachaActual ?? 0
  if (rachaCardioPorSemana >= 21) await desbloquear('el_rey_del_cardio')

  // El Purista — 21 días sin comida rápida totales
  if (diasSinComida >= 21) await desbloquear('el_purista')

  // La Pureza del Agua — 21 días solo agua totales
  if (diasAgua >= 21) await desbloquear('la_pureza_del_agua')

  // ─── SECRETAS NUEVAS ───────────────────────────────────────────────────────

  // El Insomnio del Agonista — actividad después de medianoche 3 veces
  if (horaActual === 0) {
    const diasMedianoche = todasLasPruebas.filter((p) => {
      const hora = new Date(p.updatedAt).getHours()
      return hora === 0
    })
    if (diasMedianoche.length >= 3) await desbloquear('el_insomnio')
  }

  // El Primero del Olimpo — antes de las 5:30am
  if (horaDecimal < 5.5) await desbloquear('el_primero_del_olimpo')

  // La Cadena de Oro — 10 días perfectos consecutivos
  if (diasPerfectos.length >= 10) {
    if (calcularRachaDias(diasPerfectosOrdenados) >= 10) {
      await desbloquear('la_cadena_de_oro')
    }
  }

  // El Hijo de Ares — gym 4 sesiones/semana durante 3 semanas consecutivas
  const rachaGym = todasLasLlamas.find((l) => l.habitoId === 'gym')?.rachaActual ?? 0
  if (rachaGym >= 21) await desbloquear('el_hijo_de_ares')

  // El Monje del Altis — 5 días perfectos sin publicar en el Ágora
  if (diasPerfectos.length >= 5) {
    const eventosAgora = await db
      .select()
      .from(agoraEventos)
      .where(eq(agoraEventos.agonistId, agonista.id))

    const diasConPublicacion = new Set(
      eventosAgora.map((e) => new Date(e.createdAt).toISOString().split('T')[0])
    )

    const diasPerfectosSinPublicar = diasPerfectosOrdenados.filter(
      (fecha) => !diasConPublicacion.has(fecha)
    )

    if (diasPerfectosSinPublicar.length >= 5) await desbloquear('el_monje_del_altis')
  }

  // El Constante — al menos 1 prueba registrada los 29 días
  if (todasLasPruebas.length >= 29) await desbloquear('el_constante')

  // El Cuerpo sin Límites — gym + cardio mismo día, 7 veces totales
  if (diasDobleEntrenamiento.length >= 7) await desbloquear('el_cuerpo_sin_limites')

  // El Último Agon — 7 pruebas el día 29
  if (diaActual === 29 && pruebaNueva.diaPerfecto) {
    await desbloquear('el_ultimo_agon')
  }

  // ─── EASTER EGGS ──────────────────────────────────────────────────────────

  // El Boxeador de Philadelphia — gym + cardio + 10.000 pasos antes de las 8am
  if (
    horaActual < 8 &&
    pruebaNueva.sesionesGym > 0 &&
    pruebaNueva.sesionesCardio > 0 &&
    pruebaNueva.pasos >= 10000
  ) {
    await desbloquear('el_boxeador_de_philadelphia')
  }

  // Espartanos — exactamente 300 kleos en un día
  if (pruebaNueva.kleosGanado === 300) {
    await desbloquear('espartanos_cual_es_su_oficio')
  }

  // ¿No Estás Entretenido? — 7 pruebas un domingo
  const diaSemana = new Date().getDay() // 0 = domingo
  if (diaSemana === 0 && pruebaNueva.diaPerfecto) {
    await desbloquear('no_estas_entretenido')
  }

  // El Fantasma de Esparta — gym + cardio + 10.000 pasos mismo día, 5 veces
  const diasTripleEntrenamiento = todasLasPruebas.filter(
    (p) => p.sesionesGym > 0 && p.sesionesCardio > 0 && p.pasos >= 10000
  )
  if (diasTripleEntrenamiento.length >= 5) await desbloquear('el_fantasma_de_esparta')

  // El Orgullo de Philadelphia — gym + cardio + 10.000 pasos mismo día, 10 veces
  if (diasTripleEntrenamiento.length >= 10) await desbloquear('el_orgullo_de_philadelphia')

  // Boogeyman — día perfecto después de fallar un día completo
  if (pruebaNueva.diaPerfecto && todasLasPruebas.length >= 2) {
    const pruebas = [...todasLasPruebas].sort((a, b) =>
      String(a.fecha) < String(b.fecha) ? -1 : 1
    )
    const idx = pruebas.findIndex((p) => p.id === pruebaNueva.id)
    if (idx > 0) {
      const anterior = pruebas[idx - 1]
      const pruebasCompletadasAnterior = [
        anterior.soloAgua,
        anterior.sinComidaRapida,
        anterior.pasos >= 10000,
        anterior.horasSueno >= 7,
        anterior.paginasLeidas >= 10,
        anterior.sesionesGym >= 4,
        anterior.sesionesCardio >= 3,
      ].filter(Boolean).length
      if (pruebasCompletadasAnterior === 0) {
        await desbloquear('boogeyman')
      }
    }
  }

  // Cada Intento es un Escape — fallar un día y al siguiente día perfecto
  if (pruebaNueva.diaPerfecto && todasLasPruebas.length >= 2) {
    const pruebas = [...todasLasPruebas].sort((a, b) =>
      String(a.fecha) < String(b.fecha) ? -1 : 1
    )
    const idx = pruebas.findIndex((p) => p.id === pruebaNueva.id)
    if (idx > 0) {
      const anterior = pruebas[idx - 1]
      if (!anterior.diaPerfecto) await desbloquear('cada_intento_es_un_escape')
    }
  }

  // Not My Tempo — gym 6 días consecutivos
  const rachaGymActual = todasLasLlamas.find((l) => l.habitoId === 'gym')?.rachaActual ?? 0
  if (rachaGymActual >= 6) await desbloquear('not_my_tempo')

  // That's What She Said — 7 pruebas un lunes
  if (diaSemana === 1 && pruebaNueva.diaPerfecto) {
    await desbloquear('thats_what_she_said')
  }

  // May the Fourth — día 4 del agon con 7 pruebas
  if (diaActual === 4 && pruebaNueva.diaPerfecto) {
    await desbloquear('may_the_fourth')
  }

  // Daniel San — 7 hábitos los primeros 7 días consecutivos
  if (diaActual <= 7 && pruebaNueva.diaPerfecto) {
    const primerosNDias = todasLasPruebas
      .sort((a, b) => (String(a.fecha) < String(b.fecha) ? -1 : 1))
      .slice(0, 7)
    const todosCompletos =
      primerosNDias.length === 7 && primerosNDias.every((p) => p.diaPerfecto)
    if (todosCompletos) await desbloquear('daniel_san')
  }

  // ¿Cuál es la Primera Regla del Agon? — sin publicar en el Ágora los primeros 7 días
  if (diaActual <= 8 && pruebaNueva.diaPerfecto) {
    const startRaw = process.env.NEXT_PUBLIC_AGON_START_DATE
    const eventosPropio = await db
      .select()
      .from(agoraEventos)
      .where(eq(agoraEventos.agonistId, agonista.id))

    const tienePublicaciones =
      !startRaw ||
      eventosPropio.some((e) => {
        const diaEvento = Math.ceil(
          (new Date(e.createdAt).getTime() - new Date(startRaw).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        return diaEvento <= 7
      })

    if (!tienePublicaciones) {
      const primerosNDias = todasLasPruebas
        .sort((a, b) => (String(a.fecha) < String(b.fecha) ? -1 : 1))
        .slice(0, 7)
      const todosCompletos =
        primerosNDias.length === 7 && primerosNDias.every((p) => p.diaPerfecto)
      if (todosCompletos) await desbloquear('primera_regla_del_agon')
    }
  }

  // Run Agonista Run — 10.000+ pasos 10 días consecutivos
  const diasPasosOrdenados = todasLasPruebas
    .filter((p) => p.pasos >= 10000)
    .map((p) => String(p.fecha))
    .sort()
  if (calcularRachaDias(diasPasosOrdenados) >= 10) await desbloquear('run_agonista_run')

  // Di Hola a mi Pequeño Amigo — mayor kleos diario después del día 20
  if (diaActual > 20) {
    const pruebasAnteriores = todasLasPruebas.filter((p) => p.id !== pruebaNueva.id)
    const maxKleosAnterior =
      pruebasAnteriores.length === 0
        ? 0
        : Math.max(...pruebasAnteriores.map((p) => p.kleosGanado))
    if (pruebaNueva.kleosGanado > maxKleosAnterior) {
      await desbloquear('di_hola_a_mi_pequeno_amigo')
    }
  }

  return desbloqueadas
}

// ─── TRIGGERS EXTERNOS (llamados desde otras rutas) ────────────────────────────

// Gemelos del Agon — ambos completan día perfecto el mismo día
export async function verificarGemelosDelAgan(hoy: string): Promise<void> {
  const ambos = await getAmbosAgonistas()
  if (ambos.length < 2) return

  const [a1, a2] = ambos

  const [p1, p2] = await Promise.all([
    db
      .select()
      .from(pruebasDiarias)
      .where(and(eq(pruebasDiarias.agonistId, a1.id), eq(pruebasDiarias.fecha, hoy)))
      .limit(1),
    db
      .select()
      .from(pruebasDiarias)
      .where(and(eq(pruebasDiarias.agonistId, a2.id), eq(pruebasDiarias.fecha, hoy)))
      .limit(1),
  ])

  if (p1[0]?.diaPerfecto && p2[0]?.diaPerfecto) {
    for (const agonista of ambos) {
      await desbloquearInscripcion(agonista.id, agonista.nombre, 'gemelos_del_agon')
    }
  }
}

// La Piedra del Agon — ambos fallan la misma prueba el mismo día
export async function verificarPiedraDelAgan(hoy: string): Promise<void> {
  const ambos = await getAmbosAgonistas()
  if (ambos.length < 2) return

  const [a1, a2] = ambos

  const [p1, p2] = await Promise.all([
    db
      .select()
      .from(pruebasDiarias)
      .where(and(eq(pruebasDiarias.agonistId, a1.id), eq(pruebasDiarias.fecha, hoy)))
      .limit(1),
    db
      .select()
      .from(pruebasDiarias)
      .where(and(eq(pruebasDiarias.agonistId, a2.id), eq(pruebasDiarias.fecha, hoy)))
      .limit(1),
  ])

  if (!p1[0] || !p2[0]) return

  const pruebas = [
    'soloAgua',
    'sinComidaRapida',
    'pasos',
    'horasSueno',
    'paginasLeidas',
    'sesionesGym',
    'sesionesCardio',
  ] as const
  const metas: Record<string, number | boolean> = {
    soloAgua: true,
    sinComidaRapida: true,
    pasos: 10000,
    horasSueno: 7,
    paginasLeidas: 10,
    sesionesGym: 4,
    sesionesCardio: 3,
  }

  for (const prueba of pruebas) {
    const meta = metas[prueba]
    const fallo1 =
      typeof meta === 'boolean' ? !p1[0][prueba] : (p1[0][prueba] as number) < (meta as number)
    const fallo2 =
      typeof meta === 'boolean' ? !p2[0][prueba] : (p2[0][prueba] as number) < (meta as number)

    if (fallo1 && fallo2) {
      for (const agonista of ambos) {
        await desbloquearInscripcion(agonista.id, agonista.nombre, 'la_piedra_del_agon')
      }
      break
    }
  }
}

// El Espejo — ambos alcanzan el mismo nivel el mismo día
export async function verificarEspejoDelAgan(
  agonistId: string,
  nivelNuevo: string
): Promise<void> {
  const ambos = await getAmbosAgonistas()
  if (ambos.length < 2) return

  const antagonista = ambos.find((a) => a.id !== agonistId)
  if (!antagonista) return

  if (antagonista.nivel === nivelNuevo) {
    for (const agonista of ambos) {
      await desbloquearInscripcion(agonista.id, agonista.nombre, 'el_espejo')
    }
  }
}

// Red Pill or Blue Pill — tú día perfecto, antagonista 0 pruebas
// Algunos Hombres Solo Quieren Ver el Mundo Arder — mismo que Red Pill pero
// se verifica por separado porque son inscripciones distintas
export async function verificarEasterEggsDuales(
  agonistId: string,
  hoy: string
): Promise<void> {
  const ambos = await getAmbosAgonistas()
  if (ambos.length < 2) return

  const yo = ambos.find((a) => a.id === agonistId)
  const antagonista = ambos.find((a) => a.id !== agonistId)
  if (!yo || !antagonista) return

  const [miPrueba, suPrueba] = await Promise.all([
    db
      .select()
      .from(pruebasDiarias)
      .where(and(eq(pruebasDiarias.agonistId, yo.id), eq(pruebasDiarias.fecha, hoy)))
      .limit(1),
    db
      .select()
      .from(pruebasDiarias)
      .where(
        and(eq(pruebasDiarias.agonistId, antagonista.id), eq(pruebasDiarias.fecha, hoy))
      )
      .limit(1),
  ])

  if (!miPrueba[0] || !suPrueba[0]) return

  const susPruebas = [
    suPrueba[0].soloAgua,
    suPrueba[0].sinComidaRapida,
    suPrueba[0].pasos >= 10000,
    suPrueba[0].horasSueno >= 7,
    suPrueba[0].paginasLeidas >= 10,
    suPrueba[0].sesionesGym >= 4,
    suPrueba[0].sesionesCardio >= 3,
  ].filter(Boolean).length

  if (miPrueba[0].diaPerfecto && susPruebas === 0) {
    await desbloquearInscripcion(yo.id, yo.nombre, 'red_pill_or_blue_pill')
    await desbloquearInscripcion(yo.id, yo.nombre, 'algunos_hombres')
  }

  // Don't Let Him Leave Murph — mismas 7 pruebas el mismo día
  const misPruebas = [
    miPrueba[0].soloAgua,
    miPrueba[0].sinComidaRapida,
    miPrueba[0].pasos >= 10000,
    miPrueba[0].horasSueno >= 7,
    miPrueba[0].paginasLeidas >= 10,
    miPrueba[0].sesionesGym >= 4,
    miPrueba[0].sesionesCardio >= 3,
  ]

  const susPruebasArr = [
    suPrueba[0].soloAgua,
    suPrueba[0].sinComidaRapida,
    suPrueba[0].pasos >= 10000,
    suPrueba[0].horasSueno >= 7,
    suPrueba[0].paginasLeidas >= 10,
    suPrueba[0].sesionesGym >= 4,
    suPrueba[0].sesionesCardio >= 3,
  ]

  const mismasPruebas = misPruebas.every((v, i) => v === susPruebasArr[i])
  if (mismasPruebas && miPrueba[0].diaPerfecto) {
    for (const agonista of ambos) {
      await desbloquearInscripcion(agonista.id, agonista.nombre, 'dont_let_him_leave_murph')
    }
  }
}

// La Remontada — recuperar 300 kleos de desventaja (según kleos_log)
export async function verificarRemontada(
  agonistId: string,
  agonistaNombre: string,
  kleosActual: number,
  kleosAntagonista: number
): Promise<void> {
  if (kleosActual <= kleosAntagonista) return
  if (await yaDesbloqueada(agonistId, 'la_remontada')) return

  const ambos = await getAmbosAgonistas()
  const antagonista = ambos.find((a) => a.id !== agonistId)
  if (!antagonista) return

  const [misLogs, susLogs] = await Promise.all([
    db
      .select()
      .from(kleosLog)
      .where(eq(kleosLog.agonistId, agonistId))
      .orderBy(asc(kleosLog.createdAt)),
    db
      .select()
      .from(kleosLog)
      .where(eq(kleosLog.agonistId, antagonista.id))
      .orderBy(asc(kleosLog.createdAt)),
  ])

  if (misLogs.length === 0 || susLogs.length === 0) return

  const todosLogs = [
    ...misLogs.map((l) => ({ ...l, esPropio: true as const })),
    ...susLogs.map((l) => ({ ...l, esPropio: false as const })),
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  let miKleosAcumulado = 0
  let suKleosAcumulado = 0
  let maxDesventaja = 0

  for (const log of todosLogs) {
    if (log.esPropio) {
      miKleosAcumulado += log.cantidad
    } else {
      suKleosAcumulado += log.cantidad
    }

    const desventaja = suKleosAcumulado - miKleosAcumulado
    if (desventaja > maxDesventaja) {
      maxDesventaja = desventaja
    }
  }

  if (maxDesventaja >= 300) {
    await desbloquearInscripcion(agonistId, agonistaNombre, 'la_remontada')
  }
}

// Atrápelos a Todos — 5 inscripciones en 24 horas
export async function verificarAtrapalosATodos(
  agonistId: string,
  agonistaNombre: string
): Promise<void> {
  const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recientes = await db
    .select()
    .from(inscripciones)
    .where(
      and(eq(inscripciones.agonistId, agonistId), gte(inscripciones.desbloqueadoEn, hace24h))
    )

  if (recientes.length >= 5) {
    await desbloquearInscripcion(agonistId, agonistaNombre, 'atrapalos_a_todos')
  }
}

// La Especia Debe Fluir — nivel Semidiós sin fallar agua
export async function verificarEspeciaDebeFluir(
  agonistId: string,
  nivelNuevo: string,
  agonistaNombre: string
): Promise<void> {
  if (nivelNuevo !== 'semidios') return
  if (await yaDesbloqueada(agonistId, 'la_especia_debe_fluir')) return

  const pruebas = await db
    .select()
    .from(pruebasDiarias)
    .where(eq(pruebasDiarias.agonistId, agonistId))

  const nuncaFalloAgua = pruebas.every((p) => p.soloAgua)
  if (nuncaFalloAgua) {
    await desbloquearInscripcion(agonistId, agonistaNombre, 'la_especia_debe_fluir')
  }
}
