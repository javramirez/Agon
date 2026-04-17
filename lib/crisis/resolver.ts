import { db } from '@/lib/db'
import {
  crisisCiudad,
  faccionesAfinidad,
  agonistas,
  notificaciones,
  postsDioses,
  agoraEventos,
} from '@/lib/db/schema'
import { and, eq, sql } from 'drizzle-orm'
import {
  getCrisis,
  type ConsecuenciaCrisis,
  type CrisisConfig,
} from './config'
import {
  getCrisisActiva,
  determinarEscenario,
  crisisExpirada,
  type EscenarioCrisis,
} from './calendario'
import { getAmbosAgonistas } from '@/lib/db/queries'
import type { FaccionId } from '@/lib/facciones/config'
import { desbloquearInscripcion } from '@/lib/inscripciones/desbloquear'

// ─── APLICAR AFINIDAD ─────────────────────────────────────────────────────────

async function aplicarAfinidad(
  agonistId: string,
  consecuencia: ConsecuenciaCrisis
): Promise<void> {
  if (!consecuencia.afinidad?.length) return

  const afinidades = await db
    .select()
    .from(faccionesAfinidad)
    .where(eq(faccionesAfinidad.agonistId, agonistId))

  const campeonCount = afinidades.filter((a) => a.rango === 5).length
  const afinidadMap = new Map(afinidades.map((a) => [a.faccionId as string, a]))

  for (const { faccionId, puntos } of consecuencia.afinidad) {
    const actual = afinidadMap.get(faccionId)
    const puntosActuales = actual?.puntosAfinidad ?? 0
    const puntosTotal = Math.max(0, puntosActuales + puntos)

    // Calcular nuevo rango
    let nuevoRango = 1
    if (puntosTotal >= 150) nuevoRango = 5
    else if (puntosTotal >= 100) nuevoRango = 4
    else if (puntosTotal >= 55) nuevoRango = 3
    else if (puntosTotal >= 20) nuevoRango = 2

    // Respetar límite de 2 campeones
    if (nuevoRango === 5 && (actual?.rango ?? 1) < 5 && campeonCount >= 2) {
      nuevoRango = 4
    }

    await db
      .insert(faccionesAfinidad)
      .values({
        agonistId,
        faccionId: faccionId as FaccionId,
        puntosAfinidad: puntosTotal,
        rango: nuevoRango,
        rachaMilestoneMaximo: actual?.rachaMilestoneMaximo ?? 0,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [faccionesAfinidad.agonistId, faccionesAfinidad.faccionId],
        set: {
          puntosAfinidad: puntosTotal,
          rango: nuevoRango,
          updatedAt: new Date(),
        },
      })
  }
}

// ─── APLICAR KLEOS ────────────────────────────────────────────────────────────

async function aplicarKleos(agonistId: string, cantidad: number): Promise<void> {
  if (!cantidad) return

  await db
    .update(agonistas)
    .set({
      kleosTotal: sql`GREATEST(0, kleos_total + ${cantidad})`,
      updatedAt: new Date(),
    })
    .where(eq(agonistas.id, agonistId))
}

// ─── APLICAR MARCA NARRATIVA (Tipo E) ─────────────────────────────────────────

async function aplicarMarcaE(
  agonistId: string,
  crisisId: string,
  marcaTexto: string
): Promise<void> {
  const agonista = await db
    .select({ nombre: agonistas.nombre })
    .from(agonistas)
    .where(eq(agonistas.id, agonistId))
    .limit(1)

  await db.insert(agoraEventos).values({
    id: crypto.randomUUID(),
    agonistId,
    tipo: 'prueba_completada',
    contenido: marcaTexto,
    metadata: {
      esCrisis: true,
      crisisId,
      esMarca: true,
      nombre: agonista[0]?.nombre ?? '',
    },
  })
}

// ─── PUBLICAR EVENTO EN ÁGORA ─────────────────────────────────────────────────

async function publicarEventoAgora(
  crisisId: string,
  tipoEvento: string,
  contenido: string,
  _ambosIds: string[]
): Promise<void> {
  const config = getCrisis(crisisId)
  if (!config) return

  const diosNarrador = getDiosNarrador(config)

  const eventoId = crypto.randomUUID()
  await db.insert(postsDioses).values({
    id: eventoId,
    diosNombre: diosNarrador,
    tipo: tipoEvento,
    contenido,
    metadata: { crisisId, titulo: config.titulo },
    cerrado: false,
  })
}

