import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pactoInicial, agonistas } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentAgonista } from '@/lib/auth'

const ARQUETIPOS_VALIDOS = ['constante', 'explosivo', 'metodico', 'caotico'] as const
const PUNTOS_PARTIDA_VALIDOS = [
  'fecha_limite',
  'reconstruccion',
  'interno',
  'transformacion',
] as const

type ArquetipoKey = (typeof ARQUETIPOS_VALIDOS)[number]
type PuntoPartidaKey = (typeof PUNTOS_PARTIDA_VALIDOS)[number]

function asignarMentor(arquetipo: ArquetipoKey, puntoPartida: PuntoPartidaKey): string {
  if (arquetipo === 'metodico') return 'odiseo'
  if (arquetipo === 'caotico') {
    return puntoPartida === 'interno' ? 'diogenes' : 'dedalo'
  }
  if (arquetipo === 'constante') {
    if (puntoPartida === 'fecha_limite') return 'leonidas'
    if (puntoPartida === 'reconstruccion') return 'hercules'
    return 'quiron'
  }
  // explosivo
  if (puntoPartida === 'fecha_limite') return 'leonidas'
  if (puntoPartida === 'reconstruccion' || puntoPartida === 'interno') return 'hercules'
  return 'dedalo'
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getCurrentAgonista()
  if (!agonista) return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  if (agonista.oraculoSellado) {
    return NextResponse.json({ error: 'El Pacto ya fue sellado' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const {
    objetivo,
    arquetipo,
    puntoPartida,
    compromisoEscala,
    lineaBaseGym,
    lineaBaseCardio,
    lineaBasePaginas,
    sombraTipo,
    apuestaGanas,
    apuestaPierdes,
    rivalFortalezas,
    rivalDebilidad,
    preocupacionEscala,
  } = b

  if (typeof objetivo !== 'string' || objetivo.trim().length < 5) {
    return NextResponse.json({ error: 'El objetivo es obligatorio.' }, { status: 400 })
  }

  if (typeof arquetipo !== 'string' || !ARQUETIPOS_VALIDOS.includes(arquetipo as ArquetipoKey)) {
    return NextResponse.json({ error: 'Arquetipo inválido.' }, { status: 400 })
  }

  if (
    typeof puntoPartida !== 'string' ||
    !PUNTOS_PARTIDA_VALIDOS.includes(puntoPartida as PuntoPartidaKey)
  ) {
    return NextResponse.json({ error: 'Punto de partida inválido.' }, { status: 400 })
  }

  if (typeof compromisoEscala !== 'number' || compromisoEscala < 1 || compromisoEscala > 5) {
    return NextResponse.json({ error: 'Escala de compromiso inválida.' }, { status: 400 })
  }

  if (
    typeof lineaBaseGym !== 'number' ||
    lineaBaseGym < 0 ||
    lineaBaseGym > 7 ||
    typeof lineaBaseCardio !== 'number' ||
    lineaBaseCardio < 0 ||
    lineaBaseCardio > 7 ||
    typeof lineaBasePaginas !== 'number' ||
    lineaBasePaginas < 0 ||
    ![0, 5, 10, 15, 20, 25, 30].includes(lineaBasePaginas)
  ) {
    return NextResponse.json({ error: 'Línea base inválida' }, { status: 400 })
  }

  if (typeof sombraTipo !== 'string' || sombraTipo.trim().length < 3) {
    return NextResponse.json({ error: 'La sombra es obligatoria.' }, { status: 400 })
  }

  if (typeof apuestaGanas !== 'string' || apuestaGanas.trim().length < 3) {
    return NextResponse.json({ error: 'La apuesta (ganas) es obligatoria.' }, { status: 400 })
  }

  if (typeof apuestaPierdes !== 'string' || apuestaPierdes.trim().length < 3) {
    return NextResponse.json({ error: 'La apuesta (pierdes) es obligatoria.' }, { status: 400 })
  }

  if (!Array.isArray(rivalFortalezas) || rivalFortalezas.length === 0 || rivalFortalezas.length > 2) {
    return NextResponse.json({ error: 'Selecciona 1 o 2 fortalezas del rival.' }, { status: 400 })
  }

  const fortalezasNorm = rivalFortalezas.map((x) => String(x).trim()).filter(Boolean)
  if (fortalezasNorm.length !== rivalFortalezas.length) {
    return NextResponse.json({ error: 'Fortalezas del rival inválidas.' }, { status: 400 })
  }

  if (typeof rivalDebilidad !== 'string' || rivalDebilidad.trim().length < 3) {
    return NextResponse.json({ error: 'La debilidad del rival es obligatoria.' }, { status: 400 })
  }

  const escala = preocupacionEscala as Record<string, unknown>
  if (
    typeof escala?.tiempo !== 'number' ||
    typeof escala?.constancia !== 'number' ||
    typeof escala?.rival !== 'number'
  ) {
    return NextResponse.json({ error: 'Escala de preocupación incompleta.' }, { status: 400 })
  }

  const t = escala.tiempo as number
  const c = escala.constancia as number
  const rv = escala.rival as number
  if ([t, c, rv].some((n) => n < 1 || n > 5)) {
    return NextResponse.json({ error: 'Escala de preocupación inválida (1–5).' }, { status: 400 })
  }

  const arquetipoKey = arquetipo as ArquetipoKey
  const puntoKey = puntoPartida as PuntoPartidaKey
  const mentor = asignarMentor(arquetipoKey, puntoKey)

  try {
    await db.insert(pactoInicial).values({
      id: crypto.randomUUID(),
      agonistId: agonista.id,
      acto: 1,
      objetivo: objetivo.trim(),
      arquetipo: arquetipoKey,
      puntoPartida: puntoKey,
      compromisoEscala,
      lineaBaseGym,
      lineaBaseCardio,
      lineaBasePaginas,
      sombraTipo: sombraTipo.trim(),
      apuestaGanas: apuestaGanas.trim(),
      apuestaPierdes: apuestaPierdes.trim(),
      rivalFortalezas: fortalezasNorm,
      rivalDebilidad: rivalDebilidad.trim(),
      preocupacionEscala: { tiempo: t, constancia: c, rival: rv },
      mentorAsignado: mentor,
    })

    await db
      .update(agonistas)
      .set({
        oraculoMensaje: objetivo.trim(),
        oraculoSellado: true,
        mentorAsignado: mentor,
        updatedAt: new Date(),
      })
      .where(eq(agonistas.id, agonista.id))

    return NextResponse.json({ ok: true, mentor })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al sellar el Pacto'
    console.error('Error sellando pacto:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
