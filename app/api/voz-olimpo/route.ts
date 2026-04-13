import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getCurrentAgonista } from '@/lib/auth'
import { detectarSeñal } from '@/lib/dioses/voz-olimpo/detectar'
import { generarPostVozOlimpo } from '@/lib/dioses/voz-olimpo/generar'

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

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    return NextResponse.json({ error: 'Solo admin' }, { status: 403 })
  }

  const agonista = await getCurrentAgonista()
  if (!agonista) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  const señal = await detectarSeñal(agonista.id)
  if (!señal) return NextResponse.json({ ok: false, mensaje: 'Sin señal detectada' })

  const post = await generarPostVozOlimpo(señal)
  return NextResponse.json({ ok: true, señal, post })
}