function getDiosNarrador(config: CrisisConfig): string {
  const primeraFaccion =
    config.escenarioAmbosA?.afinidad?.[0]?.faccionId ??
    config.consecuenciaA?.afinidad?.[0]?.faccionId ??
    'tribunal_kleos'

  const mapaFaccionDios: Record<string, string> = {
    guardia_hierro: 'Ares',
    escuela_logos: 'Apolo',
    gremio_tierra: 'Deméter',
    hermandad_caos: 'Eris',
    corredores_alba: 'Hermes',
    concilio_sombras: 'Morfeo',
    tribunal_kleos: 'Nike',
  }

  return mapaFaccionDios[primeraFaccion] ?? 'Nike'
}

// ─── NOTIFICAR AGONISTAS ──────────────────────────────────────────────────────

async function notificarAgonista(
  agonistId: string,
  titulo: string,
  descripcion: string,
  crisisId: string
): Promise<void> {
  await db.insert(notificaciones).values({
    id: crypto.randomUUID(),
    agonistId,
    tipo: 'duelo_campeon',
    titulo,
    descripcion,
    metadata: { crisisId, esCrisis: true },
    leida: false,
  })
}

// ─── APLICAR CONSECUENCIA COMPLETA ───────────────────────────────────────────

async function aplicarConsecuencia(
  agonistId: string,
  crisisCiudadFilaId: string,
  crisisId: string,
  consecuencia: ConsecuenciaCrisis
): Promise<void> {
  await Promise.all([
    aplicarAfinidad(agonistId, consecuencia),
    aplicarKleos(agonistId, consecuencia.kleos ?? 0),
  ])

  if (consecuencia.marcaE) {
    await aplicarMarcaE(agonistId, crisisId, consecuencia.marcaE)
  }

  if (
    consecuencia.consecuenciaDiferidaDias !== undefined &&
    consecuencia.consecuenciaDiferidaDias > 0
  ) {
    const fechaDiferida = new Date()
    fechaDiferida.setDate(
      fechaDiferida.getDate() + consecuencia.consecuenciaDiferidaDias
    )

    await db
      .update(crisisCiudad)
      .set({ consecuenciaDiferidaFecha: fechaDiferida })
      .where(eq(crisisCiudad.id, crisisCiudadFilaId))
  }
}

// ─── APLICAR MODIFICACIÓN DE LÍDER (Crisis 19) ───────────────────────────────

async function aplicarLiderModificado(
  crisisFilaId: string,
  liderModificado: NonNullable<ConsecuenciaCrisis['liderModificado']>
): Promise<void> {
  await db
    .update(crisisCiudad)
    .set({ liderModificado })
    .where(eq(crisisCiudad.id, crisisFilaId))
}

// ─── RESOLVER CRISIS TIPO A / B / E ──────────────────────────────────────────

async function resolverCrisisIndividual(
  fila: typeof crisisCiudad.$inferSelect,
  config: CrisisConfig,
  agonistId: string,
  agonista1Id: string,
  decision: string
): Promise<void> {
  const consecuencia =
    decision === 'A' ? config.consecuenciaA : config.consecuenciaB

  if (!consecuencia) return

  await aplicarConsecuencia(agonistId, fila.id, fila.crisisId, consecuencia)

  if (consecuencia.liderModificado) {
    await aplicarLiderModificado(fila.id, consecuencia.liderModificado)
  }
}

// ─── RESOLVER CRISIS TIPO D ───────────────────────────────────────────────────

