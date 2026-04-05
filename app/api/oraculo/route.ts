import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { sellarOraculo } from '@/lib/db/queries'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { mensaje } = await req.json()
  if (!mensaje || mensaje.trim().length < 10) {
    return NextResponse.json(
      { error: 'El Oráculo requiere al menos 10 caracteres.' },
      { status: 400 }
    )
  }

  try {
    await sellarOraculo(userId, mensaje.trim())
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
