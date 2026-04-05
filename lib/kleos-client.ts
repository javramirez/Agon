// Réplica client-side de la lógica de kleos del servidor
// Permite calcular el kleos localmente sin esperar al servidor

import {
  KLEOS_POR_PRUEBA,
  KLEOS_DIA_PERFECTO,
  KLEOS_DIA_PERFECTO_NIVEL_9,
} from '@/lib/db/constants'

export const KLEOS_BASE = {
  agua: KLEOS_POR_PRUEBA.agua.base,
  comida: KLEOS_POR_PRUEBA.comida.base,
  pasos: KLEOS_POR_PRUEBA.pasos.base,
  sueno: KLEOS_POR_PRUEBA.sueno.base,
  lectura: KLEOS_POR_PRUEBA.lectura.base,
  gym: KLEOS_POR_PRUEBA.gym.base,
  cardio: KLEOS_POR_PRUEBA.cardio.base,
} as const

export { KLEOS_DIA_PERFECTO, KLEOS_DIA_PERFECTO_NIVEL_9 }

export interface EstadoPruebas {
  soloAgua: boolean
  sinComidaRapida: boolean
  pasos: number
  horasSueno: number
  paginasLeidas: number
  sesionesGym: number
  sesionesCardio: number
}

export function calcularKleosLocal(
  estado: EstadoPruebas,
  multiplicadorRacha: number = 1,
  multiplicadorSagrado: number = 1,
  nivel: string = 'aspirante'
): number {
  const mult = multiplicadorRacha * multiplicadorSagrado
  let total = 0
  const k = KLEOS_POR_PRUEBA

  if (estado.soloAgua) total += Math.round(k.agua.base * mult)
  if (estado.sinComidaRapida) total += Math.round(k.comida.base * mult)
  if (estado.pasos >= 10000) total += Math.round(k.pasos.base * mult)
  if (estado.horasSueno >= 7) total += Math.round(k.sueno.base * mult)
  if (estado.paginasLeidas >= 10) total += Math.round(k.lectura.base * mult)
  if (estado.sesionesGym >= 4) total += Math.round(k.gym.base * mult)
  if (estado.sesionesCardio >= 3) total += Math.round(k.cardio.base * mult)

  if (esDiaPerfectoLocal(estado)) {
    const bonus =
      nivel === 'leyenda_del_agon' || nivel === 'inmortal'
        ? KLEOS_DIA_PERFECTO_NIVEL_9
        : KLEOS_DIA_PERFECTO
    total += bonus
  }

  return total
}

export function esDiaPerfectoLocal(estado: EstadoPruebas): boolean {
  return (
    estado.soloAgua &&
    estado.sinComidaRapida &&
    estado.pasos >= 10000 &&
    estado.horasSueno >= 7 &&
    estado.paginasLeidas >= 10 &&
    estado.sesionesGym >= 4 &&
    estado.sesionesCardio >= 3
  )
}

export function aplicarCambio(
  estado: EstadoPruebas,
  campo: string,
  valor: boolean | number
): EstadoPruebas {
  return { ...estado, [campoToKey(campo)]: valor }
}

function campoToKey(campo: string): keyof EstadoPruebas {
  const map: Record<string, keyof EstadoPruebas> = {
    soloAgua: 'soloAgua',
    sinComidaRapida: 'sinComidaRapida',
    pasos: 'pasos',
    horasSueno: 'horasSueno',
    paginasLeidas: 'paginasLeidas',
    sesionesGym: 'sesionesGym',
    sesionesCardio: 'sesionesCardio',
  }
  return map[campo] ?? (campo as keyof EstadoPruebas)
}