async function resolverCrisisD(
  fila: typeof crisisCiudad.$inferSelect,
  config: CrisisConfig,
  agonista1Id: string,
  agonista2Id: string,
  escenario: EscenarioCrisis
): Promise<void> {
  const agonista1Nombre = await db
    .select({ nombre: agonistas.nombre })
    .from(agonistas)
    .where(eq(agonistas.id, agonista1Id))
    .limit(1)
    .then((r) => r[0]?.nombre ?? 'El agonista')

  const agonista2Nombre = await db
    .select({ nombre: agonistas.nombre })
    .from(agonistas)
    .where(eq(agonistas.id, agonista2Id))
    .limit(1)
    .then((r) => r[0]?.nombre ?? 'El rival')

  if (escenario === '1' && config.escenarioAmbosA) {
    await aplicarConsecuencia(
      agonista1Id,
      fila.id,
      fila.crisisId,
      config.escenarioAmbosA
    )
    await aplicarConsecuencia(
      agonista2Id,
      fila.id,
      fila.crisisId,
      config.escenarioAmbosA
    )
    await publicarEventoAgora(
      fila.crisisId,
      config.escenarioAmbosA.eventoAgora ?? 'crisis_resuelta',
      config.escenarioAmbosA.descripcionAgora,
      [agonista1Id, agonista2Id]
    )
  } else if (escenario === '2' && config.escenarioAmbosB) {
    await aplicarConsecuencia(
      agonista1Id,
      fila.id,
      fila.crisisId,
      config.escenarioAmbosB
    )
    await aplicarConsecuencia(
      agonista2Id,
      fila.id,
      fila.crisisId,
      config.escenarioAmbosB
    )
    await publicarEventoAgora(
      fila.crisisId,
      config.escenarioAmbosB.eventoAgora ?? 'crisis_resuelta',
      config.escenarioAmbosB.descripcionAgora,
      [agonista1Id, agonista2Id]
    )
  } else if (escenario === '3' && config.escenarioYoArivaB) {
    await aplicarConsecuencia(
      agonista1Id,
      fila.id,
      fila.crisisId,
      config.escenarioYoArivaB
    )
    await aplicarConsecuencia(
      agonista2Id,
      fila.id,
      fila.crisisId,
      config.escenarioYoBrivaA ?? config.escenarioYoArivaB
    )
    await notificarAgonista(
      agonista1Id,
      `⚡ Crisis resuelta: ${config.titulo}`,
      config.escenarioYoArivaB.notificacionA,
      fila.crisisId
    )
    await notificarAgonista(
      agonista2Id,
      `⚡ Crisis resuelta: ${config.titulo}`,
      config.escenarioYoArivaB.notificacionB,
      fila.crisisId
    )
    await publicarEventoAgora(
      fila.crisisId,
      config.escenarioYoArivaB.eventoAgora ?? 'crisis_resuelta',
      config.escenarioYoArivaB.descripcionAgora
        .replace('[Acusador]', agonista1Nombre)
        .replace('[Defensor]', agonista2Nombre)
        .replace('[Respaldó]', agonista1Nombre)
        .replace('[Silenció]', agonista2Nombre)
        .replace('[Admitió]', agonista1Nombre)
        .replace('[Defendió]', agonista2Nombre)
        .replace('[Consintiente]', agonista1Nombre)
        .replace('[No consintiente]', agonista2Nombre)
        .replace('[Pagó]', agonista1Nombre)
        .replace('[No pagó]', agonista2Nombre),
      [agonista1Id, agonista2Id]
    )
  } else if (escenario === '4' && config.escenarioYoBrivaA) {
    await aplicarConsecuencia(
      agonista1Id,
      fila.id,
      fila.crisisId,
      config.escenarioYoBrivaA
    )
    await aplicarConsecuencia(
      agonista2Id,
      fila.id,
      fila.crisisId,
      config.escenarioYoArivaB ?? config.escenarioYoBrivaA
    )
    await notificarAgonista(
      agonista1Id,
      `⚡ Crisis resuelta: ${config.titulo}`,
      config.escenarioYoBrivaA.notificacionA,
      fila.crisisId
    )
    await notificarAgonista(
      agonista2Id,
      `⚡ Crisis resuelta: ${config.titulo}`,
      config.escenarioYoBrivaA.notificacionB,
      fila.crisisId
    )
    await publicarEventoAgora(
      fila.crisisId,
      config.escenarioYoBrivaA.eventoAgora ?? 'crisis_resuelta',
      config.escenarioYoBrivaA.descripcionAgora
        .replace('[Acusador]', agonista2Nombre)
        .replace('[Defensor]', agonista1Nombre)
        .replace('[Respaldó]', agonista2Nombre)
        .replace('[Silenció]', agonista1Nombre)
        .replace('[Admitió]', agonista2Nombre)
        .replace('[Defendió]', agonista1Nombre),
      [agonista1Id, agonista2Id]
    )
  }
}

// ─── RESOLVER CRISIS TIPO H ───────────────────────────────────────────────────

