import { describe, it, expect } from 'vitest'

// Extraída como función pura (no depende de DB).
function asignarMentor(
  arquetipo: 'constante' | 'explosivo' | 'metodico' | 'caotico',
  puntoPartida: 'fecha_limite' | 'reconstruccion' | 'interno' | 'transformacion'
): string {
  if (arquetipo === 'metodico') return 'odiseo'
  if (arquetipo === 'caotico') {
    return puntoPartida === 'interno' ? 'diogenes' : 'dedalo'
  }
  if (arquetipo === 'constante') {
    if (puntoPartida === 'fecha_limite') return 'leonidas'
    if (puntoPartida === 'reconstruccion') return 'hercules'
    return 'quiron'
  }
  // explosivo
  if (puntoPartida === 'fecha_limite') return 'leonidas'
  if (puntoPartida === 'reconstruccion' || puntoPartida === 'interno') return 'hercules'
  return 'dedalo'
}

describe('asignarMentor', () => {
  it('metódico siempre recibe odiseo', () => {
    expect(asignarMentor('metodico', 'fecha_limite')).toBe('odiseo')
    expect(asignarMentor('metodico', 'interno')).toBe('odiseo')
    expect(asignarMentor('metodico', 'transformacion')).toBe('odiseo')
  })

  it('caótico + interno → diogenes', () => {
    expect(asignarMentor('caotico', 'interno')).toBe('diogenes')
  })

  it('caótico + otros → dedalo', () => {
    expect(asignarMentor('caotico', 'fecha_limite')).toBe('dedalo')
    expect(asignarMentor('caotico', 'reconstruccion')).toBe('dedalo')
    expect(asignarMentor('caotico', 'transformacion')).toBe('dedalo')
  })

  it('constante + fecha_limite → leonidas', () => {
    expect(asignarMentor('constante', 'fecha_limite')).toBe('leonidas')
  })

  it('constante + reconstruccion → hercules', () => {
    expect(asignarMentor('constante', 'reconstruccion')).toBe('hercules')
  })

  it('constante + interno/transformacion → quiron', () => {
    expect(asignarMentor('constante', 'interno')).toBe('quiron')
    expect(asignarMentor('constante', 'transformacion')).toBe('quiron')
  })

  it('explosivo + fecha_limite → leonidas', () => {
    expect(asignarMentor('explosivo', 'fecha_limite')).toBe('leonidas')
  })

  it('explosivo + reconstruccion/interno → hercules', () => {
    expect(asignarMentor('explosivo', 'reconstruccion')).toBe('hercules')
    expect(asignarMentor('explosivo', 'interno')).toBe('hercules')
  })

  it('explosivo + transformacion → dedalo', () => {
    expect(asignarMentor('explosivo', 'transformacion')).toBe('dedalo')
  })
})
