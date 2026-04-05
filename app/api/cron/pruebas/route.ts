import { NextResponse } from 'next/server'
import {
  activarTripticoDia,
  verificarEventosDestino,
} from '@/lib/pruebas-extraordinarias/calendario'
import { getDiaDelAgan, isGranAgonActivo } from '@/lib/utils'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!isGranAgonActivo()) {
    return NextResponse.json({ ok: true, mensaje: 'Gran Agon inactivo.' })
  }

  const diaActual = getDiaDelAgan()
  const horaActual = new Date().getHours()

  if (horaActual === 8) {
    await activarTripticoDia(diaActual)
  }

  await verificarEventosDestino(diaActual, horaActual)

  return NextResponse.json({
    ok: true,
    diaActual,
    horaActual,
    mensaje: 'Pruebas verificadas.',
  })
}