async function resolverCrisisH(
  fila: typeof crisisCiudad.$inferSelect,
  config: CrisisConfig,
  agonista1Id: string,
  agonista2Id: string
): Promise<void> {
  const d1 = fila.decisionAgonista1
  const d2 = fila.decisionAgonista2
  const kleosSacrificio = config.kleosSacrificio ?? 250
  const kleosRecompensa = config.kleosRecompensaAmbos ?? 150

  const agonista1Nombre = await db
    .select({ nombre: agonistas.nombre })
    .from(agonistas)
    .where(eq(agonistas.id, agonista1Id))
    .limit(1)
    .then((r) => r[0]?.nombre ?? 'El agonista')

  const agonista2Nombre = await db
    .select({ nombre: agonistas.nombre })
    .from(agonistas)
    .where(eq(agonistas.id, agonista2Id))
    .limit(1)
    .then((r) => r[0]?.nombre ?? 'El rival')

  const ambosA = d1 === 'A' && d2 === 'A'
  const ambosB = (!d1 || d1 === 'B') && (!d2 || d2 === 'B')
  const solo1 = d1 === 'A' && (!d2 || d2 === 'B')
  const solo2 = d2 === 'A' && (!d1 || d1 === 'B')

  if (ambosA && config.escenarioAmbosA) {
    await aplicarKleos(agonista1Id, kleosRecompensa)
    await aplicarKleos(agonista2Id, kleosRecompensa)
    await aplicarConsecuencia(
      agonista1Id,
      fila.id,
      fila.crisisId,
      config.escenarioAmbosA
    )
    await aplicarConsecuencia(
      agonista2Id,
      fila.id,
      fila.crisisId,
      config.escenarioAmbosA
    )
    await publicarEventoAgora(
      fila.crisisId,
      config.escenarioAmbosA.eventoAgora ?? 'sacrificio_mutuo',
      config.escenarioAmbosA.descripcionAgora,
      [agonista1Id, agonista2Id]
    )
  } else if (ambosB && config.escenarioAmbosB) {
    await aplicarConsecuencia(
      agonista1Id,
      fila.id,
      fila.crisisId,
      config.escenarioAmbosB
    )
    await aplicarConsecuencia(
      agonista2Id,
      fila.id,
      fila.crisisId,
      config.escenarioAmbosB
    )
    await publicarEventoAgora(
      fila.crisisId,
      config.escenarioAmbosB.eventoAgora ?? 'crisis_sin_sacrificio',
      config.escenarioAmbosB.descripcionAgora,
      [agonista1Id, agonista2Id]
    )
  } else if (solo1 && config.escenarioYoArivaB) {
    await aplicarKleos(agonista1Id, -kleosSacrificio)
    await aplicarKleos(agonista2Id, kleosSacrificio)
    await aplicarConsecuencia(
      agonista1Id,
      fila.id,
      fila.crisisId,
      config.consecuenciaA ?? {}
    )
    await aplicarConsecuencia(
      agonista2Id,
      fila.id,
      fila.crisisId,
      config.consecuenciaB ?? {}
    )
    await notificarAgonista(
      agonista1Id,
      `⚡ Crisis resuelta: ${config.titulo}`,
      'Te sacrificaste. Tu rival no lo hizo. El Agon tiene memoria.',
      fila.crisisId
    )
    await notificarAgonista(
      agonista2Id,
      `⚡ Crisis resuelta: ${config.titulo}`,
      'Tu rival se sacrificó. Tú no lo hiciste. El Altis lo inscribió.',
      fila.crisisId
    )
    await publicarEventoAgora(
      fila.crisisId,
      'sacrificio_asimetrico',
      `${agonista1Nombre} cedió. ${agonista2Nombre} no lo hizo. El contraste es brutal. La ciudad eligió a quién admirar en silencio.`,
      [agonista1Id, agonista2Id]
    )
    void desbloquearInscripcion(agonista1Id, agonista1Nombre, 'el_sacrificio')
  } else if (solo2) {
    await aplicarKleos(agonista2Id, -kleosSacrificio)
    await aplicarKleos(agonista1Id, kleosSacrificio)
    await aplicarConsecuencia(
      agonista2Id,
      fila.id,
      fila.crisisId,
      config.consecuenciaA ?? {}
    )
    await aplicarConsecuencia(
      agonista1Id,
      fila.id,
      fila.crisisId,
      config.consecuenciaB ?? {}
    )
    await notificarAgonista(
      agonista2Id,
      `⚡ Crisis resuelta: ${config.titulo}`,
      'Te sacrificaste. Tu rival no lo hizo. El Agon tiene memoria.',
      fila.crisisId
    )
    await notificarAgonista(
      agonista1Id,
      `⚡ Crisis resuelta: ${config.titulo}`,
      'Tu rival se sacrificó. Tú no lo hiciste. El Altis lo inscribió.',
      fila.crisisId
    )
    await publicarEventoAgora(
      fila.crisisId,
      'sacrificio_asimetrico',
      `${agonista2Nombre} cedió. ${agonista1Nombre} no lo hizo. El contraste es brutal.`,
      [agonista1Id, agonista2Id]
    )
    void desbloquearInscripcion(agonista2Id, agonista2Nombre, 'el_sacrificio')
  }
}

