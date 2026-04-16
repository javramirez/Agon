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

  // TODO PROMPT-01: gate CLERK_JAVIER_USER_ID eliminado (PROMPT 03)
  void userId
  return NextResponse.json(
    { error: 'No autorizado.' },
    { status: 403 }
  )
}
