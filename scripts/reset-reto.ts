/**
 * AGON — Reset script
 * Elimina todos los datos de un reto específico.
 * NO toca otros retos.
 *
 * Uso:
 *   npx tsx scripts/reset-reto.ts --reto=<retoId>
 *   npx tsx scripts/reset-reto.ts --todos-seeds
 */

import { config } from 'dotenv'
config({ path: '.env.local' })
import {
  retos,
  agonistas,
  pruebasDiarias,
  kleosLog,
  llamas,
  inscripciones,
  pactoInicial,
  mentorConversaciones,
  agoraEventos,
  notificaciones,
  faccionesAfinidad,
  hegemonias,
  crisisCiudad,
  calendarioCrisis,
  calendarioAgan,
  semanaSagrada,
  pruebaExtraordinaria,
  comentariosAgora,
  likesAgora,
  aclamaciones,
  correspondencia,
  senalamiento,
  ekecheiria,
  consultaMediodia,
  cronicas,
} from '@/lib/db/schema'
import { eq, inArray, like } from 'drizzle-orm'

const args = process.argv.slice(2)
const retoArg = args.find((a) => a.startsWith('--reto='))?.split('=')[1]
const todosSeedsArg = args.includes('--todos-seeds')

// Se asigna en `main()` después de cargar dotenv.
let db: Awaited<typeof import('@/lib/db')>['db']

async function resetReto(retoId: string) {
  console.log(`\n🗑️  Reseteando reto: ${retoId}`)

  const agonistasReto = await db
    .select({ id: agonistas.id })
    .from(agonistas)
    .where(eq(agonistas.retoId, retoId))

  const agonistIds = agonistasReto.map((a) => a.id)
  console.log(`   Agonistas encontrados: ${agonistIds.length}`)

  // Eventos del Ágora de esos agonistas (para borrar likes/comentarios/aclamaciones por evento).
  const eventoIds =
    agonistIds.length > 0
      ? (
          await db
            .select({ id: agoraEventos.id })
            .from(agoraEventos)
            .where(inArray(agoraEventos.agonistId, agonistIds))
        ).map((e) => e.id)
      : []

  // 1) Dependientes de eventos
  if (eventoIds.length > 0) {
    await db.delete(likesAgora).where(inArray(likesAgora.eventoId, eventoIds))
    await db.delete(comentariosAgora).where(inArray(comentariosAgora.eventoId, eventoIds))
    await db.delete(aclamaciones).where(inArray(aclamaciones.eventoId, eventoIds))
  }

  // 2) Tablas por agonista
  if (agonistIds.length > 0) {
    await db
      .delete(mentorConversaciones)
      .where(inArray(mentorConversaciones.agonistId, agonistIds))
    await db.delete(pruebasDiarias).where(inArray(pruebasDiarias.agonistId, agonistIds))
    await db.delete(kleosLog).where(inArray(kleosLog.agonistId, agonistIds))
    await db.delete(llamas).where(inArray(llamas.agonistId, agonistIds))
    await db.delete(inscripciones).where(inArray(inscripciones.agonistId, agonistIds))
    await db.delete(pactoInicial).where(inArray(pactoInicial.agonistId, agonistIds))
    await db.delete(agoraEventos).where(inArray(agoraEventos.agonistId, agonistIds))
    await db.delete(notificaciones).where(inArray(notificaciones.agonistId, agonistIds))
    await db.delete(faccionesAfinidad).where(inArray(faccionesAfinidad.agonistId, agonistIds))
    await db.delete(correspondencia).where(inArray(correspondencia.remitenteId, agonistIds))
    await db.delete(senalamiento).where(inArray(senalamiento.senaladorId, agonistIds))
    await db.delete(ekecheiria).where(inArray(ekecheiria.agonistId, agonistIds))
    await db.delete(consultaMediodia).where(inArray(consultaMediodia.agonistId, agonistIds))
  }

  // 3) Tablas por reto
  await db.delete(hegemonias).where(eq(hegemonias.retoId, retoId))
  await db.delete(crisisCiudad).where(eq(crisisCiudad.retoId, retoId))
  await db.delete(calendarioCrisis).where(eq(calendarioCrisis.retoId, retoId))
  await db.delete(calendarioAgan).where(eq(calendarioAgan.retoId, retoId))
  await db.delete(semanaSagrada).where(eq(semanaSagrada.retoId, retoId))
  await db.delete(pruebaExtraordinaria).where(eq(pruebaExtraordinaria.retoId, retoId))
  await db.delete(cronicas).where(eq(cronicas.retoId, retoId))

  // 4) Agonistas y reto
  if (agonistIds.length > 0) {
    await db.delete(agonistas).where(eq(agonistas.retoId, retoId))
  }
  await db.delete(retos).where(eq(retos.id, retoId))

  console.log(`   ✅ Reset completo: ${retoId}`)
}

async function resetTodosSeed() {
  console.log('\n🗑️  Eliminando todos los retos seed...')

  const retosSeed = await db
    .select({ id: retos.id })
    .from(retos)
    .where(like(retos.creadorClerkId, 'seed_%'))

  console.log(`   Retos seed encontrados: ${retosSeed.length}`)

  for (const r of retosSeed) {
    await resetReto(r.id)
  }

  console.log('\n✅ Todos los retos seed eliminados')
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en el entorno (.env.local / .env).')
  }

  ;({ db } = await import('@/lib/db'))

  if (todosSeedsArg) {
    await resetTodosSeed()
    return
  }

  if (retoArg) {
    await resetReto(retoArg)
    return
  }

  console.error('Uso: npx tsx scripts/reset-reto.ts --reto=<retoId>')
  console.error('     npx tsx scripts/reset-reto.ts --todos-seeds')
  process.exit(1)
}

main().catch((err) => {
  console.error('Error en reset:', err)
  process.exit(1)
})

