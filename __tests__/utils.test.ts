import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { addDays, format, parseISO } from 'date-fns'
import {
  getDiaDelAgan,
  getDiasRestantes,
  isUltimoDia,
  isVeredictoDay,
} from '@/lib/utils'

function fechaStr(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

describe('getDiaDelAgan', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    // Mediodía UTC para evitar bordes de zona horaria.
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('retorna 1 el día de inicio', () => {
    const hoy = fechaStr(new Date())
    expect(getDiaDelAgan(hoy)).toBe(1)
  })

  it('retorna 2 al día siguiente del inicio', () => {
    const ayer = fechaStr(addDays(new Date(), -1))
    expect(getDiaDelAgan(ayer)).toBe(2)
  })

  it('retorna 29 en el último día', () => {
    const hace28 = fechaStr(addDays(new Date(), -28))
    expect(getDiaDelAgan(hace28)).toBe(29)
  })

  it('no supera 29 aunque pasen más días', () => {
    const hace40 = fechaStr(addDays(new Date(), -40))
    expect(getDiaDelAgan(hace40)).toBe(29)
  })

  it('no baja de 1 con fecha futura', () => {
    const manana = fechaStr(addDays(new Date(), 1))
    expect(getDiaDelAgan(manana)).toBe(1)
  })
})

describe('getDiasRestantes', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('retorna 28 el primer día', () => {
    const hoy = fechaStr(new Date())
    expect(getDiasRestantes(hoy)).toBe(28)
  })

  it('retorna 0 el último día', () => {
    const hace28 = fechaStr(addDays(new Date(), -28))
    expect(getDiasRestantes(hace28)).toBe(0)
  })
})

describe('isUltimoDia', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('retorna false el día 1', () => {
    const hoy = fechaStr(new Date())
    expect(isUltimoDia(hoy)).toBe(false)
  })

  it('retorna true el día 29', () => {
    const hace28 = fechaStr(addDays(new Date(), -28))
    expect(isUltimoDia(hace28)).toBe(true)
  })
})

describe('isVeredictoDay', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it('retorna false antes del día 29', () => {
    const hace10 = fechaStr(addDays(new Date(), -10))
    expect(isVeredictoDay(hace10)).toBe(false)
  })

  it('retorna true el día 29', () => {
    const hace28 = fechaStr(addDays(new Date(), -28))
    expect(isVeredictoDay(hace28)).toBe(true)
  })

  it('retorna true después del día 29', () => {
    const hace35 = fechaStr(addDays(new Date(), -35))
    expect(isVeredictoDay(hace35)).toBe(true)
  })
})

describe('parseISO sanity', () => {
  it('acepta yyyy-MM-dd', () => {
    expect(() => parseISO('2026-01-15')).not.toThrow()
  })
})
