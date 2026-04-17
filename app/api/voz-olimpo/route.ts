import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getCurrentAgonista } from '@/lib/auth'
import { getRetoPorId } from '@/lib/db/queries'
import { detectarSeñal } from '@/lib/dioses/voz-olimpo/detectar'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getCurrentAgonista()
  if (!agonista) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const reto = agonista.retoId ? await getRetoPorId(agonista.retoId) : null
  const esSolo = reto?.modo === 'solo'

  const fechaInicioReto =
    reto?.fechaInicio == null
      ? undefined
      : typeof reto.fechaInicio === 'string'
        ? reto.fechaInicio
        : (reto.fechaInicio as Date).toISOString().slice(0, 10)

  const señal = await detectarSeñal(agonista.id, esSolo, fechaInicioReto)
  return NextResponse.json({ señal })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // TODO PROMPT-01: gate CLERK_JAVIER_USER_ID eliminado — PROMPT 03: rol admin
  return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
}
