export const DIA_CONSULTA = 15

// Mapeo arquetipo → mentor — igual que en el Pacto Inicial
export const MENTOR_POR_ARQUETIPO: Record<string, Record<string, string>> = {
  metodico: {
    default: 'odiseo',
  },
  caotico: {
    interno: 'diogenes',
    default: 'dedalo',
  },
  constante: {
    fecha_limite: 'leonidas',
    reconstruccion: 'hercules',
    default: 'quiron',
  },
  explosivo: {
    fecha_limite: 'leonidas',
    reconstruccion: 'hercules',
    interno: 'hercules',
    transformacion: 'dedalo',
    default: 'leonidas',
  },
}

export function getMentorParaArquetipo(
  arquetipo: string,
  puntoPartida: string
): string {
  const mapa = MENTOR_POR_ARQUETIPO[arquetipo]
  if (!mapa) return 'quiron'
  return mapa[puntoPartida] ?? mapa['default'] ?? 'quiron'
}

export const OPCIONES_CAMBIO: Array<{
  valor: string
  label: string
  descripcion: string
  arquetipoResultante: string | null
}> = [
  {
    valor: 'mas_disciplinado',
    label: 'Soy más disciplinado de lo que creía',
    descripcion: 'La constancia llegó sola. No la forcé.',
    arquetipoResultante: 'constante',
  },
  {
    valor: 'mejor_presion',
    label: 'Funciono mejor bajo presión de lo que pensaba',
    descripcion: 'El límite me activa, no me paraliza.',
    arquetipoResultante: 'explosivo',
  },
  {
    valor: 'necesito_estructura',
    label: 'Necesito más estructura de la que tenía',
    descripcion: 'El caos me costó más de lo que esperaba.',
    arquetipoResultante: 'metodico',
  },
  {
    valor: 'caos_funciona',
    label: 'El caos me funciona mejor de lo que admití',
    descripcion: 'Los sistemas rígidos me asfixian.',
    arquetipoResultante: 'caotico',
  },
  {
    valor: 'sin_cambio',
    label: 'No ha cambiado nada esencial',
    descripcion: 'Sigo siendo el mismo que firmó el Pacto.',
    arquetipoResultante: null,
  },
]

export function esDia15(startDate: string): boolean {
  const inicio = new Date(`${startDate}T12:00:00`)
  const hoy = new Date()
  const diff = Math.floor(
    (hoy.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)
  )
  return diff === DIA_CONSULTA - 1 // día 15 = índice 14
}

export function consultaDisponible(
  startDate: string,
  consultaCompleta: boolean
): boolean {
  if (consultaCompleta) return false
  return esDia15(startDate)
}

/** Fecha local YYYY-MM-DD desde `pacto_inicial.completado_en` (Drizzle suele devolver `Date`). */
export function pactoCompletadoToDateStr(
  completadoEn: Date | string | null | undefined
): string | null {
  if (completadoEn == null) return null
  if (typeof completadoEn === 'string') return completadoEn.slice(0, 10)
  return completadoEn.toISOString().slice(0, 10)
}
