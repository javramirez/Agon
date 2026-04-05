import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { pruebasDiarias, agoraEventos } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getOrCreateAgonista, getOrCreatePruebaDiariaHoy } from '@/lib/db/queries'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const agonista = await getOrCreateAgonista(userId)
  const hoy = new Date().toISOString().split('T')[0]

  const formData = await req.formData()
  const archivo = formData.get('foto') as File | null
  const tipoRaw = formData.get('tipo')

  if (!archivo || tipoRaw == null) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const tipo = String(tipoRaw)
  if (tipo !== 'gym' && tipo !== 'cardio') {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  if (archivo.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'La foto no puede superar 5MB' }, { status: 400 })
  }

  try {
    const extension = archivo.name.split('.').pop() || 'jpg'
    const filename = `agon/${agonista.id}/${hoy}/${tipo}.${extension}`

    const blob = await put(filename, archivo, {
      access: 'public',
      addRandomSuffix: false,
    })

    const pruebaRow = await getOrCreatePruebaDiariaHoy(agonista.id)

    if (tipo === 'gym') {
      await db
        .update(pruebasDiarias)
        .set({ fotoGymUrl: blob.url, updatedAt: new Date() })
        .where(eq(pruebasDiarias.id, pruebaRow.id))
    } else {
      await db
        .update(pruebasDiarias)
        .set({ fotoCardioUrl: blob.url, updatedAt: new Date() })
        .where(eq(pruebasDiarias.id, pruebaRow.id))
    }

    const tipoLabel = tipo === 'gym' ? 'gimnasio' : 'cardio'
    await db.insert(agoraEventos).values({
      id: crypto.randomUUID(),
      agonistId: agonista.id,
      tipo: 'foto_subida',
      contenido: `${agonista.nombre} publicó comprobante de ${tipoLabel}.`,
      fotoUrl: blob.url,
      metadata: { tipo, fecha: hoy },
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('Error subiendo foto:', error)
    return NextResponse.json({ error: 'Error al subir la foto' }, { status: 500 })
  }
}
