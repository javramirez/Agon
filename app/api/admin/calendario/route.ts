import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // TODO PROMPT-01: gate CLERK_JAVIER_USER_ID eliminado (PROMPT 03)
  void userId
  return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // TODO PROMPT-01: gate CLERK_JAVIER_USER_ID eliminado (PROMPT 03)
  void userId
  return NextResponse.json({ error: 'No autorizado.' }, { status: 403 })
}