// ─── RESOLVER CRISIS TIPO F (APUESTA) ────────────────────────────────────────

async function resolverCrisisF(
  fila: typeof crisisCiudad.$inferSelect,
  config: CrisisConfig,
  agonista1Id: string,
  agonista2Id: string
): Promise<void> {
  const d1 = fila.decisionAgonista1
  const d2 = fila.decisionAgonista2
  const kleosApuesta = config.kleosApuesta ?? 200

  const ambosAceptaron = d1 === 'A' && d2 === 'A'
  const solo1Acepto = d1 === 'A' && d2 !== 'A'
  const solo2Acepto = d2 === 'A' && d1 !== 'A'

  if (ambosAceptaron && config.estrivia) {
    const p1 = fila.puntajeAgonista1 ?? 0
    const p2 = fila.puntajeAgonista2 ?? 0

    if (p1 > p2) {
      await aplicarKleos(agonista1Id, kleosApuesta)
      await aplicarKleos(agonista2Id, -kleosApuesta)
      const ganadorRow = await db
        .select({ nombre: agonistas.nombre })
        .from(agonistas)
        .where(eq(agonistas.id, agonista1Id))
        .limit(1)
      void desbloquearInscripcion(agonista1Id, ganadorRow[0]?.nombre ?? '', 'jamal_malik')
    } else if (p2 > p1) {
      await aplicarKleos(agonista2Id, kleosApuesta)
      await aplicarKleos(agonista1Id, -kleosApuesta)
      const ganadorRow = await db
        .select({ nombre: agonistas.nombre })
        .from(agonistas)
        .where(eq(agonistas.id, agonista2Id))
        .limit(1)
      void desbloquearInscripcion(agonista2Id, ganadorRow[0]?.nombre ?? '', 'jamal_malik')
    }
    if (config.consecuenciaA) {
      await aplicarConsecuencia(
        agonista1Id,
        fila.id,
        fila.crisisId,
        config.consecuenciaA
      )
      await aplicarConsecuencia(
        agonista2Id,
        fila.id,
        fila.crisisId,
        config.consecuenciaA
      )
    }
  } else if (ambosAceptaron && !config.estrivia) {
    if (config.consecuenciaA) {
      await aplicarConsecuencia(
        agonista1Id,
        fila.id,
        fila.crisisId,
        config.consecuenciaA
      )
      await aplicarConsecuencia(
        agonista2Id,
        fila.id,
        fila.crisisId,
        config.consecuenciaA
      )
    }
  } else if (solo1Acepto) {
    if (config.consecuenciaA)
      await aplicarConsecuencia(
        agonista1Id,
        fila.id,
        fila.crisisId,
        config.consecuenciaA
      )
    if (config.consecuenciaB)
      await aplicarConsecuencia(
        agonista2Id,
        fila.id,
        fila.crisisId,
        config.consecuenciaB
      )
    await notificarAgonista(
      agonista1Id,
      `⚡ Crisis: ${config.titulo}`,
      'Tu rival rechazó el desafío.',
      fila.crisisId
    )
    await notificarAgonista(
      agonista2Id,
      `⚡ Crisis: ${config.titulo}`,
      'Tu rival aceptó el desafío. Tú no.',
      fila.crisisId
    )
  } else if (solo2Acepto) {
    if (config.consecuenciaA)
      await aplicarConsecuencia(
        agonista2Id,
        fila.id,
        fila.crisisId,
        config.consecuenciaA
      )
    if (config.consecuenciaB)
      await aplicarConsecuencia(
        agonista1Id,
        fila.id,
        fila.crisisId,
        config.consecuenciaB
      )
    await notificarAgonista(
      agonista2Id,
      `⚡ Crisis: ${config.titulo}`,
      'Tu rival rechazó el desafío.',
      fila.crisisId
    )
    await notificarAgonista(
      agonista1Id,
      `⚡ Crisis: ${config.titulo}`,
      'Tu rival aceptó el desafío. Tú no.',
      fila.crisisId
    )
  } else {
    if (config.consecuenciaB) {
      await aplicarConsecuencia(
        agonista1Id,
        fila.id,
        fila.crisisId,
        config.consecuenciaB
      )
      await aplicarConsecuencia(
        agonista2Id,
        fila.id,
        fila.crisisId,
        config.consecuenciaB
      )
    }
  }
}

