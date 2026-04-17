import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  retos,
  agonistas,
  pruebasDiarias,
  inscripciones,
  kleosLog,
  crisisCiudad,
  calendarioCrisis,
  postsDioses,
  notificaciones,
} from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { getAmbosAgonistas, getSemanaActual } from '@/lib/db/queries'
import { getDiaDelAgan } from '@/lib/utils'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (userId !== process.env.ADMIN_CLERK_ID) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const todosRetos = await db
    .select()
    .from(retos)
    .orderBy(desc(retos.createdAt))

  const retosConDatos = await Promise.all(
    todosRetos.map(async (reto) => {
      const agonistasReto = await getAmbosAgonistas(reto.id)

      const statsAgonistas = await Promise.all(
        agonistasReto.map(async (a) => {
          const [pruebas, insc, logs] = await Promise.all([
            db
              .select({ count: count() })
              .from(pruebasDiarias)
              .where(eq(pruebasDiarias.agonistId, a.id)),
            db
              .select({ count: count() })
              .from(inscripciones)
              .where(eq(inscripciones.agonistId, a.id)),
            db
              .select({ count: count() })
              .from(kleosLog)
              .where(eq(kleosLog.agonistId, a.id)),
          ])
          return {
            id: a.id,
            nombre: a.nombre,
            clerkId: a.clerkId,
            rol: a.rol,
            nivel: a.nivel,
            kleosTotal: a.kleosTotal,
            oraculoSellado: a.oraculoSellado,
            mentorAsignado: a.mentorAsignado,
            diasRegistrados: Number(pruebas[0]?.count ?? 0),
            inscripciones: Number(insc[0]?.count ?? 0),
            logsKleos: Number(logs[0]?.count ?? 0),
          }
        })
      )

      const crisisReto = await db
        .select()
        .from(crisisCiudad)
        .where(eq(crisisCiudad.retoId, reto.id))
        .orderBy(desc(crisisCiudad.createdAt))

      const postsReto = await db.select({ count: count() }).from(postsDioses)

      const fi = reto.fechaInicio
      const diaActual = fi ? getDiaDelAgan(fi) : null
      const semanaActual = fi ? getSemanaActual(fi) : null

      return {
        reto,
        agonistas: statsAgonistas,
        crisis: crisisReto,
        totalPosts: Number(postsReto[0]?.count ?? 0),
        diaActual,
        semanaActual,
      }
    })
  )

  return NextResponse.json({ retos: retosConDatos })
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (userId !== process.env.ADMIN_CLERK_ID) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const body = (await req.json()) as { accion: string; retoId?: string; agonistId?: string }
  const { accion, retoId, agonistId } = body

  switch (accion) {
    case 'activar_reto': {
      if (!retoId) return NextResponse.json({ error: 'Falta retoId' }, { status: 400 })
      await db
        .update(retos)
        .set({ estado: 'activo', updatedAt: new Date() })
        .where(eq(retos.id, retoId))
      return NextResponse.json({ ok: true, mensaje: 'Reto activado' })
    }

    case 'completar_reto': {
      if (!retoId) return NextResponse.json({ error: 'Falta retoId' }, { status: 400 })
      await db
        .update(retos)
        .set({ estado: 'completado', updatedAt: new Date() })
        .where(eq(retos.id, retoId))
      return NextResponse.json({ ok: true, mensaje: 'Reto marcado como completado' })
    }

    case 'resetear_kleos': {
      if (!agonistId) return NextResponse.json({ error: 'Falta agonistId' }, { status: 400 })
      await db
        .update(agonistas)
        .set({ kleosTotal: 0, diasPerfectos: 0, updatedAt: new Date() })
        .where(eq(agonistas.id, agonistId))
      await db.delete(kleosLog).where(eq(kleosLog.agonistId, agonistId))
      return NextResponse.json({ ok: true, mensaje: 'Kleos reseteados' })
    }

    case 'limpiar_notificaciones': {
      if (!agonistId) return NextResponse.json({ error: 'Falta agonistId' }, { status: 400 })
      await db.delete(notificaciones).where(eq(notificaciones.agonistId, agonistId))
      return NextResponse.json({ ok: true, mensaje: 'Notificaciones eliminadas' })
    }

    case 'limpiar_crisis': {
      if (!retoId) return NextResponse.json({ error: 'Falta retoId' }, { status: 400 })
      await db.delete(crisisCiudad).where(eq(crisisCiudad.retoId, retoId))
      await db.delete(calendarioCrisis).where(eq(calendarioCrisis.retoId, retoId))
      return NextResponse.json({ ok: true, mensaje: 'Crisis eliminadas' })
    }

    case 'limpiar_posts_dioses': {
      await db.delete(postsDioses)
      return NextResponse.json({ ok: true, mensaje: 'Posts de dioses eliminados' })
    }

    default:
      return NextResponse.json({ error: 'Acción desconocida' }, { status: 400 })
  }
}
