import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getAgonistaByClerkId } from '@/lib/db/queries'

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getAgonistaByClerkId(userId)
  return NextResponse.json({ agonista })
}
