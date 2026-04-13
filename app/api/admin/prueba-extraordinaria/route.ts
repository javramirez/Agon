import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * La Prueba Extraordinaria V2 es automática (cron). Activación manual deshabilitada.
 * Notificaciones al activar Tríptico/Destino: `notificarAmbosPruebaExtra` en
 * `lib/pruebas-extraordinarias/calendario.ts`.
 */
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
        'La Prueba Extraordinaria es automática (Tríptico y Destino). Genera el calendario en Admin o con POST /api/admin/calendario.',
    },
    { status: 410 }
  )
}
