import { NextResponse } from 'next/server'
import { generarCalendarioAgan } from '@/lib/pruebas-extraordinarias/calendario'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    await generarCalendarioAgan()
    return NextResponse.json({
      ok: true,
      mensaje: 'Calendario del Gran Agon generado.',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
