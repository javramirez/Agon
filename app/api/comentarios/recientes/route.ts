import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comentariosAgora } from '@/lib/db/schema'
import { and, eq, gte } from 'drizzle-orm'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const hace35s = new Date(Date.now() - 35000)

  const recientes = await db
    .select()
    .from(comentariosAgora)
    .where(
      and(
        eq(comentariosAgora.autorTipo, 'dios'),
        gte(comentariosAgora.createdAt, hace35s)
      )
    )

  return NextResponse.json({ comentariosDioses: recientes })
}
