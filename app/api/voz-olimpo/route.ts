import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getCurrentAgonista } from '@/lib/auth'
import { detectarSeñal } from '@/lib/dioses/voz-olimpo/detectar'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getCurrentAgonista()
  if (!agonista) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const señal = await detectarSeñal(agonista.id)
  return NextResponse.json({ señal })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // TODO PROMPT-01: gate CLERK_JAVIER_USER_ID eliminado — PROMPT 03: rol admin
  return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
}
