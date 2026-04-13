import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  pgEnum,
  uniqueIndex,
  uuid,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── ENUMS ────────────────────────────────────────────

export const nivelEnum = pgEnum('nivel', [
  'aspirante',
  'atleta',
  'agonista',
  'luchador',
  'campeon',
  'heroe',
  'semidios',
  'olimpico',
  'leyenda_del_agon',
  'inmortal',
])

export const agoraEventoTipoEnum = pgEnum('agora_evento_tipo', [
  'prueba_completada',
  'dia_perfecto',
  'foto_subida',
  'nivel_subido',
  'inscripcion_desbloqueada',
  'hegemonia_ganada',
  'senalamiento',
  'provocacion',
  'cronica_semanal',
  'semana_sagrada',
  'prueba_extraordinaria',
])

export const aclamacionTipoEnum = pgEnum('aclamacion_tipo', [
  'fuego',
  'sin_piedad',
  'agonia',
  'digno_del_altis',
  'el_agon_te_juzga',
])

export const notificacionTipoEnum = pgEnum('notificacion_tipo', [
  'inscripcion_desbloqueada',
  'nivel_subido',
  'comentario_dios',
  'hegemonia_ganada',
  'prueba_extraordinaria',
  'senalamiento',
  'provocacion',
  'antagonista_activo',
  'mentor',
])

export const inscripcionTipoEnum = pgEnum('inscripcion_tipo', [
  'publica',
  'secreta',
  'easter_egg',
])

export const faccionIdEnum = pgEnum('faccion_id', [
  'guardia_hierro',
  'escuela_logos',
  'gremio_tierra',
  'hermandad_caos',
  'corredores_alba',
  'concilio_sombras',
  'tribunal_kleos',
])

// ─── AGONISTAS ────────────────────────────────────────
// Los dos participantes del Gran Agon

export const agonistas = pgTable('agonistas', {
  id: varchar('id', { length: 256 }).primaryKey(),
  clerkId: varchar('clerk_id', { length: 256 }).notNull().unique(),
  nombre: varchar('nombre', { length: 256 }).notNull(),
  nivel: nivelEnum('nivel').default('aspirante').notNull(),
  kleosTotal: integer('kleos_total').default(0).notNull(),
  diasPerfectos: integer('dias_perfectos').default(0).notNull(),
  oraculoMensaje: text('oraculo_mensaje'),
  oraculoSellado: boolean('oraculo_sellado').default(false).notNull(),
  senalamiento_usado: boolean('senalamiento_usado').default(false).notNull(),
  senalamiento_recibido: boolean('senalamiento_recibido').default(false).notNull(),
  consultaMediaCompleta: boolean('consulta_media_completa').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  mentorAsignado: varchar('mentor_asignado', { length: 64 }),
})

// ─── PRUEBAS DIARIAS ──────────────────────────────────
// Registro de cada hábito por día por agonista

