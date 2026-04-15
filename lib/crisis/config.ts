// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type CrisisMecanica = 'A' | 'B' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I'

export type CrisisDecision = 'A' | 'B'

export interface ConsecuenciaAfinidad {
  faccionId: string
  puntos: number // positivo = ganar, negativo = perder
}

export interface ConsecuenciaCrisis {
  afinidad?: ConsecuenciaAfinidad[]
  kleos?: number // positivo = ganar, negativo = perder
  marcaE?: string // texto de la marca narrativa permanente
  eventoAgora?: string // tipo del evento a insertar
  liderModificado?: {
    faccionId: string
    liderOriginal: string
    liderNuevo: string
    descripcionNueva: string
  }
  consecuenciaDiferidaDias?: number // días hasta aplicar Tipo I
  consecuenciaDiferidaDescripcion?: string
  consecuenciaDiferidaAfinidad?: ConsecuenciaAfinidad[]
  consecuenciaDiferidaKleos?: number
  consecuenciaDiferidaEventoAgora?: string
  metaSuenoBonus?: number // para El Sueño Eterno — sube meta horasSueno
}

export interface EscenarioD {
  descripcionAgora: string
  paraDecisionA: ConsecuenciaCrisis
  paraDecisionB: ConsecuenciaCrisis
}

export interface CrisisConfig {
  id: string
  titulo: string
  lider?: string // líder de facción involucrado
  mecanicas: CrisisMecanica[]
  descripcionNarrativa: string
  opcionA: {
    label: string
    argumentoFavor: string
    argumentoContra: string
  }
  opcionB: {
    label: string
    argumentoFavor: string
    argumentoContra: string
  }
  // Consecuencias para crisis sin Tipo D (se aplican individualmente)
  consecuenciaA?: ConsecuenciaCrisis
  consecuenciaB?: ConsecuenciaCrisis
  // Para Tipo D — 4 escenarios
  escenarioAmbosA?: ConsecuenciaCrisis & { descripcionAgora: string }
  escenarioAmbosB?: ConsecuenciaCrisis & { descripcionAgora: string }
  escenarioYoArivaB?: ConsecuenciaCrisis & {
    descripcionAgora: string
    notificacionA: string
    notificacionB: string
  }
  escenarioYoBrivaA?: ConsecuenciaCrisis & {
    descripcionAgora: string
    notificacionA: string
    notificacionB: string
  }
  // Para Tipo F — apuesta
  habitoApuesta?: string // 'pasos' | 'paginasLeidas' etc
  kleosApuesta?: number
  diasApuesta?: number
  // Para Tipo H — sacrificio
  kleosSacrificio?: number
  kleosRecompensaAmbos?: number
  // Para trivia (Crisis 9)
  estrivia?: boolean
  categoriasTrivia?: string[]
}

// ─── POOL DE CRISIS ───────────────────────────────────────────────────────────

