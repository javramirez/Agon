import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  getAgoraEventos,
  getAclamacionesHoy,
  getTiposAclamacionHoyPorEvento,
  getAgonistaByClerkId,
} from '@/lib/db/queries'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  if (!agonista) {
    return NextResponse.json({ error: 'Agonista no encontrado' }, { status: 404 })
  }
  if (!agonista.retoId) {
    return NextResponse.json({ eventos: [], aclamacionesHoy: 0, tiposPorEvento: {} })
  }
  const [eventos, aclamacionesHoy, tiposPorEvento] = await Promise.all([
    getAgoraEventos(agonista.retoId, 50),
    getAclamacionesHoy(agonista.id),
    getTiposAclamacionHoyPorEvento(agonista.id),
  ])

  return NextResponse.json({ eventos, aclamacionesHoy, tiposPorEvento })
}
