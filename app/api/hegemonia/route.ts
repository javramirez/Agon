import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  calcularYGuardarHegemonia,
  getHegemonias,
  getSemanaActual,
} from '@/lib/db/queries'
import { notificarHegemoniaGanada } from '@/lib/notificaciones/crear'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const semanaActual = getSemanaActual()
  await calcularYGuardarHegemonia(semanaActual)
  const hegemonias = await getHegemonias()

  return NextResponse.json({ hegemonias })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const semanaActual = getSemanaActual()
  const hegemonia = await calcularYGuardarHegemonia(semanaActual)

  if (hegemonia && hegemonia.ganadorId && !hegemonia.empate) {
    void (async () => {
      try {
        await notificarHegemoniaGanada(
          hegemonia.ganadorId!,
          hegemonia.semana,
          hegemonia.kleosGanador
        )
      } catch {
        // Silencioso
      }
    })()
  }

  return NextResponse.json({ hegemonia })
}