// ─── RESOLVER CRISIS PRINCIPAL ────────────────────────────────────────────────

export async function resolverCrisisVencidas(retoId: string): Promise<void> {
  try {
    const activa = await getCrisisActiva(retoId)
    if (!activa) return

    const { fila, config, agonista1Id, agonista2Id } = activa
    const esSolo = agonista1Id === agonista2Id

    const d1 = fila.decisionAgonista1
    const d2 = fila.decisionAgonista2
    const expirada = crisisExpirada(fila)
    const ambasDecididas = d1 !== null && d2 !== null
    const esPvP = (['D', 'H', 'F'] as const).some((m) =>
      config.mecanicas.includes(m)
    )

    if (!expirada) {
      if (esSolo) {
        if (esPvP) {
          if (!ambasDecididas) return
        } else if (!config.mecanicas.includes('G')) {
          if (d1 === null) return
        }
      } else {
        if (!ambasDecididas) return
      }
    }

    if (config.mecanicas.includes('G')) {
      const t1 = fila.respuestaTextoAgonista1
      const t2 = fila.respuestaTextoAgonista2
      if (!expirada) {
        if (esSolo) {
          if (!t1) return
        } else if (!t1 || !t2) {
          return
        }
      }
    }

    if (config.mecanicas.includes('H')) {
      if (esSolo) {
        const d = fila.decisionAgonista1
        const consec =
          d === 'A'
            ? config.consecuenciaA
            : (config.consecuenciaB ?? config.consecuenciaA)
        if (d && consec) {
          await aplicarConsecuencia(
            agonista1Id,
            fila.id,
            fila.crisisId,
            consec
          )
        }
      } else {
        await resolverCrisisH(fila, config, agonista1Id, agonista2Id)
      }
    } else if (config.mecanicas.includes('D')) {
      if (!esSolo) {
        const escenario = determinarEscenario(fila, agonista1Id, agonista1Id)
        if (escenario && escenario !== 'expiracion') {
          await resolverCrisisD(fila, config, agonista1Id, agonista2Id, escenario)
        }
      }
    } else if (config.mecanicas.includes('F')) {
      if (!esSolo) {
        await resolverCrisisF(fila, config, agonista1Id, agonista2Id)
      }
    } else {
      if (d1)
        await resolverCrisisIndividual(
          fila,
          config,
          agonista1Id,
          agonista1Id,
          d1
        )
      if (d2 && !esSolo)
        await resolverCrisisIndividual(
          fila,
          config,
          agonista2Id,
          agonista1Id,
          d2
        )
    }

    await db
      .update(crisisCiudad)
      .set({ resuelta: true })
      .where(eq(crisisCiudad.id, fila.id))

    const resolvedRows = await db
      .select({ id: crisisCiudad.id })
      .from(crisisCiudad)
      .where(
        and(eq(crisisCiudad.resuelta, true), eq(crisisCiudad.retoId, retoId))
      )
    const totalResueltas = resolvedRows.length

    const [a1NombreRow, a2NombreRow] = await Promise.all([
      db.select({ nombre: agonistas.nombre }).from(agonistas).where(eq(agonistas.id, agonista1Id)).limit(1),
      db.select({ nombre: agonistas.nombre }).from(agonistas).where(eq(agonistas.id, agonista2Id)).limit(1),
    ])
    const a1Nombre = a1NombreRow[0]?.nombre ?? ''
    const a2Nombre = a2NombreRow[0]?.nombre ?? ''

    if (totalResueltas === 1) {
      void desbloquearInscripcion(agonista1Id, a1Nombre, 'el_forjado_en_crisis')
      if (!esSolo) {
        void desbloquearInscripcion(agonista2Id, a2Nombre, 'el_forjado_en_crisis')
      }
    }
    if (totalResueltas >= 4) {
      void desbloquearInscripcion(agonista1Id, a1Nombre, 'mision_imposible')
      if (!esSolo) {
        void desbloquearInscripcion(agonista2Id, a2Nombre, 'mision_imposible')
      }
    }

    const tieneNotificacionesPropias =
      config.mecanicas.includes('D') ||
      config.mecanicas.includes('H') ||
      config.mecanicas.includes('F')

    if (!tieneNotificacionesPropias) {
      await notificarAgonista(
        agonista1Id,
        `⚡ Crisis resuelta: ${config.titulo}`,
        'La ciudad ha tomado su rumbo. El Altis lo inscribió.',
        fila.crisisId
      )
      if (!esSolo) {
        await notificarAgonista(
          agonista2Id,
          `⚡ Crisis resuelta: ${config.titulo}`,
          'La ciudad ha tomado su rumbo. El Altis lo inscribió.',
          fila.crisisId
        )
      }
    }
  } catch (_error) {
    console.error('[resolverCrisisVencidas] Error:', _error)
  }
}

