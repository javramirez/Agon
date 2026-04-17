import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  pruebasDiarias,
  inscripciones,
  mentorConversaciones,
  faccionesAfinidad,
  kleosLog,
} from '@/lib/db/schema'
import type { Agonista, PruebaDiaria } from '@/lib/db/schema'
import { and, eq, gte } from 'drizzle-orm'
import {
  getAgonistaByClerkId,
  getAmbosAgonistas,
  getAgoraEventos,
  getHegemonias,
  getRetoPorId,
} from '@/lib/db/queries'
import { NIVEL_LABELS, INSCRIPCIONES } from '@/lib/db/constants'
import type { NivelKey } from '@/lib/db/constants'

type InscripcionRow = typeof inscripciones.$inferSelect
type MentorConvRow = typeof mentorConversaciones.$inferSelect
type FaccionAfinidadRow = typeof faccionesAfinidad.$inferSelect
type KleosLogRow = typeof kleosLog.$inferSelect

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista?.retoId) {
    return NextResponse.json({ error: 'Sin reto asignado' }, { status: 400 })
  }

  const retoExport = await getRetoPorId(agonista.retoId)
  if (!retoExport) {
    return NextResponse.json({ error: 'Reto no encontrado' }, { status: 404 })
  }

  const fechaInicioExport = retoExport.fechaInicio ?? ''
  const fechaFinExport = retoExport.fechaFin ?? ''
  const fechaInicioFiltro = retoExport.fechaInicio ?? '2000-01-01'

  function buildAgonistaExport(
    ag: Agonista,
    pruebas: PruebaDiaria[],
    insc: InscripcionRow[],
    conversaciones: MentorConvRow[],
    afinidad: FaccionAfinidadRow[],
    logs: KleosLogRow[]
  ) {
    const inscripcionesDetalle = insc.map((i) => {
      const catalogo = INSCRIPCIONES.find((c) => c.id === i.inscripcionId)
      return {
        id: i.inscripcionId,
        nombre: catalogo?.nombre ?? i.inscripcionId,
        tipo: catalogo?.tipo ?? 'publica',
        desbloqueadoEn: i.desbloqueadoEn,
      }
    })

    return {
      nombre: ag.nombre,
      nivel: NIVEL_LABELS[ag.nivel as NivelKey],
      kleosTotal: ag.kleosTotal,
      mentorAsignado: ag.mentorAsignado,
      oraculo: ag.oraculoMensaje,
      stats: {
        diasRegistrados: pruebas.length,
        diasPerfectos: pruebas.filter((p) => p.diaPerfecto).length,
        totalPaginas: pruebas.reduce((s, p) => s + (p.paginasLeidas ?? 0), 0),
        totalPasos: pruebas.reduce((s, p) => s + (p.pasos ?? 0), 0),
        horasSuenoPromedio: pruebas.length
          ? Math.round((pruebas.reduce((s, p) => s + (p.horasSueno ?? 0), 0) / pruebas.length) * 10) / 10
          : 0,
        sesionesGymTotal: pruebas.reduce((s, p) => s + (p.sesionesGym ?? 0), 0),
        sesionesCardioTotal: pruebas.reduce((s, p) => s + (p.sesionesCardio ?? 0), 0),
        diasSoloAgua: pruebas.filter((p) => p.soloAgua).length,
        diasSinComidaRapida: pruebas.filter((p) => p.sinComidaRapida).length,
      },
      pruebas: pruebas.sort((a, b) => (String(a.fecha) < String(b.fecha) ? -1 : 1)),
      inscripciones: inscripcionesDetalle,
      afinidadFacciones: afinidad,
      kleosLog: logs.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
      conversacionesMentor: conversaciones.map((c) => ({
        rol: c.rol,
        contenido: c.contenido,
        fecha: c.createdAt,
      })),
    }
  }

  const pruebaDesdeInicio = (agonistId: string) =>
    and(
      eq(pruebasDiarias.agonistId, agonistId),
      gte(pruebasDiarias.fecha, fechaInicioFiltro)
    )

  if (retoExport.modo === 'solo') {
    const [pruebasSolo, inscripcionesSolo, conversacionesSolo, eventosAgora, afinidadSolo, kleosLogSolo] =
      await Promise.all([
        db.select().from(pruebasDiarias).where(pruebaDesdeInicio(agonista.id)),
        db.select().from(inscripciones).where(eq(inscripciones.agonistId, agonista.id)),
        db.select().from(mentorConversaciones).where(eq(mentorConversaciones.agonistId, agonista.id)),
        getAgoraEventos(agonista.retoId, 5000),
        db.select().from(faccionesAfinidad).where(eq(faccionesAfinidad.agonistId, agonista.id)),
        db.select().from(kleosLog).where(eq(kleosLog.agonistId, agonista.id)),
      ])

    const datos = {
      modo: 'solo' as const,
      exportadoEn: new Date().toISOString(),
      granAgon: {
        inicio: fechaInicioExport,
        fin: fechaFinExport,
        duracionDias: 29,
      },
      eventosAgora: eventosAgora.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
      agonistas: [
        buildAgonistaExport(
          agonista,
          pruebasSolo,
          inscripcionesSolo,
          conversacionesSolo,
          afinidadSolo,
          kleosLogSolo
        ),
      ],
    }

    return new NextResponse(JSON.stringify(datos, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="gran-agon-datos.json"',
      },
    })
  }

  const ambos = await getAmbosAgonistas(agonista.retoId)
  if (ambos.length < 2) {
    return NextResponse.json({ error: 'Faltan agonistas' }, { status: 400 })
  }

  const [a1, a2] = ambos

  const [
    pruebas1,
    pruebas2,
    inscripciones1,
    inscripciones2,
    todasHegemonias,
    conversaciones1,
    conversaciones2,
    eventosAgora,
    afinidad1,
    afinidad2,
    kleosLog1,
    kleosLog2,
  ] = await Promise.all([
    db.select().from(pruebasDiarias).where(pruebaDesdeInicio(a1.id)),
    db.select().from(pruebasDiarias).where(pruebaDesdeInicio(a2.id)),
    db.select().from(inscripciones).where(eq(inscripciones.agonistId, a1.id)),
    db.select().from(inscripciones).where(eq(inscripciones.agonistId, a2.id)),
    getHegemonias(agonista.retoId),
    db.select().from(mentorConversaciones).where(eq(mentorConversaciones.agonistId, a1.id)),
    db.select().from(mentorConversaciones).where(eq(mentorConversaciones.agonistId, a2.id)),
    getAgoraEventos(agonista.retoId, 5000),
    db.select().from(faccionesAfinidad).where(eq(faccionesAfinidad.agonistId, a1.id)),
    db.select().from(faccionesAfinidad).where(eq(faccionesAfinidad.agonistId, a2.id)),
    db.select().from(kleosLog).where(eq(kleosLog.agonistId, a1.id)),
    db.select().from(kleosLog).where(eq(kleosLog.agonistId, a2.id)),
  ])

  const datos = {
    modo: 'duelo' as const,
    exportadoEn: new Date().toISOString(),
    granAgon: {
      inicio: fechaInicioExport,
      fin: fechaFinExport,
      duracionDias: 29,
    },
    ganador:
      a1.kleosTotal > a2.kleosTotal
        ? a1.nombre
        : a2.kleosTotal > a1.kleosTotal
          ? a2.nombre
          : 'Empate',
    hegemonias: todasHegemonias,
    eventosAgora: eventosAgora.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ),
    agonistas: [
      buildAgonistaExport(a1, pruebas1, inscripciones1, conversaciones1, afinidad1, kleosLog1),
      buildAgonistaExport(a2, pruebas2, inscripciones2, conversaciones2, afinidad2, kleosLog2),
    ],
  }

  const json = JSON.stringify(datos, null, 2)

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="gran-agon-datos.json"',
    },
  })
}
