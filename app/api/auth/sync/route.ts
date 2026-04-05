import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getOrCreateAgonista } from '@/lib/db/queries'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const agonista = await getOrCreateAgonista(userId)
    return NextResponse.json({ agonista })
  } catch {
    return NextResponse.json({ error: 'Error al sincronizar' }, { status: 500 })
  }
}
