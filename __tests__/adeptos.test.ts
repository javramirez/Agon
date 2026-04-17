import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  calcularLikesAdeptos,
  calcularLikesAdeptosDuelo,
  getTierFromLikes,
} from '@/lib/facciones/adeptos'

describe('calcularLikesAdeptos', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('R5 Gremio + semana_sagrada produce ~7.500–8.400 likes (población visible 8400 × engagement)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const likes = calcularLikesAdeptos(
      [{ faccionId: 'gremio_tierra', puntos: 160 }],
      'semana_sagrada',
      false
    )
    // Engagement medio 0.95 → floor(8400 * 0.95) = 7980
    expect(likes).toBe(7980)
    expect(likes).toBeGreaterThanOrEqual(7560)
    expect(likes).toBeLessThanOrEqual(8400)
  })

  it('R1 en todas las facciones → 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const todas = [
      { faccionId: 'guardia_hierro' as const, puntos: 0 },
      { faccionId: 'gremio_tierra' as const, puntos: 10 },
      { faccionId: 'corredores_alba' as const, puntos: 15 },
    ]
    expect(calcularLikesAdeptos(todas, 'dia_perfecto', false)).toBe(0)
  })

  it('esSolo true ignora Hermandad del Caos (Eris)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const solo = [{ faccionId: 'hermandad_caos' as const, puntos: 200 }]
    expect(calcularLikesAdeptos(solo, 'semana_sagrada', true)).toBe(0)
    const duelo = [{ faccionId: 'hermandad_caos' as const, puntos: 200 }]
    expect(calcularLikesAdeptos(duelo, 'semana_sagrada', false)).toBeGreaterThan(0)
  })
})

describe('getTierFromLikes', () => {
  it('devuelve tier esperado por umbrales', () => {
    expect(getTierFromLikes(0)).toBe(1)
    expect(getTierFromLikes(300)).toBe(2)
    expect(getTierFromLikes(25000)).toBe(5)
  })
})

describe('calcularLikesAdeptosDuelo', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('suma autor + traidores del rival (mock random)', () => {
    let n = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      n += 1
      // 1: engagement autor, 2: engagement traidores, 3: tasa traición
      if (n === 1) return 0.5
      if (n === 2) return 0.5
      if (n === 3) return 0.5
      return 0
    })
    const autor = [{ faccionId: 'gremio_tierra' as const, puntos: 160 }]
    const rival = [{ faccionId: 'guardia_hierro' as const, puntos: 160 }]
    const total = calcularLikesAdeptosDuelo(autor, rival, 'semana_sagrada')
    expect(total).toBeGreaterThan(7980)
  })
})
