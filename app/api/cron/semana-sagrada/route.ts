import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { semanaSagrada, agoraEventos, calendarioAgan } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import {
  getSemanaActual,
  getAmbosAgonistas,
  getSemanaRango,
} from '@/lib/db/queries'
import { isGranAgonActivo } from '@/lib/utils'
import { format } from 'date-fns'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  if (!isGranAgonActivo()) {
    return NextResponse.json({ ok: true, mensaje: 'Gran Agon inactivo.' })
  }

  const semanaActual = getSemanaActual()

  const calendario = await db.select().from(calendarioAgan).limit(1)
  if (calendario.length === 0) {
    return NextResponse.json(
      { error: 'Calendario no generado.' },
      { status: 400 }
    )
  }

  const semanaSorteada = calendario[0].semanaSagradaSemana

  if (semanaActual !== semanaSorteada) {
    return NextResponse.json({
      ok: true,
      mensaje: 'No es la semana sagrada.',
    })
  }

  const yaActiva = await db
    .select()
    .from(semanaSagrada)
    .where(eq(semanaSagrada.activa, true))
    .limit(1)

  if (yaActiva.length > 0) {
    return NextResponse.json({
      ok: true,
      mensaje: 'Semana Sagrada ya activa.',
    })
  }

  const hoy = new Date()
  const hoyStr = format(hoy, 'yyyy-MM-dd')
  const { finSemana } = getSemanaRango(semanaActual)

  await db.insert(semanaSagrada).values({
    id: crypto.randomUUID(),
    activa: true,
    fechaInicio: hoyStr,
    fechaFin: finSemana,
    activadaEn: hoy,
  })

  const ambos = await getAmbosAgonistas()
  if (ambos.length > 0) {
    await db.insert(agoraEventos).values({
      id: crypto.randomUUID(),
      agonistId: ambos[0].id,
      tipo: 'semana_sagrada',
      contenido: `⚡ El Altis proclama La Semana Sagrada. Todo el kleos ganado esta semana vale el doble. El Gran Agon entra en su momento más épico. Que el mejor agonista prevalezca.`,
      metadata: { semana: semanaActual },
    })
  }

  return NextResponse.json({
    ok: true,
    mensaje: `Semana Sagrada activada — semana ${semanaActual}.`,
  })
}