export const CRISIS_POOL: CrisisConfig[] = [
  // ─── 1. La Sequía del Logos ───────────────────────────────────────────────
  {
    id: 'sequia_logos',
    titulo: 'La Sequía del Logos',
    mecanicas: ['A'],
    descripcionNarrativa:
      'Un mensajero llega al Ágora con noticias que helan la sangre: los pozos de sabiduría de la Escuela del Logos se están secando. Los pergaminos arden solos. Apolo guarda silencio. Los eruditos dicen que es castigo — que el Agon ha glorificado demasiado el músculo y olvidado la mente. Ares responde que la mente sin cuerpo es humo. La ciudad debe decidir cómo responder.',
    opcionA: {
      label: 'Redirigimos los recursos hacia la Escuela',
      argumentoFavor: 'Sin conocimiento, la victoria es vacía. Un campeón ignorante es solo un animal disciplinado.',
      argumentoContra: 'Debilitar el cuerpo ahora, en medio del Agon, es rendirse a medias.',
    },
    opcionB: {
      label: 'El Agon no se detiene — la Escuela se reconstruye sola',
      argumentoFavor: 'Las instituciones sobreviven a las crisis cuando los individuos no se rinden. Tu rendimiento es el mensaje.',
      argumentoContra: 'Ignorar el colapso del conocimiento es elegir la fuerza bruta sobre la civilización.',
    },
    consecuenciaA: {
      afinidad: [
        { faccionId: 'escuela_logos', puntos: 35 },
        { faccionId: 'concilio_sombras', puntos: 35 },
        { faccionId: 'tribunal_kleos', puntos: 35 },
        { faccionId: 'guardia_hierro', puntos: -25 },
        { faccionId: 'corredores_alba', puntos: -25 },
      ],
      marcaE: 'Redirigió los recursos hacia el Logos cuando los pergaminos ardían.',
    },
    consecuenciaB: {
      afinidad: [
        { faccionId: 'guardia_hierro', puntos: 35 },
        { faccionId: 'corredores_alba', puntos: 35 },
        { faccionId: 'hermandad_caos', puntos: 35 },
        { faccionId: 'escuela_logos', puntos: -25 },
        { faccionId: 'gremio_tierra', puntos: -25 },
      ],
      marcaE: 'Eligió que el Agon continuara cuando la Escuela ardía.',
    },
  },

  // ─── 2. El Extranjero en las Puertas ──────────────────────────────────────
  {
    id: 'extranjero_puertas',
    titulo: 'El Extranjero en las Puertas',
    mecanicas: ['A'],
    descripcionNarrativa:
      'Un guerrero extranjero llega a Olimpia. No viene a combatir — viene huyendo. Trae consigo conocimiento de técnicas de entrenamiento nunca vistas, pero también trae una maldición, dicen los sacerdotes de Morfeo: quienes duermen cerca de él pierden el descanso sagrado. La Guardia de Hierro quiere absorberlo. El Concilio de las Sombras exige expulsarlo.',
    opcionA: {
      label: 'El extranjero se queda — su conocimiento vale el riesgo',
      argumentoFavor: 'El progreso siempre llega desde afuera. Rechazar lo desconocido es elegir la mediocridad conocida.',
      argumentoContra: 'El bienestar de la ciudad no puede sacrificarse por la ambición de unos pocos. El sueño es sagrado.',
    },
    opcionB: {
      label: 'El extranjero debe partir — la ciudad no es un experimento',
      argumentoFavor: 'Una ciudad que no protege a sus ciudadanos del caos no merece llamarse ciudad.',
      argumentoContra: 'El miedo disfrazado de prudencia es cobardía. Olimpia se construyó acogiendo lo que otras ciudades rechazaron.',
    },
    consecuenciaA: {
      afinidad: [
        { faccionId: 'guardia_hierro', puntos: 35 },
        { faccionId: 'escuela_logos', puntos: 35 },
        { faccionId: 'corredores_alba', puntos: 35 },
        { faccionId: 'concilio_sombras', puntos: -25 },
        { faccionId: 'gremio_tierra', puntos: -25 },
      ],
      marcaE: 'Abrió las puertas de Olimpia al extranjero y su conocimiento.',
    },
    consecuenciaB: {
      afinidad: [
        { faccionId: 'concilio_sombras', puntos: 35 },
        { faccionId: 'gremio_tierra', puntos: 35 },
        { faccionId: 'tribunal_kleos', puntos: 35 },
        { faccionId: 'guardia_hierro', puntos: -25 },
        { faccionId: 'hermandad_caos', puntos: -25 },
      ],
      marcaE: 'Cerró las puertas de Olimpia al extranjero para proteger el descanso sagrado.',
    },
  },

  // ─── 3. La Traición del Altis ─────────────────────────────────────────────
  {
    id: 'traicion_altis',
    titulo: 'La Traición del Altis',
    mecanicas: ['A', 'D'],
    descripcionNarrativa:
      'Los registros del Altis muestran una anomalía. Alguien acumuló kleos en circunstancias que el Tribunal no puede explicar. No hay pruebas — solo sospecha. Y la sospecha en el Agon es veneno. Eris sonríe. Nike exige respuestas. La ciudad mira a los dos agonistas y espera.',
    opcionA: {
      label: 'Señalo a mi rival ante el Tribunal',
      argumentoFavor: 'Si hay trampa, el silencio es complicidad. El Agon exige transparencia.',
      argumentoContra: 'Acusar sin prueba es el arma del cobarde. Si estás equivocado, destruiste algo que no tenía precio.',
    },
    opcionB: {
      label: 'Guardo silencio — el Agon me dará la razón',
      argumentoFavor: 'La dignidad no se negocia. Quien gana limpio no necesita destruir al otro.',
      argumentoContra: 'Tu silencio será interpretado como miedo o como culpa. Olimpia no perdona la pasividad.',
    },
    escenarioAmbosA: {
      descripcionAgora: 'Dos dedos apuntan en direcciones opuestas. El Tribunal del Kleos no sabe a quién creer. Eris ríe a carcajadas. La ciudad entera toma partido.',
      afinidad: [
        { faccionId: 'hermandad_caos', puntos: 40 },
        { faccionId: 'tribunal_kleos', puntos: -30 },
        { faccionId: 'gremio_tierra', puntos: -20 },
      ],
      marcaE: 'Acusó al rival — quien también lo acusó. El Tribunal quedó paralizado.',
      eventoAgora: 'rivalidad_acusacion_mutua',
    },
    escenarioAmbosB: {
      descripcionAgora: 'Dos guerreros que se miran a los ojos y no dicen nada. El Tribunal archiva el caso. El silencio puede ser dignidad — o puede ser miedo.',
      afinidad: [
        { faccionId: 'concilio_sombras', puntos: 35 },
        { faccionId: 'gremio_tierra', puntos: 35 },
        { faccionId: 'hermandad_caos', puntos: -20 },
      ],
      marcaE: 'Guardó silencio ante la sospecha. El Tribunal archivó el caso.',
    },
    escenarioYoArivaB: {
      descripcionAgora: 'Un agonista señaló. El otro no respondió. El silencio puede ser dignidad — o puede ser culpa. Olimpia decidirá qué creer.',
      notificacionA: 'Señalaste a tu rival. Él guardó silencio. El Ágora lo registra.',
      notificacionB: 'Tu rival te señaló ante el Tribunal. Tú guardaste silencio. El Altis lo inscribió.',
      afinidad: [
        { faccionId: 'hermandad_caos', puntos: 30 },
        { faccionId: 'tribunal_kleos', puntos: 30 },
        { faccionId: 'gremio_tierra', puntos: -15 },
      ],
      marcaE: 'Señaló cuando su rival guardó silencio.',
      eventoAgora: 'rivalidad_acusacion',
    },
    escenarioYoBrivaA: {
      descripcionAgora: 'Un agonista guardó silencio. El otro lo señaló. El silencio puede ser dignidad — o puede ser culpa.',
      notificacionA: 'Tu rival te señaló. Tú guardaste silencio. El Altis lo inscribió.',
      notificacionB: 'Guardaste silencio cuando tu rival te señaló. El Agon tiene memoria.',
      afinidad: [
        { faccionId: 'concilio_sombras', puntos: 30 },
        { faccionId: 'escuela_logos', puntos: 30 },
        { faccionId: 'hermandad_caos', puntos: -15 },
      ],
      marcaE: 'Guardó silencio cuando su rival lo señaló ante el Tribunal.',
    },
  },

  // ─── 4. El Precio del Fuego ───────────────────────────────────────────────
  {
    id: 'precio_fuego',
    titulo: 'El Precio del Fuego',
    mecanicas: ['B', 'E'],
    descripcionNarrativa:
      'Prometeo ha vuelto a Olimpia — encadenado a una roca que nadie recuerda haber puesto ahí. Los sacerdotes dicen que trae un don: conocimiento que acelera el progreso. Pero los dioses lo encadenaron por algo. Apolo advierte que el fuego robado siempre tiene un precio. Hermes dice que el conocimiento no tiene dueño.',
    opcionA: {
      label: 'Acepto el don de Prometeo',
      argumentoFavor: 'Los dioses encadenaron a Prometeo por miedo, no por justicia. El conocimiento que libera no puede ser pecado.',
      argumentoContra: 'Cada atajo tiene un costo diferido. Lo que Prometeo da, los dioses lo cobran con interés.',
    },
    opcionB: {
      label: 'Rechazo el don — lo que se roba no se merece',
      argumentoFavor: 'La disciplina del Agon no admite atajos. Lo que no se gana con sudor no pertenece al agonista.',
      argumentoContra: 'Rechazas poder real por un principio abstracto mientras tu rival quizás no lo hará.',
    },
    consecuenciaA: {
      kleos: 150,
      marcaE: 'Aceptó el fuego de Prometeo.',
    },
    consecuenciaB: {
      kleos: -50,
      afinidad: [
        { faccionId: 'tribunal_kleos', puntos: 40 },
        { faccionId: 'gremio_tierra', puntos: 40 },
      ],
      marcaE: 'Rechazó el fuego — eligió el camino largo.',
    },
  },

  // ─── 5. El Juicio de las Sombras ──────────────────────────────────────────
  {
    id: 'juicio_sombras',
    titulo: 'El Juicio de las Sombras',
    mecanicas: ['A', 'D'],
    descripcionNarrativa:
      'El Concilio de las Sombras ha convocado un juicio extraordinario. Morfeo reveló en sueños que uno de los dos agonistas está sacrificando el descanso sagrado — no por descuido, sino por estrategia. Que está usando el agotamiento como arma. El Concilio exige que cada agonista declare si el otro está durmiendo lo suficiente. No hay forma de verificarlo. Solo existe la palabra de cada uno.',
    opcionA: {
      label: 'Denuncio — mi rival sacrifica el sueño deliberadamente',
      argumentoFavor: 'El Agon no puede construirse sobre el colapso físico. Señalarlo es proteger la integridad del reto.',
      argumentoContra: 'Acusar algo que no puedes probar es sembrar desconfianza donde había competencia limpia.',
    },
    opcionB: {
      label: 'Defiendo — mi rival descansa lo suficiente',
      argumentoFavor: 'La generosidad sobre la ventaja táctica es el acto más honesto que puede hacer un agonista.',
      argumentoContra: 'Si mientes para protegerlo, estás mintiendo ante el Concilio de las Sombras. Morfeo escucha.',
    },
    escenarioAmbosA: {
      descripcionAgora: 'Dos agonistas que se miran y ven en el otro lo que temen encontrar en sí mismos. Morfeo cierra los ojos. El Concilio no puede resolver lo que ninguno puede probar.',
      afinidad: [
        { faccionId: 'hermandad_caos', puntos: 35 },
        { faccionId: 'concilio_sombras', puntos: -30 },
        { faccionId: 'gremio_tierra', puntos: -20 },
      ],
      marcaE: 'Se denunciaron mutuamente ante el Concilio de las Sombras.',
      eventoAgora: 'rivalidad_igualados',
    },
    escenarioAmbosB: {
      descripcionAgora: 'Dos rivales que eligieron la generosidad sobre la ventaja. Morfeo suspira satisfecho. El Concilio los absuelve a ambos.',
      afinidad: [
        { faccionId: 'concilio_sombras', puntos: 40 },
        { faccionId: 'gremio_tierra', puntos: 40 },
        { faccionId: 'hermandad_caos', puntos: -25 },
      ],
      marcaE: 'Defendió al rival ante el Concilio cuando pudo haberlo acusado.',
    },
    escenarioYoArivaB: {
      descripcionAgora: 'Uno denunció. El otro defendió de todas formas. Morfeo no sabe si llorar o reír.',
      notificacionA: 'Acusaste a quien te defendió. El Altis lo registra.',
      notificacionB: 'Defendiste a quien te acusó. El Agon tiene memoria.',
      afinidad: [
        { faccionId: 'hermandad_caos', puntos: 25 },
        { faccionId: 'concilio_sombras', puntos: -35 },
        { faccionId: 'gremio_tierra', puntos: -35 },
      ],
      marcaE: 'Acusó a quien lo defendió ante el Concilio de las Sombras.',
    },
    escenarioYoBrivaA: {
      descripcionAgora: 'Uno defendió. El otro acusó de todas formas. Morfeo no sabe si llorar o reír.',
      notificacionA: 'Defendiste a quien te acusó. El Agon tiene memoria.',
      notificacionB: 'Acusaste a quien te defendió. El Altis lo registra.',
      afinidad: [
        { faccionId: 'concilio_sombras', puntos: 40 },
        { faccionId: 'tribunal_kleos', puntos: 40 },
        { faccionId: 'hermandad_caos', puntos: -10 },
      ],
      marcaE: 'Defendió al rival ante el Concilio cuando él lo acusó.',
    },
  },

  // ─── 6. La Llama que Devora ───────────────────────────────────────────────
  {
    id: 'llama_devora',
    titulo: 'La Llama que Devora',
    mecanicas: ['A', 'B'],
    descripcionNarrativa:
      'Un incendio arrasa los almacenes del Gremio de la Tierra. No fue accidente — los rastros de azufre apuntan a un ritual. Los sacerdotes de Deméter lloran sobre las cenizas. La ciudad tiene reservas para sobrevivir, pero no para prosperar. El Agon puede continuar como está, o puede transformarse temporalmente en un esfuerzo colectivo de reconstrucción.',
    opcionA: {
      label: 'Suspendemos el Agon — reconstruimos primero',
      argumentoFavor: 'Un Agon sobre cenizas es una farsa. La grandeza se mide en cómo respondes cuando la ciudad te necesita.',
      argumentoContra: 'El Agon tiene una duración fija. Cada día perdido es irrecuperable.',
    },
    opcionB: {
      label: 'El Agon continúa — la ciudad se reconstruye sola',
      argumentoFavor: 'Tu victoria en el Agon inspirará a la ciudad más que tu sacrificio.',
      argumentoContra: 'Elegiste tu gloria personal sobre el bien colectivo. Deméter no olvida.',
    },
    consecuenciaA: {
      kleos: -100,
      afinidad: [
        { faccionId: 'gremio_tierra', puntos: 50 },
        { faccionId: 'concilio_sombras', puntos: 50 },
        { faccionId: 'tribunal_kleos', puntos: 50 },
        { faccionId: 'guardia_hierro', puntos: -30 },
        { faccionId: 'hermandad_caos', puntos: -30 },
      ],
      marcaE: 'Suspendió el Agon para reconstruir lo que el fuego destruyó.',
    },
    consecuenciaB: {
      kleos: 80,
      afinidad: [
        { faccionId: 'guardia_hierro', puntos: 35 },
        { faccionId: 'hermandad_caos', puntos: 35 },
        { faccionId: 'corredores_alba', puntos: 35 },
        { faccionId: 'gremio_tierra', puntos: -35 },
        { faccionId: 'concilio_sombras', puntos: -35 },
      ],
      marcaE: 'Eligió que el Agon continuara mientras la ciudad reconstruía sus cenizas.',
    },
  },

  // ─── 7. El Oráculo Roto ───────────────────────────────────────────────────
  {
    id: 'oraculo_roto',
    titulo: 'El Oráculo Roto',
    mecanicas: ['D', 'E'],
    descripcionNarrativa:
      'El Oráculo de Delfos ha emitido una profecía sobre el Gran Agon — pero llegó fragmentada. Lo que se sabe: uno de los dos agonistas ganará el Agon pero perderá algo que no puede recuperar. La profecía completa solo existe si ambos la buscan juntos. Cada uno debe consentir en que el otro sepa.',
    opcionA: {
      label: 'Consiento — quiero que ambos conozcamos la profecía',
      argumentoFavor: 'Ser advertido es una ventaja, no una vulnerabilidad. La verdad no puede hacerte daño si ya la conoces.',
      argumentoContra: 'Expones información sobre ti mismo antes de saber si el otro hará lo mismo.',
    },
    opcionB: {
      label: 'No consiento — prefiero no saber',
      argumentoFavor: 'La ignorancia estratégica es una forma de poder. Lo que no sabes no puede paralizarte.',
      argumentoContra: 'Quien prefirió no saber eligió la comodidad sobre la verdad. Apolo no lo olvida.',
    },
    escenarioAmbosA: {
      descripcionAgora: 'El fragmento perdido revela algo que ninguno esperaba: la derrota no vendrá del rival — vendrá de uno mismo. Apolo sonríe.',
      afinidad: [
        { faccionId: 'escuela_logos', puntos: 40 },
        { faccionId: 'tribunal_kleos', puntos: 40 },
        { faccionId: 'hermandad_caos', puntos: -20 },
      ],
      marcaE: 'Consintió conocer la profecía rota. Apolo le habló directamente.',
    },
    escenarioAmbosB: {
      descripcionAgora: 'Dos hombres que prefirieron la ignorancia a la vulnerabilidad. El Oráculo se cierra. Lo que iba a ocurrir, ocurrirá de todas formas — pero sin advertencia.',
      afinidad: [
        { faccionId: 'hermandad_caos', puntos: 35 },
        { faccionId: 'escuela_logos', puntos: -30 },
        { faccionId: 'tribunal_kleos', puntos: -30 },
      ],
      marcaE: 'Eligió no conocer la profecía. El Oráculo se cerró.',
    },
    escenarioYoArivaB: {
      descripcionAgora: 'Uno extendió la mano hacia la verdad. El otro la retiró. El Oráculo permanece sellado.',
      notificacionA: 'Quisiste saber. Tu rival te lo impidió. El Agon continúa a ciegas.',
      notificacionB: 'Tu rival quiso conocer la profecía. Tú lo impediste. Apolo toma nota.',
      afinidad: [
        { faccionId: 'escuela_logos', puntos: 35 },
        { faccionId: 'gremio_tierra', puntos: 35 },
        { faccionId: 'hermandad_caos', puntos: -15 },
      ],
      marcaE: 'Quiso conocer la profecía — su rival se lo impidió.',
    },
    escenarioYoBrivaA: {
      descripcionAgora: 'Uno retiró la mano. El otro quiso saber. El Oráculo permanece sellado.',
      notificacionA: 'No quisiste saber. Tu rival sí quería. Apolo toma nota.',
      notificacionB: 'Quisiste saber. Tu rival te lo impidió. El Agon continúa a ciegas.',
      afinidad: [
        { faccionId: 'hermandad_caos', puntos: 25 },
        { faccionId: 'escuela_logos', puntos: -25 },
        { faccionId: 'tribunal_kleos', puntos: -25 },
      ],
      marcaE: 'Impidió que su rival conociera la profecía.',
    },
  },

  // ─── 8. El Desafío del Heraldo ────────────────────────────────────────────
  {
    id: 'desafio_heraldo',
    titulo: 'El Desafío del Heraldo',
    mecanicas: ['F'],
    descripcionNarrativa:
      'Un heraldo de Hermes llega al Ágora con un contrato de apuesta sagrada. Los dioses quieren ver a los agonistas apostar algo real. El que más pasos acumule en 3 días demuestra quién merece el favor de Hermes. La apuesta es vinculante.',
    opcionA: {
      label: 'Acepto la apuesta',
      argumentoFavor: 'Los dioses piden espectáculo — dárselo es honrarlos. Si tienes miedo de competir en terreno neutral, ya perdiste.',
      argumentoContra: 'Una apuesta forzada por los dioses no es una apuesta — es una trampa disfrazada de honor.',
    },
    opcionB: {
      label: 'Rechazo el contrato',
      argumentoFavor: 'Nadie obliga a un agonista libre a competir en términos que no eligió.',
      argumentoContra: 'Hermes recordará este rechazo. Los Corredores del Alba no olvidan a los cobardes.',
    },
    habitoApuesta: 'pasos',
    kleosApuesta: 200,
    diasApuesta: 3,
    consecuenciaA: {
      afinidad: [{ faccionId: 'corredores_alba', puntos: 30 }],
      marcaE: 'Aceptó el desafío de Hermes — corrió cuando los dioses lo pidieron.',
    },
    consecuenciaB: {
      afinidad: [
        { faccionId: 'corredores_alba', puntos: -25 },
        { faccionId: 'hermandad_caos', puntos: -20 },
      ],
      marcaE: 'Rechazó el contrato sagrado de Hermes.',
    },
  },

  // ─── 9. La Deuda de Sangre ────────────────────────────────────────────────
  {
    id: 'deuda_sangre',
    titulo: 'La Deuda de Sangre',
    mecanicas: ['F', 'E'],
    descripcionNarrativa:
      'Los archivos del Tribunal del Kleos revelan que hace generaciones, las familias de los dos agonistas estuvieron en lados opuestos de una guerra. La deuda nunca fue saldada. Nike lo hizo público. El Tribunal exige que la deuda se resuelva con conocimiento. Quien demuestre mayor dominio intelectual en la trivia sagrada salda la deuda a su favor.',
    opcionA: {
      label: 'Acepto saldar la deuda — que el Logos decida',
      argumentoFavor: 'Las deudas históricas no desaparecen ignorándolas. Enfrentarla con conocimiento es la única forma honorable.',
      argumentoContra: 'Aceptar una deuda que no contrajiste es legitimar una narrativa que otros construyeron sobre ti.',
    },
    opcionB: {
      label: 'Rechazo la deuda — no soy responsable del pasado',
      argumentoFavor: 'Cargar con culpas ajenas es el camino más rápido hacia la parálisis.',
      argumentoContra: 'Quien ignora la historia está condenado a repetirla.',
    },
    estrivia: true,
    categoriasTrivia: [
      'mitologia',
      'filosofia',
      'historia_griega',
      'disciplina',
      'deuses',
      'heroes',
      'olimpia',
    ],
    kleosApuesta: 250,
    consecuenciaA: {
      afinidad: [
        { faccionId: 'escuela_logos', puntos: 35 },
        { faccionId: 'tribunal_kleos', puntos: 35 },
      ],
      marcaE: 'Aceptó saldar la deuda de sangre con conocimiento.',
    },
    consecuenciaB: {
      afinidad: [
        { faccionId: 'escuela_logos', puntos: -30 },
        { faccionId: 'tribunal_kleos', puntos: -30 },
      ],
      marcaE: 'Ignoró la deuda de sangre. Apolo no lo olvida.',
    },
  },

  // ─── 10. El Espejo de Delfos ──────────────────────────────────────────────
  {
    id: 'espejo_delfos',
    titulo: 'El Espejo de Delfos',
    mecanicas: ['G', 'E'],
    descripcionNarrativa:
      'El Oráculo de Delfos envió una instrucción grabada en piedra: "Conócete a ti mismo." El Altis exige que cada agonista exponga su mayor obstáculo interno. El primero en hablar define el tono. El segundo responde habiendo escuchado.',
    opcionA: {
      label: 'Hablo primero — la verdad no espera',
      argumentoFavor: 'Quien habla primero desde la vulnerabilidad define el nivel de honestidad del intercambio.',
      argumentoContra: 'El segundo responderá habiendo leído lo tuyo. Tendrá contexto que tú no tuviste.',
    },
    opcionB: {
      label: 'Escucho primero — leo antes de hablar',
      argumentoFavor: 'La honestidad del primero puede liberarte para ir más profundo.',
      argumentoContra: 'Tu reflexión siempre será leída como reacción — nunca como declaración original.',
    },
    consecuenciaA: {
      afinidad: [
        { faccionId: 'escuela_logos', puntos: 40 },
        { faccionId: 'concilio_sombras', puntos: 40 },
        { faccionId: 'gremio_tierra', puntos: 40 },
        { faccionId: 'hermandad_caos', puntos: -15 },
      ],
      marcaE: 'Se miró al espejo de Delfos y no apartó la vista.',
      eventoAgora: 'espejo_delfos',
    },
    consecuenciaB: {
      afinidad: [
        { faccionId: 'escuela_logos', puntos: 40 },
        { faccionId: 'concilio_sombras', puntos: 40 },
        { faccionId: 'gremio_tierra', puntos: 40 },
        { faccionId: 'hermandad_caos', puntos: -15 },
      ],
      marcaE: 'Se miró al espejo de Delfos — con el contexto del otro como guía.',
      eventoAgora: 'espejo_delfos',
    },
  },

  // ─── 11. El Sacrificio de Prometeo ───────────────────────────────────────
  {
    id: 'sacrificio_prometeo',
    titulo: 'El Sacrificio de Prometeo',
    mecanicas: ['H'],
    descripcionNarrativa:
      'Los dioses han enviado una señal: el Agon está consumiendo demasiado. Las facciones están agotadas. Nike exige un gesto de nobleza. La ciudad necesita un sacrificio voluntario — no forzado. Nadie sabrá lo que el otro decidió hasta que el plazo expire.',
    opcionA: {
      label: 'Me sacrifico por Olimpia',
      argumentoFavor: 'La nobleza no se anuncia — se demuestra. Un campeón que no puede sacrificarse no merece el título.',
      argumentoContra: 'Si el otro no se sacrifica, habrás pagado un precio real mientras tu rival acumula ventaja.',
    },
    opcionB: {
      label: 'El Agon me lo exige todo — no puedo ceder',
      argumentoFavor: 'Traicionarte a ti mismo no salva a nadie. El Agon exige que des todo.',
      argumentoContra: 'Cuando todos eligen su propio beneficio, todos pierden.',
    },
    kleosSacrificio: 250,
    kleosRecompensaAmbos: 150,
  },

  // ─── 12. La Alianza Imposible ─────────────────────────────────────────────
  {
    id: 'alianza_imposible',
    titulo: 'La Alianza Imposible',
    mecanicas: ['H', 'D'],
    descripcionNarrativa:
      'Un emisario del Olimpo llega con una propuesta: los dioses están considerando cancelar el Gran Agon — dicen que la rivalidad se ha vuelto destructiva. Ofrecen un trato: si ambos agonistas acuerdan una tregua voluntaria de 48 horas, el Olimpo retirará la amenaza. Pero la tregua solo vale si ambos la eligen sin consultarse.',
    opcionA: {
      label: 'Acepto la tregua voluntaria',
      argumentoFavor: 'La grandeza se mide en saber cuándo el bien mayor supera al ego.',
      argumentoContra: 'Si el otro no acepta, habrás detenido tu Agon unilateralmente mientras tu rival acumula.',
    },
    opcionB: {
      label: 'El Agon no se detiene — ni por los dioses',
      argumentoFavor: 'El Gran Agon es un contrato sagrado de 29 días. Interrumpirlo es traicionarlo.',
      argumentoContra: 'Si el otro acepta y tú no, habrás rechazado una tregua que él ya honró.',
    },
    kleosSacrificio: 100,
    kleosRecompensaAmbos: 200,
    escenarioAmbosA: {
      descripcionAgora: 'Sin consultarse, los dos agonistas eligieron lo mismo. El emisario del Olimpo quedó en silencio. Zeus dijo que quizás los mortales merecen el Agon después de todo.',
      afinidad: [
        { faccionId: 'guardia_hierro', puntos: 50 },
        { faccionId: 'escuela_logos', puntos: 50 },
        { faccionId: 'gremio_tierra', puntos: 50 },
        { faccionId: 'concilio_sombras', puntos: 50 },
        { faccionId: 'corredores_alba', puntos: 50 },
        { faccionId: 'tribunal_kleos', puntos: 50 },
        { faccionId: 'hermandad_caos', puntos: 50 },
      ],
      kleos: 200,
      marcaE: 'Eligió la tregua sin saberlo. El Olimpo los reconoció.',
      eventoAgora: 'tregua_honrada',
    },
    escenarioAmbosB: {
      descripcionAgora: 'El emisario esperó. Nadie cedió. Se retiró sin decir nada. El Agon continúa — pero algo en el aire de Olimpia cambió.',
      afinidad: [
        { faccionId: 'hermandad_caos', puntos: 30 },
        { faccionId: 'guardia_hierro', puntos: 30 },
        { faccionId: 'gremio_tierra', puntos: -25 },
        { faccionId: 'concilio_sombras', puntos: -25 },
        { faccionId: 'tribunal_kleos', puntos: -25 },
      ],
      marcaE: 'No aceptó la tregua. El Olimpo retiró la oferta para siempre.',
    },
    escenarioYoArivaB: {
      descripcionAgora: 'Uno extendió la mano hacia la paz. El otro no la tomó. El emisario miró al que rechazó durante un largo silencio — y se fue.',
      notificacionA: 'Honraste la tregua. Tu rival no lo hizo. El Altis lo inscribió.',
      notificacionB: 'No honraste la tregua que tu rival ya había aceptado. El Agon tiene memoria larga.',
      afinidad: [
        { faccionId: 'gremio_tierra', puntos: 50 },
        { faccionId: 'concilio_sombras', puntos: 50 },
        { faccionId: 'tribunal_kleos', puntos: 50 },
        { faccionId: 'hermandad_caos', puntos: -30 },
      ],
      kleos: -100,
      marcaE: 'Extendió la mano hacia la paz cuando nadie lo obligaba.',
      eventoAgora: 'tregua_traicionada',
    },
    escenarioYoBrivaA: {
      descripcionAgora: 'Uno rechazó. El otro ya había aceptado. El emisario miró al que rechazó — y se fue.',
      notificacionA: 'Tu rival honró la tregua. Tú no lo hiciste. El Agon tiene memoria larga.',
      notificacionB: 'Rechazaste la tregua que tu rival ya había aceptado. El Altis lo inscribió.',
      afinidad: [
        { faccionId: 'hermandad_caos', puntos: 30 },
        { faccionId: 'guardia_hierro', puntos: 30 },
        { faccionId: 'gremio_tierra', puntos: -50 },
        { faccionId: 'concilio_sombras', puntos: -50 },
        { faccionId: 'tribunal_kleos', puntos: -50 },
        { faccionId: 'hermandad_caos', puntos: -30 },
      ],
      kleos: 100,
      marcaE: 'Rechazó la tregua sagrada. Los dioses tomaron nota.',
      eventoAgora: 'tregua_traicionada',
    },
  },

  // ─── 13. La Hybris de Diomedes ────────────────────────────────────────────
  {
    id: 'hybris_diomedes',
    titulo: 'La Hybris de Diomedes',
    lider: 'Diomedes',
    mecanicas: ['A', 'B', 'I'],
    descripcionNarrativa:
      'Diomedes, líder de la Guardia de Hierro, desafió abiertamente a Ares declarando que la disciplina humana supera al favor divino. Ares no respondió. Su silencio es más aterrador que cualquier amenaza. Los guerreros miran a los agonistas esperando una señal.',
    opcionA: {
      label: 'Respaldamos a Diomedes — el hombre supera a los dioses',
      argumentoFavor: 'Diomedes dice en voz alta lo que todo agonista piensa en silencio. Callarlo es cobardía.',
      argumentoContra: 'La hybris siempre tiene un precio. Respaldar a quien desafía a los dioses es compartir su castigo.',
    },
    opcionB: {
      label: 'Apaciguamos a Ares — la hybris destruye ciudades',
      argumentoFavor: 'Toda la historia griega es un catálogo de hombres destruidos por exceso de confianza.',
      argumentoContra: 'Abandonas a un líder en su momento más vulnerable. La Guardia recordará.',
    },
    consecuenciaA: {
      kleos: 80,
      afinidad: [
        { faccionId: 'guardia_hierro', puntos: 40 },
        { faccionId: 'hermandad_caos', puntos: 40 },
        { faccionId: 'tribunal_kleos', puntos: -30 },
        { faccionId: 'concilio_sombras', puntos: -30 },
      ],
      marcaE: 'Respaldó la hybris de Diomedes cuando Ares guardó silencio.',
      consecuenciaDiferidaDias: 6,
      consecuenciaDiferidaDescripcion: 'Ares rompe su silencio — y no viene a agradecer.',
      consecuenciaDiferidaAfinidad: [{ faccionId: 'guardia_hierro', puntos: -15 }],
      consecuenciaDiferidaEventoAgora: 'ira_ares',
    },
    consecuenciaB: {
      kleos: -80,
      afinidad: [
        { faccionId: 'tribunal_kleos', puntos: 40 },
        { faccionId: 'gremio_tierra', puntos: 40 },
        { faccionId: 'concilio_sombras', puntos: 40 },
        { faccionId: 'guardia_hierro', puntos: -30 },
        { faccionId: 'hermandad_caos', puntos: -30 },
      ],
      marcaE: 'Apaciguó a Ares cuando Diomedes desafió a los dioses.',
      consecuenciaDiferidaDias: 3,
      consecuenciaDiferidaDescripcion: 'Ares acepta el sacrificio — y recompensa la piedad.',
      consecuenciaDiferidaAfinidad: [{ faccionId: 'guardia_hierro', puntos: 20 }],
      consecuenciaDiferidaEventoAgora: 'favor_ares',
    },
  },

  // ─── 14. El Decreto de Pitágoras ──────────────────────────────────────────
  {
    id: 'decreto_pitagoras',
    titulo: 'El Decreto de Pitágoras',
    lider: 'Pitágoras',
    mecanicas: ['A', 'I'],
    descripcionNarrativa:
      'Pitágoras ha emitido un decreto: la Escuela del Logos cerrará sus puertas durante 7 días. No como castigo — como purificación. Dice que los agonistas leen páginas pero no piensan. Que la cantidad sin calidad envenena el Logos. Apolo guarda silencio.',
    opcionA: {
      label: 'Acatamos el decreto — la reflexión vale más que la acumulación',
      argumentoFavor: 'Pitágoras tiene razón en algo que nadie quiere admitir — leer sin pensar es coleccionar, no aprender.',
      argumentoContra: 'El Agon tiene 29 días contados. Cada día sin leer es afinidad perdida con Apolo.',
    },
    opcionB: {
      label: 'Desafiamos el decreto — el conocimiento no se pausa',
      argumentoFavor: 'Ningún hombre tiene autoridad para decirte cuándo pensar. La libertad intelectual no se negocia.',
      argumentoContra: 'Desafiar a Pitágoras en su propio dominio es declarar que sabes más que él.',
    },
    consecuenciaA: {
      kleos: -60,
      afinidad: [
        { faccionId: 'escuela_logos', puntos: 40 },
        { faccionId: 'concilio_sombras', puntos: 40 },
        { faccionId: 'tribunal_kleos', puntos: -25 },
      ],
      marcaE: 'Acató el decreto de Pitágoras — honró la reflexión sobre la acumulación.',
      consecuenciaDiferidaDias: 4,
      consecuenciaDiferidaDescripcion: 'Pitágoras reabre la Escuela y reconoce tu acatamiento.',
      consecuenciaDiferidaAfinidad: [{ faccionId: 'escuela_logos', puntos: 35 }],
      consecuenciaDiferidaKleos: 50,
      consecuenciaDiferidaEventoAgora: 'favor_pitagoras',
    },
    consecuenciaB: {
      kleos: 60,
      afinidad: [
        { faccionId: 'hermandad_caos', puntos: 40 },
        { faccionId: 'guardia_hierro', puntos: 40 },
        { faccionId: 'escuela_logos', puntos: -30 },
      ],
      marcaE: 'Desafió el decreto de Pitágoras — el conocimiento no se pausa.',
      consecuenciaDiferidaDias: 4,
      consecuenciaDiferidaDescripcion: 'Pitágoras cierra sus puertas específicamente para ti.',
      consecuenciaDiferidaAfinidad: [{ faccionId: 'escuela_logos', puntos: -30 }],
      consecuenciaDiferidaEventoAgora: 'ira_pitagoras',
    },
  },

  // ─── 15. La Última Semilla ────────────────────────────────────────────────
  {
    id: 'ultima_semilla',
    titulo: 'La Última Semilla',
    lider: 'Triptólemo',
    mecanicas: ['H', 'I'],
    descripcionNarrativa:
      'Una plaga silenciosa atacó los almacenes del Gremio de la Tierra. Triptólemo tiene una sola semilla sagrada que Deméter le confió. Plantarla ahora significa 3 días de escasez mientras germina. Triptólemo mira a los agonistas — esta semilla pertenece a quienes merezcan recibirla.',
    opcionA: {
      label: 'Plantamos la semilla — el futuro vale el hambre presente',
      argumentoFavor: 'Todas las grandes cosechas empezaron con hambre. Quien no puede tolerar la escasez presente no merece la abundancia futura.',
      argumentoContra: '3 días de escasez en el Agon son 3 días sin el rendimiento físico necesario.',
    },
    opcionB: {
      label: 'Guardamos la semilla — la escasez presente no puede esperar',
      argumentoFavor: 'Un agonista hambriento no puede competir. La generosidad que te destruye no es virtud.',
      argumentoContra: 'Guardar la semilla es elegir la supervivencia sobre la regeneración.',
    },
    kleosSacrificio: 100,
    kleosRecompensaAmbos: 200,
    consecuenciaA: {
      afinidad: [
        { faccionId: 'gremio_tierra', puntos: 45 },
        { faccionId: 'concilio_sombras', puntos: 45 },
        { faccionId: 'guardia_hierro', puntos: -30 },
        { faccionId: 'corredores_alba', puntos: -30 },
      ],
      kleos: -100,
      marcaE: 'Plantó la última semilla cuando Olimpia tenía hambre.',
      consecuenciaDiferidaDias: 4,
      consecuenciaDiferidaDescripcion: 'La semilla germina. Deméter aparece en el Ágora.',
      consecuenciaDiferidaAfinidad: [{ faccionId: 'gremio_tierra', puntos: 60 }],
      consecuenciaDiferidaKleos: 150,
      consecuenciaDiferidaEventoAgora: 'bendicion_demeter',
    },
    consecuenciaB: {
      afinidad: [
        { faccionId: 'guardia_hierro', puntos: 40 },
        { faccionId: 'corredores_alba', puntos: 40 },
        { faccionId: 'hermandad_caos', puntos: 40 },
        { faccionId: 'gremio_tierra', puntos: -35 },
      ],
      kleos: 100,
      marcaE: 'Guardó la semilla cuando Olimpia la necesitaba.',
      consecuenciaDiferidaDias: 4,
      consecuenciaDiferidaDescripcion: 'La plaga avanza. Triptólemo aparece en el Ágora.',
      consecuenciaDiferidaAfinidad: [{ faccionId: 'gremio_tierra', puntos: -40 }],
      consecuenciaDiferidaEventoAgora: 'tristeza_triptolemo',
    },
  },

  // ─── 16. El Espejo de Tersites ────────────────────────────────────────────
  {
    id: 'espejo_tersites',
    titulo: 'El Espejo de Tersites',
    lider: 'Tersites',
    mecanicas: ['A', 'D'],
    descripcionNarrativa:
      'Tersites irrumpió en el Ágora y dijo lo que nadie se había atrevido: "Este Agon es una farsa. Dos hombres con tiempo, recursos y comodidad compitiendo entre sí y llamándolo disciplina. ¿Qué saben ustedes del esfuerzo real?" La ciudad quedó en silencio.',
    opcionA: {
      label: 'Tersites tiene razón — lo reconozco públicamente',
      argumentoFavor: 'La honestidad sobre las propias ventajas es la única forma de que el mérito real signifique algo.',
      argumentoContra: 'La humildad performativa es su propia forma de privilegio.',
    },
    opcionB: {
      label: 'Tersites se equivoca — el esfuerzo es el esfuerzo',
      argumentoFavor: 'Relativizar el esfuerzo propio no honra a nadie. El contexto no anula el sacrificio.',
      argumentoContra: 'Ignorar las condiciones en las que compites no las hace desaparecer.',
    },
    escenarioAmbosA: {
      descripcionAgora: 'Dos agonistas que se miraron al espejo y no apartaron la vista. Tersites no esperaba esto. Eris se retiró frustrada — no hay caos donde hay honestidad.',
      afinidad: [
        { faccionId: 'escuela_logos', puntos: 50 },
        { faccionId: 'gremio_tierra', puntos: 50 },
        { faccionId: 'concilio_sombras', puntos: 50 },
        { faccionId: 'hermandad_caos', puntos: -30 },
      ],
      marcaE: 'Miró al espejo de Tersites y no apartó la vista.',
    },
    escenarioAmbosB: {
      descripcionAgora: 'Tersites fue escoltado fuera del Ágora. Nike asintió. Eris sonrió — la negación también es su alimento.',
      afinidad: [
        { faccionId: 'tribunal_kleos', puntos: 45 },
        { faccionId: 'guardia_hierro', puntos: 45 },
        { faccionId: 'hermandad_caos', puntos: 45 },
        { faccionId: 'escuela_logos', puntos: -30 },
        { faccionId: 'gremio_tierra', puntos: -30 },
      ],
      marcaE: 'Defendió el mérito cuando Tersites lo cuestionó.',
    },
    escenarioYoArivaB: {
      descripcionAgora: 'Uno se miró al espejo. El otro apartó la vista. Tersites dijo que esa diferencia era más reveladora que cualquier marcador de kleos.',
      notificacionA: 'Reconociste lo que tu rival negó. Tersites te miró distinto.',
      notificacionB: 'Defendiste el mérito cuando tu rival lo cuestionó. El Agon registra ambas posiciones.',
      afinidad: [
        { faccionId: 'escuela_logos', puntos: 50 },
        { faccionId: 'gremio_tierra', puntos: 50 },
        { faccionId: 'concilio_sombras', puntos: 50 },
        { faccionId: 'tribunal_kleos', puntos: -20 },
      ],
      marcaE: 'Fue el único que miró al espejo cuando su rival apartó la vista.',
    },
    escenarioYoBrivaA: {
      descripcionAgora: 'Uno apartó la vista. El otro se miró al espejo. Tersites dijo que esa diferencia era más reveladora que cualquier marcador de kleos.',
      notificacionA: 'Defendiste el mérito cuando tu rival lo cuestionó. El Agon registra ambas posiciones.',
      notificacionB: 'Tu rival reconoció lo que tú negaste. Tersites tomó nota.',
      afinidad: [
        { faccionId: 'tribunal_kleos', puntos: 40 },
        { faccionId: 'guardia_hierro', puntos: 40 },
        { faccionId: 'escuela_logos', puntos: -25 },
        { faccionId: 'gremio_tierra', puntos: -25 },
      ],
      marcaE: 'Eligió defender el esfuerzo cuando su rival eligió la duda.',
    },
  },

  // ─── 17. La Última Carrera ────────────────────────────────────────────────
  {
    id: 'ultima_carrera',
    titulo: 'La Última Carrera',
    lider: 'Feidípides',
    mecanicas: ['B', 'F'],
    descripcionNarrativa:
      'Un mensajero llega a Olimpia y colapsa antes de terminar su mensaje. Solo se escuchó: "Corred... o todo se pierde." Feidípides propone que los dos agonistas compitan en pasos durante 3 días. El perdedor contribuirá con kleos al fondo de defensa.',
    opcionA: {
      label: 'Acepto la carrera — el movimiento es la respuesta',
      argumentoFavor: 'Cuando el mensajero dice corred, corres. La acción es la única respuesta honesta.',
      argumentoContra: 'Correr sin dirección no es disciplina — es ansiedad disfrazada de valentía.',
    },
    opcionB: {
      label: 'Rechazo la carrera — el mensaje no lo justifica',
      argumentoFavor: 'Las decisiones tomadas en pánico producen resultados de pánico.',
      argumentoContra: 'La prudencia que paraliza es cobardía con mejor nombre.',
    },
    habitoApuesta: 'pasos',
    kleosApuesta: 200,
    diasApuesta: 3,
    consecuenciaA: {
      afinidad: [{ faccionId: 'corredores_alba', puntos: 35 }],
      marcaE: 'Corrió cuando Olimpia lo necesitaba.',
      consecuenciaDiferidaDias: 0,
      consecuenciaDiferidaEventoAgora: 'victoria_feidipides',
    },
    consecuenciaB: {
      afinidad: [
        { faccionId: 'corredores_alba', puntos: -30 },
        { faccionId: 'hermandad_caos', puntos: -20 },
      ],
      marcaE: 'No corrió cuando Feidípides lo convocó. Hermes tomó nota.',
      consecuenciaDiferidaDias: 5,
      consecuenciaDiferidaDescripcion: 'Hermes abandona el Ágora temporalmente.',
      consecuenciaDiferidaEventoAgora: 'hermes_abandona',
    },
  },

  // ─── 18. El Sueño Eterno ──────────────────────────────────────────────────
  {
    id: 'sueno_eterno',
    titulo: 'El Sueño Eterno',
    lider: 'Endimión',
    mecanicas: ['H', 'I'],
    descripcionNarrativa:
      'Endimión no ha aparecido en el Concilio desde hace tres días. Sus seguidores lo encontraron dormido, respirando, pero imposible de despertar. Morfeo envía un mensaje: "El sueño sagrado tiene un precio. Quien quiera que Endimión despierte debe pagarlo."',
    opcionA: {
      label: 'Pagamos el precio — que Endimión despierte',
      argumentoFavor: 'Una ciudad sin sus líderes es una ciudad a la deriva. El precio del sueño sagrado es el precio de la civilización.',
      argumentoContra: 'Morfeo dijo que quien duerme fue elegido. Despertar a Endimión contra la voluntad del dios es hybris.',
    },
    opcionB: {
      label: 'Respetamos el sueño — Morfeo sabe lo que hace',
      argumentoFavor: 'Los dioses no actúan sin razón. Interferir en el designio de Morfeo es exactamente la arrogancia que destruye ciudades.',
      argumentoContra: 'La deferencia a los dioses que paraliza la acción humana es resignación disfrazada de piedad.',
    },
    kleosSacrificio: 150,
    kleosRecompensaAmbos: 120,
    consecuenciaA: {
      afinidad: [
        { faccionId: 'concilio_sombras', puntos: 50 },
        { faccionId: 'gremio_tierra', puntos: 50 },
        { faccionId: 'tribunal_kleos', puntos: 50 },
      ],
      kleos: -150,
      marcaE: 'Pagó el precio del sueño sagrado. Endimión despertó.',
      consecuenciaDiferidaDias: 3,
      consecuenciaDiferidaDescripcion: 'Endimión, agradecido, aparece en el Ágora.',
      consecuenciaDiferidaAfinidad: [{ faccionId: 'concilio_sombras', puntos: 30 }],
      consecuenciaDiferidaEventoAgora: 'gratitud_endimion',
    },
    consecuenciaB: {
      afinidad: [{ faccionId: 'concilio_sombras', puntos: -50 }],
      kleos: 150,
      marcaE: 'Dejó dormir a Endimión. Morfeo tomó nota.',
      consecuenciaDiferidaDias: 5,
      consecuenciaDiferidaDescripcion: 'Morfeo cobra su precio de otra forma.',
      metaSuenoBonus: 1,
      consecuenciaDiferidaEventoAgora: 'morfeo_cobra',
    },
  },

  // ─── 19. El Juicio de Milcíades ───────────────────────────────────────────
  {
    id: 'juicio_milciades',
    titulo: 'El Juicio de Milcíades',
    lider: 'Milcíades',
    mecanicas: ['G', 'E', 'I'],
    descripcionNarrativa:
      'El Tribunal del Kleos ha convocado un juicio sin precedentes. Milcíades — su propio líder — está siendo juzgado por sus pares. La acusación: favoreció a ciertos agonistas en el pasado. No niega ni confirma. Solo dice: "Juzgadme como juzgáis a todos." El primero en declarar define el tono de la sala.',
    opcionA: {
      label: 'Milcíades debe ser juzgado como cualquier otro',
      argumentoFavor: 'Un sistema de justicia que protege a sus fundadores no es justicia — es nepotismo con toga.',
      argumentoContra: 'Juzgar al hombre que construyó las instituciones con sus propias reglas es una trampa circular.',
    },
    opcionB: {
      label: 'Milcíades merece consideración especial por lo que construyó',
      argumentoFavor: 'La justicia sin memoria es ciega en el peor sentido. Lo que construyó debe pesar en el juicio.',
      argumentoContra: '"Lo que construiste te protege" es exactamente el argumento que usan todos los poderosos para escapar la rendición de cuentas.',
    },
    consecuenciaA: {
      afinidad: [
        { faccionId: 'tribunal_kleos', puntos: 45 },
        { faccionId: 'escuela_logos', puntos: 45 },
        { faccionId: 'hermandad_caos', puntos: -30 },
      ],
      marcaE: 'Exigió que Milcíades fuera juzgado como cualquier otro.',
      eventoAgora: 'veredicto_milciades_culpable',
      consecuenciaDiferidaDias: 4,
      consecuenciaDiferidaDescripcion: 'El Tribunal se reforma bajo Temístocles.',
      consecuenciaDiferidaAfinidad: [{ faccionId: 'tribunal_kleos', puntos: 10 }],
      consecuenciaDiferidaEventoAgora: 'reforma_tribunal',
      liderModificado: {
        faccionId: 'tribunal_kleos',
        liderOriginal: 'Milcíades',
        liderNuevo: 'Temístocles',
        descripcionNueva:
          'Arquitecto de la victoria naval de Salamina. Más pragmático que Milcíades. Menos sentimental con las reglas. Asumió el Tribunal tras la condena de su predecesor.',
      },
    },
    consecuenciaB: {
      afinidad: [
        { faccionId: 'guardia_hierro', puntos: 40 },
        { faccionId: 'gremio_tierra', puntos: 40 },
        { faccionId: 'tribunal_kleos', puntos: -35 },
      ],
      marcaE: 'Defendió que Milcíades merecía consideración especial.',
      eventoAgora: 'veredicto_milciades_absuelto',
      consecuenciaDiferidaDias: 4,
      consecuenciaDiferidaDescripcion: 'Milcíades continúa pero el Tribunal queda debilitado.',
      consecuenciaDiferidaAfinidad: [{ faccionId: 'tribunal_kleos', puntos: -5 }],
      consecuenciaDiferidaEventoAgora: 'absolucion_milciades',
    },
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getCrisis(id: string): CrisisConfig | null {
  return CRISIS_POOL.find((c) => c.id === id) ?? null
}

export function getCrisisByLider(lider: string): CrisisConfig | null {
  return CRISIS_POOL.find((c) => c.lider === lider) ?? null
}

export function getCrisisConLider(): CrisisConfig[] {
  return CRISIS_POOL.filter((c) => c.lider !== undefined)
}

export function getCrisisSinLider(): CrisisConfig[] {
  return CRISIS_POOL.filter((c) => c.lider === undefined)
}