export const pruebasDiarias = pgTable('pruebas_diarias', {
  id: varchar('id', { length: 256 }).primaryKey(),
  agonistId: varchar('agonista_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  fecha: date('fecha').notNull(),

  // Toggles
  soloAgua: boolean('solo_agua').default(false).notNull(),
  sinComidaRapida: boolean('sin_comida_rapida').default(false).notNull(),

  // Contadores diarios
  pasos: integer('pasos').default(0).notNull(),
  horasSueno: integer('horas_sueno').default(0).notNull(),
  paginasLeidas: integer('paginas_leidas').default(0).notNull(),

  // Contadores semanales (acumulados en el registro diario)
  sesionesGym: integer('sesiones_gym').default(0).notNull(),
  sesionesCardio: integer('sesiones_cardio').default(0).notNull(),

  // URLs de fotos (Vercel Blob)
  fotoGymUrl: text('foto_gym_url'),
  fotoCardioUrl: text('foto_cardio_url'),

  // Kleos del día
  kleosGanado: integer('kleos_ganado').default(0).notNull(),
  diaPerfecto: boolean('dia_perfecto').default(false).notNull(),

  // Prueba extraordinaria del día
  pruebaExtraordinariaCompletada: boolean('prueba_extraordinaria_completada')
    .default(false)
    .notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── KLEOS LOG ────────────────────────────────────────
// Historial de kleos ganado — para auditoría y La Crónica

export const kleosLog = pgTable('kleos_log', {
  id: varchar('id', { length: 256 }).primaryKey(),
  agonistId: varchar('agonista_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  cantidad: integer('cantidad').notNull(),
  motivo: varchar('motivo', { length: 256 }).notNull(),
  fecha: date('fecha').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── LLAMAS ───────────────────────────────────────────
// Racha activa por hábito (La Llama del Agon)

export const llamas = pgTable('llamas', {
  id: varchar('id', { length: 256 }).primaryKey(),
  agonistId: varchar('agonista_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  habitoId: varchar('habito_id', { length: 64 }).notNull(),
  rachaActual: integer('racha_actual').default(0).notNull(),
  rachMaxima: integer('racha_maxima').default(0).notNull(),
  ultimaFecha: date('ultima_fecha'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── INSCRIPCIONES ────────────────────────────────────
// Logros desbloqueados por cada agonista

export const inscripciones = pgTable('inscripciones', {
  id: varchar('id', { length: 256 }).primaryKey(),
  agonistId: varchar('agonista_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  inscripcionId: varchar('inscripcion_id', { length: 64 }).notNull(),
  secreto: boolean('secreto').default(false).notNull(),
  tipo: inscripcionTipoEnum('tipo').default('publica').notNull(),
  desbloqueadoEn: timestamp('desbloqueado_en').defaultNow().notNull(),
})

// ─── ÁGORA EVENTOS ────────────────────────────────────
// Feed de actividad compartido (El Ágora)

export const agoraEventos = pgTable('agora_eventos', {
  id: varchar('id', { length: 256 }).primaryKey(),
  agonistId: varchar('agonista_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  tipo: agoraEventoTipoEnum('tipo').notNull(),
  contenido: text('contenido').notNull(),
  metadata: jsonb('metadata'),
  fotoUrl: text('foto_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── ACLAMACIONES ─────────────────────────────────────
// Reacciones limitadas en El Ágora (5 por día)

export const aclamaciones = pgTable('aclamaciones', {
  id: varchar('id', { length: 256 }).primaryKey(),
  agonistId: varchar('agonista_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  eventoId: varchar('evento_id', { length: 256 })
    .notNull()
    .references(() => agoraEventos.id),
  tipo: aclamacionTipoEnum('tipo').notNull(),
  fecha: date('fecha').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── CORRESPONDENCIA ──────────────────────────────────
// Chat directo entre los dos agonistas

export const correspondencia = pgTable('correspondencia', {
  id: varchar('id', { length: 256 }).primaryKey(),
  remitenteId: varchar('remitente_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  contenido: text('contenido').notNull(),
  leido: boolean('leido').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── HEGEMONÍAS ───────────────────────────────────────
// Registro semanal de quién ganó la Hegemonía

export const hegemonias = pgTable('hegemonias', {
  id: varchar('id', { length: 256 }).primaryKey(),
  semana: integer('semana').notNull(),
  fechaInicio: date('fecha_inicio').notNull(),
  fechaFin: date('fecha_fin').notNull(),
  ganadorId: varchar('ganador_id', { length: 256 }).references(
    () => agonistas.id
  ),
  kleosGanador: integer('kleos_ganador').default(0).notNull(),
  kleosRival: integer('kleos_rival').default(0).notNull(),
  empate: boolean('empate').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── SEÑALAMIENTO ─────────────────────────────────────
// Estado del Señalamiento (una vez por Gran Agon)

export const senalamiento = pgTable('senalamiento', {
  id: varchar('id', { length: 256 }).primaryKey(),
  senaladorId: varchar('senalador_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  senaladorId2: varchar('senalado_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  fechaSenalamiento: timestamp('fecha_senalamiento').defaultNow().notNull(),
  pruebaCompletada: boolean('prueba_completada').default(false).notNull(),
  kleosRestados: boolean('kleos_restados').default(false).notNull(),
})

// ─── SEMANA SAGRADA ───────────────────────────────────
// Configuración del evento de doble kleos

export const semanaSagrada = pgTable('semana_sagrada', {
  id: varchar('id', { length: 256 }).primaryKey(),
  activa: boolean('activa').default(false).notNull(),
  fechaInicio: date('fecha_inicio'),
  fechaFin: date('fecha_fin'),
  activadaEn: timestamp('activada_en'),
})

// ─── PRUEBA EXTRAORDINARIA ────────────────────────────
// Tríptico semanal + Eventos del Destino (V2)

export const pruebaExtraordinaria = pgTable('prueba_extraordinaria', {
  id: varchar('id', { length: 256 }).primaryKey(),
  semana: integer('semana').notNull(),
  dia: integer('dia').notNull(),
  fecha: date('fecha').notNull(),
  pruebaId: varchar('prueba_id', { length: 64 }).notNull(),
  tipo: varchar('tipo', { length: 32 }).notNull(),
  descripcion: text('descripcion').notNull(),
  kleosBonus: integer('kleos_bonus').notNull(),
  dificultad: varchar('dificultad', { length: 32 }).notNull(),
  activa: boolean('activa').default(true).notNull(),
  fechaExpira: timestamp('fecha_expira').notNull(),
  completadaPorJavier: boolean('completada_por_javier').default(false).notNull(),
  completadaPorMatias: boolean('completada_por_matias').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Calendario pre-generado del Gran Agon (día 1)
export const calendarioAgan = pgTable('calendario_agon', {
  id: varchar('id', { length: 256 }).primaryKey(),
  generadoEn: timestamp('generado_en').defaultNow().notNull(),
  semanaSagradaSemana: integer('semana_sagrada_semana').notNull(),
  tripticoOrden: jsonb('triptico_orden').notNull(),
  destinoOrden: jsonb('destino_orden').notNull(),
  destinoHorarios: jsonb('destino_horarios').notNull(),
})

// ─── CRÓNICAS ─────────────────────────────────────────
// Resúmenes semanales generados por IA (La Crónica del Período)

export const cronicas = pgTable('cronicas', {
  id: varchar('id', { length: 256 }).primaryKey(),
  semana: integer('semana').notNull(),
  fechaInicio: date('fecha_inicio').notNull(),
  fechaFin: date('fecha_fin').notNull(),
  relato: text('relato').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── EKECHEIRIA ───────────────────────────────────────
// Registro de la tregua sagrada (Cláusula 69)

export const ekecheiria = pgTable('ekecheiria', {
  id: varchar('id', { length: 256 }).primaryKey(),
  agonistId: varchar('agonista_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  motivo: text('motivo').notNull(),
  fechaInicio: date('fecha_inicio').notNull(),
  fechaFin: date('fecha_fin'),
  activa: boolean('activa').default(true).notNull(),
  confirmacion_levantar_1: varchar('confirmacion_levantar_1', { length: 256 }),
  confirmacion_levantar_2: varchar('confirmacion_levantar_2', { length: 256 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── La Consulta del Mediodía ─────────────────────────────────────────────

export const consultaMediodia = pgTable(
  'consulta_mediodia',
  {
    id: varchar('id', { length: 256 }).primaryKey(),
    agonistId: varchar('agonista_id', { length: 256 })
      .notNull()
      .references(() => agonistas.id, { onDelete: 'cascade' }),
    elSacrificio: text('el_sacrificio').notNull(),
    elMomento: text('el_momento').notNull(),
    queHaCambiado: text('que_ha_cambiado').notNull(),
    mentorAnterior: varchar('mentor_anterior', { length: 64 }).notNull(),
    mentorNuevo: varchar('mentor_nuevo', { length: 64 }),
    aceptoCambioMentor: boolean('acepto_cambio_mentor').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [index('consulta_mediodia_agonist_id_idx').on(t.agonistId)]
)

// ─── PACTO INICIAL ────────────────────────────────────
// Declaraciones selladas al inicio del reto (Acto 1) y al mediodía (Acto 2)

export const arquetipoEnum = pgEnum('arquetipo', [
  'constante',
  'explosivo',
  'metodico',
  'caotico',
])

export const pactoInicial = pgTable('pacto_inicial', {
  id: varchar('id', { length: 256 }).primaryKey(),
  agonistId: varchar('agonista_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  acto: integer('acto').notNull().default(1),

  // Bloque 1 — Tú
  objetivo: text('objetivo').notNull(),
  arquetipo: arquetipoEnum('arquetipo').notNull(),
  puntoPartida: varchar('punto_partida', { length: 64 }).notNull(),
  compromisoEscala: integer('compromiso_escala').notNull(),

  // Línea base declarada — para detección de sobreexigencia
  lineaBaseGym: integer('linea_base_gym').notNull().default(0),
  lineaBaseCardio: integer('linea_base_cardio').notNull().default(0),
  lineaBasePaginas: integer('linea_base_paginas').notNull().default(0),

  // Bloque 2 — Tu sombra
  sombraTipo: text('sombra_tipo').notNull(),
  apuestaGanas: text('apuesta_ganas').notNull(),
  apuestaPierdes: text('apuesta_pierdes').notNull(),

  // Bloque 3 — El rival
  rivalFortalezas: jsonb('rival_fortalezas').notNull().$type<string[]>(),
  rivalDebilidad: text('rival_debilidad').notNull(),
  preocupacionEscala: jsonb('preocupacion_escala')
    .notNull()
    .$type<{
      tiempo: number
      constancia: number
      rival: number
    }>(),

  // Mentor asignado por lógica arquetipo + puntoPartida
  mentorAsignado: varchar('mentor_asignado', { length: 64 }).notNull(),

  completadoEn: timestamp('completado_en').defaultNow().notNull(),
})

// ─── MENTOR CONVERSACIONES ────────────────────────────
// Historial completo de conversaciones con el Mentor asignado

export const mentorConversaciones = pgTable('mentor_conversaciones', {
  id: varchar('id', { length: 256 }).primaryKey(),
  agonistId: varchar('agonista_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  rol: varchar('rol', { length: 16 }).notNull(), // 'user' | 'mentor'
  contenido: text('contenido').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── COMENTARIOS DEL ÁGORA ────────────────────────────

export const comentariosAgora = pgTable('comentarios_agora', {
  id: varchar('id', { length: 256 }).primaryKey(),
  eventoId: varchar('evento_id', { length: 256 })
    .notNull()
    .references(() => agoraEventos.id),
  autorTipo: varchar('autor_tipo', { length: 32 }).notNull(), // 'agonista' | 'dios'
  autorId: varchar('autor_id', { length: 256 }).notNull(),
  autorNombre: varchar('autor_nombre', { length: 128 }).notNull(),
  contenido: text('contenido').notNull(),
  /** false = fila de dios pendiente de generar texto (cola unificada). */
  procesado: boolean('procesado').default(true).notNull(),
  /** null = inmediato; fecha futura = procesar en verificar. */
  procesarDespuesDe: timestamp('procesar_despues_de'),
  /** Tipo lógico para la IA (p. ej. override `prueba_extraordinaria_expirada`). */
  tipoGeneracion: varchar('tipo_generacion', { length: 64 }),
  visto: boolean('visto').default(false).notNull(),
  cerrado: boolean('cerrado').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── LIKES DEL ÁGORA ──────────────────────────────────

export const likesAgora = pgTable(
  'likes_agora',
  {
    id: varchar('id', { length: 256 }).primaryKey(),
    eventoId: varchar('evento_id', { length: 256 })
      .notNull()
      .references(() => agoraEventos.id),
    autorTipo: varchar('autor_tipo', { length: 32 }).notNull(),
    autorId: varchar('autor_id', { length: 256 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('likes_agora_evento_autor_uidx').on(t.eventoId, t.autorId),
  ]
)

// ─── POSTS DE LOS DIOSES ──────────────────────────────

export const postsDioses = pgTable('posts_dioses', {
  id: varchar('id', { length: 256 }).primaryKey(),
  diosNombre: varchar('dios_nombre', { length: 64 }).notNull(),
  tipo: varchar('tipo', { length: 32 }).notNull(),
  contenido: text('contenido').notNull(),
  eventoRelacionadoId: varchar('evento_relacionado_id', { length: 256 }),
  cerrado: boolean('cerrado').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── NOTIFICACIONES ───────────────────────────────────

export const notificaciones = pgTable('notificaciones', {
  id: varchar('id', { length: 256 }).primaryKey(),
  agonistId: varchar('agonista_id', { length: 256 })
    .notNull()
    .references(() => agonistas.id),
  tipo: notificacionTipoEnum('tipo').notNull(),
  titulo: varchar('titulo', { length: 256 }).notNull(),
  descripcion: text('descripcion').notNull(),
  metadata: jsonb('metadata'),
  leida: boolean('leida').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ─── Ciudad de Olimpia — Sistema de Afinidad ─────────────────────────────────

export const faccionesAfinidad = pgTable(
  'facciones_afinidad',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    agonistId: varchar('agonista_id', { length: 256 })
      .notNull()
      .references(() => agonistas.id, { onDelete: 'cascade' }),
    faccionId: faccionIdEnum('faccion_id').notNull(),
    puntosAfinidad: integer('puntos_afinidad').notNull().default(0),
    rango: integer('rango').notNull().default(1),
    rachaMilestoneMaximo: integer('racha_milestone_maximo').notNull().default(0),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('facciones_afinidad_unique_idx').on(t.agonistId, t.faccionId),
  ]
)

// ─── RELATIONS ────────────────────────────────────────

export const agonistasRelations = relations(agonistas, ({ many }) => ({
  pruebasDiarias: many(pruebasDiarias),
  kleosLog: many(kleosLog),
  llamas: many(llamas),
  inscripciones: many(inscripciones),
  agoraEventos: many(agoraEventos),
  aclamaciones: many(aclamaciones),
  correspondenciaEnviada: many(correspondencia),
  ekecheiria: many(ekecheiria),
  pactosIniciales: many(pactoInicial),
  mentorConversaciones: many(mentorConversaciones),
  notificaciones: many(notificaciones),
}))

export const pruebasDiariasRelations = relations(pruebasDiarias, ({ one }) => ({
  agonista: one(agonistas, {
    fields: [pruebasDiarias.agonistId],
    references: [agonistas.id],
  }),
}))

export const agoraEventosRelations = relations(agoraEventos, ({ one, many }) => ({
  agonista: one(agonistas, {
    fields: [agoraEventos.agonistId],
    references: [agonistas.id],
  }),
  aclamaciones: many(aclamaciones),
}))

export const aclamacionesRelations = relations(aclamaciones, ({ one }) => ({
  agonista: one(agonistas, {
    fields: [aclamaciones.agonistId],
    references: [agonistas.id],
  }),
  evento: one(agoraEventos, {
    fields: [aclamaciones.eventoId],
    references: [agoraEventos.id],
  }),
}))

export const notificacionesRelations = relations(notificaciones, ({ one }) => ({
  agonista: one(agonistas, {
    fields: [notificaciones.agonistId],
    references: [agonistas.id],
  }),
}))

export const pactoInicialRelations = relations(pactoInicial, ({ one }) => ({
  agonista: one(agonistas, {
    fields: [pactoInicial.agonistId],
    references: [agonistas.id],
  }),
}))

export const mentorConversacionesRelations = relations(mentorConversaciones, ({ one }) => ({
  agonista: one(agonistas, {
    fields: [mentorConversaciones.agonistId],
    references: [agonistas.id],
  }),
}))

// ─── TIPOS INFERIDOS ──────────────────────────────────

export type Agonista = typeof agonistas.$inferSelect
export type NuevoAgonista = typeof agonistas.$inferInsert
export type PruebaDiaria = typeof pruebasDiarias.$inferSelect
export type NuevaPruebaDiaria = typeof pruebasDiarias.$inferInsert
export type AgoraEvento = typeof agoraEventos.$inferSelect
export type NuevoAgoraEvento = typeof agoraEventos.$inferInsert
export type Correspondencia = typeof correspondencia.$inferSelect
export type Inscripcion = typeof inscripciones.$inferSelect
export type Llama = typeof llamas.$inferSelect
export type Hegemonia = typeof hegemonias.$inferSelect
export type Cronica = typeof cronicas.$inferSelect
export type Ekecheiria = typeof ekecheiria.$inferSelect
export type ConsultaMediodia = typeof consultaMediodia.$inferSelect
export type PactoInicial = typeof pactoInicial.$inferSelect
export type NuevoPactoInicial = typeof pactoInicial.$inferInsert
export type ArquetipoKey = 'constante' | 'explosivo' | 'metodico' | 'caotico'
export type PuntoPartidaKey =
  | 'fecha_limite'
  | 'reconstruccion'
  | 'interno'
  | 'transformacion'
export type MentorConversacion = typeof mentorConversaciones.$inferSelect
export type ComentarioAgora = typeof comentariosAgora.$inferSelect
export type LikeAgora = typeof likesAgora.$inferSelect
export type PostDios = typeof postsDioses.$inferSelect
export type Notificacion = typeof notificaciones.$inferSelect
export type NuevaNotificacion = typeof notificaciones.$inferInsert