// ─── APLICAR CONSECUENCIAS DIFERIDAS (Tipo I) ─────────────────────────────────

export async function aplicarConsecuenciasDiferidas(retoId: string): Promise<void> {
  try {
    const ahora = new Date()

    const crisisResueltas = await db
      .select()
      .from(crisisCiudad)
      .where(
        and(
          eq(crisisCiudad.resuelta, true),
          eq(crisisCiudad.consecuenciaDiferidaAplicada, false),
          eq(crisisCiudad.retoId, retoId)
        )
      )

    const ambos = await getAmbosAgonistas(retoId)
    if (ambos.length < 1) return

    const agonista1Id = ambos[0]!.id
    const agonista2Id = ambos[1]?.id ?? ambos[0]!.id

    for (const fila of crisisResueltas) {
      if (!fila.consecuenciaDiferidaFecha) continue
      if (new Date(fila.consecuenciaDiferidaFecha) > ahora) continue

      const config = getCrisis(fila.crisisId)
      if (!config) continue

      for (const { id: agonistId } of ambos) {
        const decision =
          agonistId === agonista1Id
            ? fila.decisionAgonista1
            : fila.decisionAgonista2

        const consecuenciaBase =
          decision === 'A' ? config.consecuenciaA : config.consecuenciaB

        if (!consecuenciaBase) continue

        if (consecuenciaBase.consecuenciaDiferidaAfinidad?.length) {
          await aplicarAfinidad(agonistId, {
            afinidad: consecuenciaBase.consecuenciaDiferidaAfinidad,
          })
        }

        if (consecuenciaBase.consecuenciaDiferidaKleos) {
          await aplicarKleos(agonistId, consecuenciaBase.consecuenciaDiferidaKleos)
        }

        if (consecuenciaBase.consecuenciaDiferidaEventoAgora) {
          const agonista = await db
            .select({ nombre: agonistas.nombre })
            .from(agonistas)
            .where(eq(agonistas.id, agonistId))
            .limit(1)

          await db.insert(postsDioses).values({
            id: crypto.randomUUID(),
            diosNombre: getDiosNarrador(config),
            tipo: consecuenciaBase.consecuenciaDiferidaEventoAgora,
            contenido: consecuenciaBase.consecuenciaDiferidaDescripcion ?? '',
            metadata: {
              crisisId: fila.crisisId,
              agonistaNombre: agonista[0]?.nombre ?? '',
            },
            cerrado: false,
          })
        }
      }

      if (fila.crisisId === 'sueno_eterno') {
        const perdedorId =
          fila.decisionAgonista1 !== 'A' ? agonista1Id : agonista2Id
        await db
          .update(crisisCiudad)
          .set({
            liderModificado: {
              faccionId: 'concilio_sombras',
              liderOriginal: 'Endimión',
              liderNuevo: 'Endimión (dormido)',
              descripcionNueva: `Morfeo cobró su precio. La meta de sueño de ${perdedorId} sube a 8h por 3 días.`,
            },
          })
          .where(eq(crisisCiudad.id, fila.id))
      }

      await db
        .update(crisisCiudad)
        .set({ consecuenciaDiferidaAplicada: true })
        .where(eq(crisisCiudad.id, fila.id))
    }
  } catch (_error) {
    console.error('[aplicarConsecuenciasDiferidas] Error:', _error)
  }
}
