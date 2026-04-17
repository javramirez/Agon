import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  calcularYGuardarHegemonia,
  getHegemonias,
  getSemanaActual,
  getAgonistaByClerkId,
  getRetoPorId,
} from '@/lib/db/queries'
import { esSolo } from '@/lib/retos/guards'
import { notificarHegemoniaGanada } from '@/lib/notificaciones/crear'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista?.retoId) {
    return NextResponse.json({ error: 'Sin reto asignado' }, { status: 400 })
  }
  const reto = await getRetoPorId(agonista.retoId)
  if (!reto?.fechaInicio) {
    return NextResponse.json({ error: 'El reto aún no tiene fecha de inicio' }, { status: 400 })
  }
  if (await esSolo(agonista.retoId)) {
    return NextResponse.json(
      { error: 'Hegemonía no disponible en modo solo' },
      { status: 400 }
    )
  }

  const semanaActual = getSemanaActual(reto.fechaInicio)
  await calcularYGuardarHegemonia(semanaActual, reto.id, reto.fechaInicio)
  const hegemonias = await getHegemonias(reto.id)

  return NextResponse.json({ hegemonias })
}

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista?.retoId) {
    return NextResponse.json({ error: 'Sin reto asignado' }, { status: 400 })
  }
  const reto = await getRetoPorId(agonista.retoId)
  if (!reto?.fechaInicio) {
    return NextResponse.json({ error: 'El reto aún no tiene fecha de inicio' }, { status: 400 })
  }
  if (await esSolo(agonista.retoId)) {
    return NextResponse.json(
      { error: 'Hegemonía no disponible en modo solo' },
      { status: 400 }
    )
  }

  const semanaActual = getSemanaActual(reto.fechaInicio)
  const hegemonia = await calcularYGuardarHegemonia(
    semanaActual,
    reto.id,
    reto.fechaInicio
  )

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
