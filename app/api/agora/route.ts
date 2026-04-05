import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  getAgoraEventos,
  getAclamacionesHoy,
  getTiposAclamacionHoyPorEvento,
  getOrCreateAgonista,
} from '@/lib/db/queries'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)
  const [eventos, aclamacionesHoy, tiposPorEvento] = await Promise.all([
    getAgoraEventos(50),
    getAclamacionesHoy(agonista.id),
    getTiposAclamacionHoyPorEvento(agonista.id),
  ])

  return NextResponse.json({ eventos, aclamacionesHoy, tiposPorEvento })
}
