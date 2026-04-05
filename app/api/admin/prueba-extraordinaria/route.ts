import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/** La Prueba Extraordinaria V2 es automática (cron). Activación manual deshabilitada. */
export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    return NextResponse.json(
      { error: 'Solo el administrador puede activar esto.' },
      { status: 403 }
    )
  }

  return NextResponse.json(
    {
      error:
        'La Prueba Extraordinaria es automática (Tríptico y Destino). Usa los crons o POST /api/cron/init con CRON_SECRET.',
    },
    { status: 410 }
  )
}
