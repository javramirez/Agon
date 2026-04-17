import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { addDays, format } from 'date-fns'

// `@/lib/db/queries` importa `@/lib/db` (conexión Neon) al cargar.
// Para testear solo helpers puros de fechas, mockeamos el módulo DB.
vi.mock('@/lib/db', () => ({ db: {} }))

let getSemanaActual: (fechaInicio: string) => number
let getSemanaRango: (
  semana: number,
  fechaInicio: string
) => { inicioSemana: string; finSemana: string }

function fechaStr(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

describe('getSemanaActual', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeAll(async () => {
    const mod = await import('@/lib/db/queries')
    getSemanaActual = mod.getSemanaActual
    getSemanaRango = mod.getSemanaRango
  })

  it('retorna 1 el día de inicio', () => {
    const hoy = fechaStr(new Date())
    expect(getSemanaActual(hoy)).toBe(1)
  })

  it('retorna 1 en el día 7', () => {
    const hace6 = fechaStr(addDays(new Date(), -6))
    expect(getSemanaActual(hace6)).toBe(1)
  })

  it('retorna 2 en el día 8', () => {
    const hace7 = fechaStr(addDays(new Date(), -7))
    expect(getSemanaActual(hace7)).toBe(2)
  })

  it('retorna 4 en el día 22', () => {
    const hace21 = fechaStr(addDays(new Date(), -21))
    expect(getSemanaActual(hace21)).toBe(4)
  })
})

describe('getSemanaRango', () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-15T12:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  beforeAll(async () => {
    const mod = await import('@/lib/db/queries')
    getSemanaActual = mod.getSemanaActual
    getSemanaRango = mod.getSemanaRango
  })

  it('semana 1 arranca en fecha inicio', () => {
    const hoy = fechaStr(new Date())
    const { inicioSemana } = getSemanaRango(1, hoy)
    expect(inicioSemana).toBe(hoy)
  })

  it('semana 1 termina 6 días después', () => {
    const hoy = fechaStr(new Date())
    const { finSemana } = getSemanaRango(1, hoy)
    const esperado = fechaStr(addDays(new Date(), 6))
    expect(finSemana).toBe(esperado)
  })

  it('semana 2 arranca 7 días después del inicio', () => {
    const hoy = fechaStr(new Date())
    const { inicioSemana } = getSemanaRango(2, hoy)
    const esperado = fechaStr(addDays(new Date(), 7))
    expect(inicioSemana).toBe(esperado)
  })
})
