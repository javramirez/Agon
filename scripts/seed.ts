/**
 * AGON — Seed script
 * Crea un reto completo con datos de prueba.
 *
 * Uso:
 *   npx tsx scripts/seed.ts
 *   npx tsx scripts/seed.ts --modo=duelo
 *   npx tsx scripts/seed.ts --dias=15
 *   npx tsx scripts/seed.ts --clerk-id=user_xxxx --dias=15
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
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// ─── ARGS ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const modoArg = args.find((a) => a.startsWith('--modo='))?.split('=')[1] ?? 'solo'
const diasArg = parseInt(args.find((a) => a.startsWith('--dias='))?.split('=')[1] ?? '10', 10)
const clerkIdArg = args.find((a) => a.startsWith('--clerk-id='))?.split('=')[1]

const MODO = (modoArg === 'duelo' ? 'duelo' : 'solo') as 'solo' | 'duelo'
const DIAS = Math.min(Math.max(1, Number.isFinite(diasArg) ? diasArg : 10), 29)

// Se asigna en `main()` después de cargar dotenv.
let db: Awaited<typeof import('@/lib/db')>['db']

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fechaHaceNDias(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]!
}

function fechaSumarDias(fechaInicio: string, delta: number): string {
  const d = new Date(`${fechaInicio}T12:00:00`)
  d.setDate(d.getDate() + delta)
  return d.toISOString().split('T')[0]!
}

function uuid(): string {
  return crypto.randomUUID()
}

function randomBool(prob = 0.75): boolean {
  return Math.random() < prob
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─── CREAR RETO ───────────────────────────────────────────────────────────────

async function crearReto() {
  const retoId = uuid()
  const fechaInicio = fechaHaceNDias(DIAS - 1)
  const fechaFin = fechaSumarDias(fechaInicio, 28)

  const seedSuffix = retoId.slice(0, 8)
  const clerkCreador = clerkIdArg ?? `seed_creador_${seedSuffix}`

  await db.insert(retos).values({
    id: retoId,
    modo: MODO,
    estado: 'activo',
    creadorClerkId: clerkCreador,
    invitadoClerkId: MODO === 'duelo' ? `seed_invitado_${seedSuffix}` : null,
    codigoInvitacion: MODO === 'duelo' ? `SEED-${seedSuffix}` : null,
    fechaInicio,
    fechaFin,
    fechaConfirmadaPorCreador: true,
    fechaConfirmadaPorInvitado: true,
  })

  console.log(`✓ Reto creado: ${retoId} (${MODO}, día ${DIAS})`)
  return { retoId, fechaInicio, seedSuffix, clerkCreador }
}

// ─── CREAR AGONISTA ───────────────────────────────────────────────────────────

async function crearAgonista(params: {
  retoId: string
  nombre: string
  rol: 'creador' | 'invitado'
  clerkId: string
}) {
  const { retoId, nombre, rol, clerkId } = params

  const existente = await db
    .select({ id: agonistas.id })
    .from(agonistas)
    .where(eq(agonistas.clerkId, clerkId))
    .limit(1)

  let agonistId: string

  if (existente.length > 0) {
    agonistId = existente[0]!.id
    await db
      .update(agonistas)
      .set({
        nombre,
        retoId,
        rol,
        nivel: 'agonista',
        kleosTotal: 0,
        diasPerfectos: 0,
        oraculoSellado: true,
        oraculoMensaje: `Objetivo de prueba para ${nombre}: completar el Gran Agon con disciplina.`,
        mentorAsignado: 'leonidas',
        updatedAt: new Date(),
      })
      .where(eq(agonistas.id, agonistId))

    await db.delete(mentorConversaciones).where(eq(mentorConversaciones.agonistId, agonistId))
    await db.delete(pruebasDiarias).where(eq(pruebasDiarias.agonistId, agonistId))
    await db.delete(kleosLog).where(eq(kleosLog.agonistId, agonistId))
    await db.delete(inscripciones).where(eq(inscripciones.agonistId, agonistId))

    console.log(`  ✓ Agonista existente reasignado al reto seed`)
  } else {
    agonistId = uuid()
    await db.insert(agonistas).values({
      id: agonistId,
      clerkId,
      nombre,
      retoId,
      rol,
      nivel: 'agonista',
      kleosTotal: 0,
      diasPerfectos: 0,
      oraculoSellado: true,
      oraculoMensaje: `Objetivo de prueba para ${nombre}: completar el Gran Agon con disciplina.`,
      mentorAsignado: 'leonidas',
    })
  }

  const pactoExistente = await db
    .select({ id: pactoInicial.id })
    .from(pactoInicial)
    .where(eq(pactoInicial.agonistId, agonistId))
    .limit(1)

  if (pactoExistente.length === 0) {
    await db.insert(pactoInicial).values({
      id: uuid(),
      agonistId,
      acto: 1,
      objetivo: `${nombre} busca forjar disciplina en 29 días.`,
      arquetipo: 'constante',
      puntoPartida: 'interno',
      compromisoEscala: 4,
      lineaBaseGym: 2,
      lineaBaseCardio: 1,
      lineaBasePaginas: 5,
      sombraTipo: 'consistencia',
      apuestaGanas: 'Semana de vacaciones sin culpa.',
      apuestaPierdes: 'Reconocer la derrota públicamente.',
      tusFortalezas: ['consistencia', 'mental'],
      tuDebilidad: 'social',
      preocupacionEscala: { tiempo: 3, constancia: 4, rival: 2 },
      mentorAsignado: 'leonidas',
    })
  }

  // Sin unique (agonista_id, habito_id) en DB: borrar y volver a sembrar evita duplicados al reutilizar clerkId.
  await db.delete(llamas).where(eq(llamas.agonistId, agonistId))

  const habitos = ['agua', 'comida', 'pasos', 'sueno', 'lectura', 'gym', 'cardio'] as const
  for (const habitoId of habitos) {
    await db.insert(llamas).values({
      id: uuid(),
      agonistId,
      habitoId,
      rachaActual: randomInt(0, DIAS),
      rachMaxima: randomInt(3, DIAS),
      ultimaFecha: fechaHaceNDias(0),
    })
  }

  console.log(`  ✓ Agonista: ${nombre} (${rol})`)
  return agonistId
}

// ─── CREAR PRUEBAS DIARIAS ────────────────────────────────────────────────────

async function crearPruebasDiarias(agonistId: string, fechaInicio: string) {
  let kleosAcumulado = 0
  let diasPerfectos = 0

  // Contadores semanales acumulados (se almacenan en el registro diario).
  let gymSemana = 0
  let cardioSemana = 0

  for (let idx = 0; idx < DIAS; idx++) {
    const fecha = fechaSumarDias(fechaInicio, idx)

    const diaDelReto = idx + 1
    const diaSemana = ((diaDelReto - 1) % 7) + 1
    if (diaSemana === 1) {
      gymSemana = 0
      cardioSemana = 0
    }

    const hizoGymHoy = randomBool(0.55)
    const hizoCardioHoy = randomBool(0.5)
    if (hizoGymHoy && gymSemana < 4) gymSemana += 1
    if (hizoCardioHoy && cardioSemana < 3) cardioSemana += 1

    const soloAgua = randomBool(0.82)
    const sinComidaRapida = randomBool(0.8)
    const pasos = randomBool(0.72) ? randomInt(10000, 15000) : randomInt(2500, 9999)
    const horasSueno = randomBool(0.72) ? randomInt(7, 9) : randomInt(4, 6)
    const paginasLeidas = randomBool(0.78) ? randomInt(10, 30) : randomInt(0, 9)

    const sesionesGym = gymSemana
    const sesionesCardio = cardioSemana

    const diaPerfecto =
      soloAgua &&
      sinComidaRapida &&
      pasos >= 10000 &&
      horasSueno >= 7 &&
      paginasLeidas >= 10 &&
      sesionesGym >= 4 &&
      sesionesCardio >= 3

    let kleosDia = 0
    if (soloAgua) kleosDia += 10
    if (sinComidaRapida) kleosDia += 10
    if (pasos >= 10000) kleosDia += 20
    if (horasSueno >= 7) kleosDia += 15
    if (paginasLeidas >= 10) kleosDia += 15
    if (sesionesGym >= 4) kleosDia += 30
    if (sesionesCardio >= 3) kleosDia += 25
    if (diaPerfecto) kleosDia += 30

    kleosAcumulado += kleosDia
    if (diaPerfecto) diasPerfectos += 1

    await db.insert(pruebasDiarias).values({
      id: uuid(),
      agonistId,
      fecha,
      soloAgua,
      sinComidaRapida,
      pasos,
      horasSueno,
      paginasLeidas,
      sesionesGym,
      sesionesCardio,
      kleosGanado: kleosDia,
      diaPerfecto,
      pruebaExtraordinariaCompletada: false,
    })

    if (kleosDia > 0) {
      await db.insert(kleosLog).values({
        id: uuid(),
        agonistId,
        cantidad: kleosDia,
        motivo: 'pruebas_diarias',
        fecha,
      })
    }
  }

  await db
    .update(agonistas)
    .set({ kleosTotal: kleosAcumulado, diasPerfectos })
    .where(eq(agonistas.id, agonistId))

  console.log(`  ✓ ${DIAS} días de pruebas generados (${kleosAcumulado} kleos)`)
  return { kleosAcumulado, diasPerfectos }
}

// ─── CREAR INSCRIPCIONES ──────────────────────────────────────────────────────

async function crearInscripciones(agonistId: string) {
  const inscripcionesBase = ['el_primer_paso', 'tres_dias_de_fuego', 'sangre_en_el_altis']

  for (const inscripcionId of inscripcionesBase) {
    await db
      .insert(inscripciones)
      .values({
        id: uuid(),
        agonistId,
        inscripcionId,
        secreto: false,
        tipo: 'publica',
      })
      .onConflictDoNothing()
  }

  console.log(`  ✓ ${inscripcionesBase.length} inscripciones desbloqueadas`)
}

// ─── CONVERSACIÓN CON MENTOR ──────────────────────────────────────────────────

async function crearConversacionMentor(agonistId: string) {
  const mensajes = [
    { rol: 'mentor', contenido: 'El camino del agonista comienza con un solo acto. ¿Estás listo?' },
    { rol: 'user', contenido: 'Sí. Vengo a forjarme.' },
    { rol: 'mentor', contenido: 'Bien. El Altis registra todo. No hay excusas que valgan ante el registro.' },
  ]

  for (const msg of mensajes) {
    await db.insert(mentorConversaciones).values({
      id: uuid(),
      agonistId,
      rol: msg.rol,
      contenido: msg.contenido,
    })
  }

  console.log(`  ✓ Conversación inicial con mentor creada`)
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL en el entorno (.env.local / .env).')
  }

  ;({ db } = await import('@/lib/db'))

  console.log(`\n🏛️  AGON Seed Script`)
  console.log(`   Modo: ${MODO} | Días: ${DIAS}\n`)

  const { retoId, fechaInicio, seedSuffix, clerkCreador } = await crearReto()

  const agonistId1 = await crearAgonista({
    retoId,
    nombre: 'Agonista Seed',
    rol: 'creador',
    clerkId: clerkCreador,
  })
  await crearPruebasDiarias(agonistId1, fechaInicio)
  await crearInscripciones(agonistId1)
  await crearConversacionMentor(agonistId1)

  if (MODO === 'duelo') {
    const agonistId2 = await crearAgonista({
      retoId,
      nombre: 'Antagonista Seed',
      rol: 'invitado',
      clerkId: `seed_invitado_${seedSuffix}`,
    })
    await crearPruebasDiarias(agonistId2, fechaInicio)
    await crearInscripciones(agonistId2)
  }

  console.log(`\n✅ Seed completado`)
  console.log(`   Reto ID: ${retoId}`)
  console.log(`   Para resetear: npx tsx scripts/reset-reto.ts --reto=${retoId}\n`)
}

main().catch((err) => {
  console.error('Error en seed:', err)
  process.exit(1)
})

