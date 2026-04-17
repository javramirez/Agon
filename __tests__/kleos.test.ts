import { describe, it, expect } from 'vitest'
import { KLEOS_POR_PRUEBA, KLEOS_DIA_PERFECTO } from '@/lib/db/constants'

// Función pura de cálculo de kleos — espejo del cálculo del route.
function calcularKleosDia(params: {
  soloAgua: boolean
  sinComidaRapida: boolean
  pasos: number
  horasSueno: number
  paginasLeidas: number
  sesionesGym: number
  sesionesCardio: number
  tieneRacha: boolean
  esSemanasagrada: boolean
}): number {
  const {
    soloAgua,
    sinComidaRapida,
    pasos,
    horasSueno,
    paginasLeidas,
    sesionesGym,
    sesionesCardio,
    tieneRacha,
    esSemanasagrada,
  } = params

  let total = 0
  const k = KLEOS_POR_PRUEBA

  if (soloAgua) total += tieneRacha ? k.agua.conRacha : k.agua.base
  if (sinComidaRapida) total += tieneRacha ? k.comida.conRacha : k.comida.base
  if (pasos >= 10000) total += tieneRacha ? k.pasos.conRacha : k.pasos.base
  if (horasSueno >= 7) total += tieneRacha ? k.sueno.conRacha : k.sueno.base
  if (paginasLeidas >= 10) total += tieneRacha ? k.lectura.conRacha : k.lectura.base
  if (sesionesGym >= 4) total += tieneRacha ? k.gym.conRacha : k.gym.base
  if (sesionesCardio >= 3) total += tieneRacha ? k.cardio.conRacha : k.cardio.base

  const esDiaPerfecto =
    soloAgua &&
    sinComidaRapida &&
    pasos >= 10000 &&
    horasSueno >= 7 &&
    paginasLeidas >= 10 &&
    sesionesGym >= 4 &&
    sesionesCardio >= 3

  if (esDiaPerfecto) total += KLEOS_DIA_PERFECTO

  if (esSemanasagrada) total *= 2

  return total
}

describe('calcularKleosDia', () => {
  it('día vacío retorna 0 kleos', () => {
    expect(
      calcularKleosDia({
        soloAgua: false,
        sinComidaRapida: false,
        pasos: 0,
        horasSueno: 0,
        paginasLeidas: 0,
        sesionesGym: 0,
        sesionesCardio: 0,
        tieneRacha: false,
        esSemanasagrada: false,
      })
    ).toBe(0)
  })

  it('solo agua sin racha = 10 kleos', () => {
    expect(
      calcularKleosDia({
        soloAgua: true,
        sinComidaRapida: false,
        pasos: 0,
        horasSueno: 0,
        paginasLeidas: 0,
        sesionesGym: 0,
        sesionesCardio: 0,
        tieneRacha: false,
        esSemanasagrada: false,
      })
    ).toBe(10)
  })

  it('solo agua con racha = 15 kleos', () => {
    expect(
      calcularKleosDia({
        soloAgua: true,
        sinComidaRapida: false,
        pasos: 0,
        horasSueno: 0,
        paginasLeidas: 0,
        sesionesGym: 0,
        sesionesCardio: 0,
        tieneRacha: true,
        esSemanasagrada: false,
      })
    ).toBe(15)
  })

  it('día perfecto sin racha = 155 kleos', () => {
    // 10+10+20+15+15+30+25 = 125; +30 día perfecto = 155
    expect(
      calcularKleosDia({
        soloAgua: true,
        sinComidaRapida: true,
        pasos: 10000,
        horasSueno: 7,
        paginasLeidas: 10,
        sesionesGym: 4,
        sesionesCardio: 3,
        tieneRacha: false,
        esSemanasagrada: false,
      })
    ).toBe(155)
  })

  it('semana sagrada duplica el total', () => {
    const sinSagrada = calcularKleosDia({
      soloAgua: true,
      sinComidaRapida: false,
      pasos: 0,
      horasSueno: 0,
      paginasLeidas: 0,
      sesionesGym: 0,
      sesionesCardio: 0,
      tieneRacha: false,
      esSemanasagrada: false,
    })
    const conSagrada = calcularKleosDia({
      soloAgua: true,
      sinComidaRapida: false,
      pasos: 0,
      horasSueno: 0,
      paginasLeidas: 0,
      sesionesGym: 0,
      sesionesCardio: 0,
      tieneRacha: false,
      esSemanasagrada: true,
    })
    expect(conSagrada).toBe(sinSagrada * 2)
  })

  it('pasos bajo meta no suman kleos', () => {
    expect(
      calcularKleosDia({
        soloAgua: false,
        sinComidaRapida: false,
        pasos: 9999,
        horasSueno: 0,
        paginasLeidas: 0,
        sesionesGym: 0,
        sesionesCardio: 0,
        tieneRacha: false,
        esSemanasagrada: false,
      })
    ).toBe(0)
  })
})
