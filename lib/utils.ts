import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, isSameDay, parseISO, startOfDay } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDiaDelAgan(): number {
  const inicio = parseISO(process.env.NEXT_PUBLIC_AGON_START_DATE!)
  const hoy = new Date()
  const diff = differenceInDays(hoy, inicio) + 1
  return Math.max(1, Math.min(diff, 29))
}

export function getDiasRestantes(): number {
  const fin = parseISO(process.env.NEXT_PUBLIC_AGON_END_DATE!)
  const hoy = new Date()
  return Math.max(0, differenceInDays(fin, hoy))
}

export function isGranAgonActivo(): boolean {
  const inicio = parseISO(process.env.NEXT_PUBLIC_AGON_START_DATE!)
  const fin = parseISO(process.env.NEXT_PUBLIC_AGON_END_DATE!)
  const hoy = new Date()
  return hoy >= inicio && hoy <= fin
}

/** Día de La Ceremonia del Veredicto — activa desde el día 29 en adelante. */
export function isVeredictoDay(): boolean {
  const fin = parseISO(process.env.NEXT_PUBLIC_AGON_END_DATE!)
  const hoy = startOfDay(new Date())
  return hoy >= startOfDay(fin)
}

/** Retorna true únicamente el día 29 del Gran Agon. */
export function isUltimoDia(): boolean {
  const fin = parseISO(process.env.NEXT_PUBLIC_AGON_END_DATE!)
  const hoy = new Date()
  return isSameDay(startOfDay(hoy), startOfDay(fin))
}

export function formatKleos(cantidad: number): string {
  return cantidad.toLocaleString('es-CL')
}

export function calcularAdherencia(
  pruebasCompletadas: number,
  pruebasTotales: number
): number {
  if (pruebasTotales === 0) return 0
  return Math.round((pruebasCompletadas / pruebasTotales) * 100)
}

export function getMensajeHora(): string {
  const hora = new Date().getHours()
  if (hora < 7) return 'El agonista que madruga gana la mitad del agon.'
  if (hora < 12) return 'La mañana es tuya. El agon también.'
  if (hora < 17)
    return 'La tarde es donde se separan los agonistas de los aspirantes.'
  if (hora < 20) return 'Quedan horas. El Altis sigue contando.'
  if (hora < 22) return 'El agon de hoy aún puede ser tuyo.'
  return 'El tiempo se acaba. El Altis espera.'
}
