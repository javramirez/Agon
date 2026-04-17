import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { retos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentAgonista } from '@/lib/auth'
import { getRetoPorId } from '@/lib/db/queries'

function opcionesFecha(): string[] {
  const hoy = new Date()
  return [0, 1, 2].map((offset) => {
    const d = new Date(hoy)
    d.setDate(d.getDate() + offset)
    return d.toISOString().split('T')[0]!
  })
}

function fechaValida(fecha: string): boolean {
  return opcionesFecha().includes(fecha)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getCurrentAgonista()
  if (!agonista?.retoId) {
    return NextResponse.json({ error: 'Sin reto asignado' }, { status: 400 })
  }

  const reto = await getRetoPorId(agonista.retoId)
  if (!reto) {
    return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 })
  }
  if (reto.estado !== 'configurando') {
    return NextResponse.json({ error: 'El reto ya tiene fecha confirmada' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const { accion, fecha } = body as { accion: string; fecha: string }

  if (!fecha || !fechaValida(fecha)) {
    return NextResponse.json(
      { error: 'Fecha inválida. Debe ser hoy, mañana o pasado mañana.' },
      { status: 400 }
    )
  }

  const esCreador = reto.creadorClerkId === userId
  const esInvitado = reto.invitadoClerkId === userId

  if (!esCreador && !esInvitado) {
    return NextResponse.json({ error: 'No perteneces a este reto' }, { status: 403 })
  }

  const fechaInicio = new Date(`${fecha}T12:00:00`)
  const fechaFin = new Date(fechaInicio)
  fechaFin.setDate(fechaFin.getDate() + 28)
  const fechaFinStr = fechaFin.toISOString().split('T')[0]!

  try {
    if (reto.modo === 'solo') {
      await db
        .update(retos)
        .set({
          fechaInicio: fecha,
          fechaFin: fechaFinStr,
          fechaConfirmadaPorCreador: true,
          fechaConfirmadaPorInvitado: true,
          estado: 'programado',
          updatedAt: new Date(),
        })
        .where(eq(retos.id, reto.id))

      return NextResponse.json({ ok: true, estado: 'programado' })
    }

    if (accion === 'proponer' && esCreador) {
      await db
        .update(retos)
        .set({
          fechaInicio: fecha,
          fechaFin: fechaFinStr,
          fechaConfirmadaPorCreador: true,
          fechaConfirmadaPorInvitado: false,
          updatedAt: new Date(),
        })
        .where(eq(retos.id, reto.id))

      return NextResponse.json({ ok: true, estado: 'esperando_confirmacion' })
    }

    if (accion === 'confirmar' && esInvitado) {
      if (!reto.fechaInicio) {
        return NextResponse.json(
          { error: 'El creador aún no ha propuesto una fecha' },
          { status: 400 }
        )
      }
      if (fecha !== reto.fechaInicio) {
        return NextResponse.json(
          { error: 'La fecha no coincide con la propuesta' },
          { status: 400 }
        )
      }
      await db
        .update(retos)
        .set({
          fechaConfirmadaPorInvitado: true,
          estado: 'programado',
          updatedAt: new Date(),
        })
        .where(eq(retos.id, reto.id))

      return NextResponse.json({ ok: true, estado: 'programado' })
    }

    if (accion === 'alternativa' && esInvitado) {
      await db
        .update(retos)
        .set({
          fechaInicio: fecha,
          fechaFin: fechaFinStr,
          fechaConfirmadaPorCreador: false,
          fechaConfirmadaPorInvitado: true,
          updatedAt: new Date(),
        })
        .where(eq(retos.id, reto.id))

      return NextResponse.json({ ok: true, estado: 'esperando_confirmacion_creador' })
    }

    if (accion === 'confirmar' && esCreador) {
      if (!reto.fechaInicio) {
        return NextResponse.json(
          { error: 'No hay fecha alternativa que confirmar' },
          { status: 400 }
        )
      }
      if (fecha !== reto.fechaInicio) {
        return NextResponse.json(
          { error: 'La fecha no coincide con la alternativa propuesta' },
          { status: 400 }
        )
      }
      await db
        .update(retos)
        .set({
          fechaConfirmadaPorCreador: true,
          estado: 'programado',
          updatedAt: new Date(),
        })
        .where(eq(retos.id, reto.id))

      return NextResponse.json({ ok: true, estado: 'programado' })
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
  } catch (error) {
    console.error('Error actualizando fecha:', error)
    return NextResponse.json({ error: 'Error al guardar la fecha' }, { status: 500 })
  }
}
