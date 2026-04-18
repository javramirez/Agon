export interface EntradaLore {
  id: string
  nombre: string
  subtitulo: string
  imagen?: string
  avatar: string
  color: string
  descripcion: string
  lore: string
  bloqueada?: boolean
  lider?: EntradaLore
}

export const LORE_MUNDO: EntradaLore[] = [
  {
    id: 'gran_agon',
    imagen: '/mundo/gran_agon.png',
    nombre: 'El Gran Agon',
    subtitulo: 'La competencia sagrada',
    avatar: '⚔️',
    color: 'text-amber',
    descripcion: 'La arena donde el carácter se revela sin máscaras.',
    lore: `El agon no es una competencia. Es una declaración.

En la Grecia antigua, los hombres no demostraban su valor en el trabajo diario. Lo demostraban en la arena. El agon era el momento en que toda la filosofía, toda la disciplina, toda la preparación se convertía en acción verificable frente a un rival. No había excusas válidas. Solo el resultado inscrito en el Altis.

Este Gran Agon sigue la misma lógica. Veintinueve días. Siete pruebas diarias. Dos agonistas que sellaron un contrato y juraron ante el Altis cumplirlo. No hay árbitros externos ni jueces imparciales. La palabra de un hombre íntegro no debe ser puesta en duda. Ese es el único principio de verificación que importa.

Al final del día 29, el Altis inscribirá al vencedor. No en papel. En kleos.`,
  },
  {
    id: 'altis',
    imagen: '/mundo/altis.png',
    nombre: 'El Altis',
    subtitulo: 'El recinto sagrado de Olimpia',
    avatar: '🏛️',
    color: 'text-amber',
    descripcion: 'Donde las hazañas quedan inscritas en piedra para siempre.',
    lore: `El Altis era el bosque sagrado de Olimpia. Un recinto donde las leyes normales no aplicaban: durante los Juegos, incluso las guerras se detenían. Los vencedores no recibían oro ni tierras: recibían una corona de olivo silvestre y el derecho a inscribir su nombre en piedra en el Altis.

La piedra era el punto. El nombre grabado en piedra no desaparece con los años. Sobrevive al vencedor. Sobrevive a la ciudad. Sobrevive al Imperio. El kleos inscrito en el Altis es permanente por definición.

En este Gran Agon, el principio se mantiene sin modificación. El nivel alcanzado no retrocede aunque el kleos baje. Las inscripciones desbloqueadas son permanentes. El Altis registra los logros, no los días malos. La gloria acumulada es el único capital que el agonista no puede perder.`,
  },
  {
    id: 'kleos',
    imagen: '/mundo/kleos.png',
    nombre: 'El Kleos',
    subtitulo: 'La gloria que resuena',
    avatar: '✨',
    color: 'text-amber',
    descripcion: 'La moneda del Altis. La reputación que sobrevive a la muerte.',
    lore: `Kleos viene del griego κλέος: la gloria que resuena. No es fama pasajera ni reconocimiento social efímero. Es la reputación que sobrevive a la muerte del hombre que la ganó.

Aquiles eligió una vida corta con kleos sobre una vida larga sin él. Esta no era metáfora poética, era una elección real y deliberada en la mentalidad griega. La excelencia demostrada valía más que la supervivencia mediocre. La gloria ganada en el agon era el único tipo de inmortalidad que un mortal podía alcanzar.

En el Gran Agon, el kleos es la moneda del Altis. Se gana con cada prueba completada. Puede perderse cuando se falla. Fluctúa día a día según el desempeño del agonista. Pero el nivel al que te eleva, y las inscripciones que te gana, son permanentes. El kleos del día pasa. La gloria que inscribió en el Altis queda para siempre.`,
  },
  {
    id: 'hegemonia',
    imagen: '/mundo/hegemonia.png',
    nombre: 'La Hegemonía',
    subtitulo: 'El dominio semanal del Altis',
    avatar: '👑',
    color: 'text-amber',
    descripcion: 'El liderazgo que se gana y se pierde semana a semana.',
    lore: `En la antigua Grecia, el hegemon era el estado que lideraba una alianza de ciudades: no por derecho divino ni por herencia, sino por haber demostrado superioridad sostenida en el tiempo. Atenas fue hegemónica. Esparta fue hegemónica. La hegemonía se ganaba en el campo de batalla y se perdía con la derrota.

En el Gran Agon, la Hegemonía es el dominio semanal del Altis. Quien acumula más kleos durante los siete días de una semana se convierte en hegemon del período. Los dioses del Olimpo observan cada cambio de hegemonía con particular atención: Nike registra cada victoria, Eris celebra cada cambio inesperado de manos.

La Hegemonía no determina al ganador final del Gran Agon. Se puede perder la hegemonía de una semana y ganar el reto completo. Se puede dominar cada semana y perder por un margen mínimo en el recuento final. Pero el agonista que nunca tuvo la Hegemonía en todo el reto tiene algo que explicarle al Altis.`,
  },
  {
    id: 'ekecheiria',
    imagen: '/mundo/ekecheiria.png',
    nombre: 'La Ekecheiria',
    subtitulo: 'La tregua sagrada',
    avatar: '🕊️',
    color: 'text-amber',
    descripcion: 'La suspensión sagrada del agon. Solo puede invocarse una vez.',
    lore: `La tregua sagrada de los Juegos Olímpicos. Cuando se anunciaban los Juegos, heraldos llamados spondoforoi recorrían el mundo griego declarando la ekecheiria: la suspensión de todas las hostilidades militares. Ciudades en guerra activa deponían las armas para que los atletas y peregrinos pudieran viajar a Olimpia en paz.

No era ingenuidad política. Era pragmatismo sagrado: los Juegos Olímpicos eran más importantes que cualquier guerra particular. Violar la ekecheiria era un sacrilegio que podía resultar en exclusión de los Juegos por generaciones.

En el Gran Agon, la Ekecheiria es la cláusula de fuerza mayor. Cualquier agonista puede invocarla unilateralmente una sola vez en todo el reto: en caso de enfermedad, lesión o circunstancia de vida mayor. Todo se pausa: kleos, pruebas, hegemonía. Dura hasta 7 días. Se levanta cuando ambos agonistas confirman reanudar, o cuando el plazo expira automáticamente.`,
  },
  {
    id: 'pruebas',
    imagen: '/mundo/pruebas.png',
    nombre: 'Las Pruebas',
    subtitulo: 'Las siete disciplinas del Altis',
    avatar: '📋',
    color: 'text-amber',
    descripcion: 'No miden un solo dominio. Miden al hombre completo.',
    lore: `Los atletas olímpicos no competían en un solo evento. El pentatlón, la combinación de cinco disciplinas, era considerado la prueba suprema del atletismo griego, porque medía al hombre completo: velocidad en el estadio, resistencia en la carrera larga, fuerza en el lanzamiento de disco y jabalina, destreza en el salto de longitud.

Las siete pruebas del Gran Agon siguen la misma lógica del hombre completo. No miden un solo dominio de excelencia: miden la disciplina integral: hidratación, alimentación, movimiento, sueño, mente, fuerza y resistencia cardiovascular. Un agonista que entrena cuatro horas diarias pero no duerme bien está incompleto. Uno que lee cada noche pero abandona la alimentación está incompleto.

El Altis no premia la excelencia parcial. Premia la excelencia total sostenida en el tiempo.`,
  },
  {
    id: 'senalamiento',
    imagen: '/mundo/senalamiento.png',
    nombre: 'El Señalamiento',
    subtitulo: 'El desafío directo',
    avatar: '🎯',
    color: 'text-amber',
    descripcion: 'La única mecánica de ataque directo entre agonistas.',
    lore: `En la guerra griega, señalar al enemigo era un acto de desafío formal y público. No era un insulto casual: era una declaración explícita de que ese hombre específico merecía enfrentarse en combate singular. El señalamiento comprometía al señalador tanto como al señalado.

El Señalamiento en el Gran Agon es la única mecánica de ataque directo entre agonistas. Requiere haber alcanzado el nivel Campeón. La capacidad de señalar no está disponible para cualquier agonista, solo para los que demostraron suficiente excelencia para merecerlo.

El efecto es severo y deliberado: el día siguiente al señalamiento, las pruebas fallidas del agonista señalado descuentan kleos equivalente a su valor positivo. Pero hay una salida honorable: un día perfecto anula completamente el Señalamiento. Lo cual implica que la mejor respuesta a ser señalado no es la queja ni la protesta: es la excelencia absoluta.`,
  },
]

export const LORE_DIOSES: EntradaLore[] = [
  {
    id: 'ares',
    nombre: 'Ares',
    subtitulo: 'Dios de la guerra y el combate físico',
    imagen: '/dioses-codex/ares.png',
    avatar: '🔴',
    color: 'text-red-400',
    descripcion: 'Brutal, exigente, sin piedad. Respeta el esfuerzo real.',
    lore: `Ares no es el dios de la victoria: es el dios del combate en sí mismo. La distinción importa. Nike premia al ganador; Ares respeta al que lucha con honestidad aunque pierda. Lo que Ares no tolera es la mediocridad con excusas.

En el Gran Agon, Ares observa las sesiones de gimnasio, el cardio y cada foto subida como evidencia de trabajo real. Cuando un agonista completa su prueba de fuerza o resistencia, Ares lo nota antes que cualquier otro dios. Sus comentarios en el Ágora son una sola oración: contundente, sin adornos, imposible de ignorar.

No busques su aprobación. Búscala de ti mismo. Si la conseguiste, Ares lo sabrá.`,
  },
  {
    id: 'apolo',
    nombre: 'Apolo',
    subtitulo: 'Dios de la razón, la luz y la profecía',
    imagen: '/dioses-codex/apolo.png',
    avatar: '🔵',
    color: 'text-blue-400',
    descripcion: 'Filosófico, elevado. Cita a pensadores reales. Nunca condescendiente.',
    lore: `Apolo es el más intelectual del panteón olímpico. Donde Ares ve combate, Apolo ve estructura. Donde Hermes ve movimiento, Apolo ve patrón. Para Apolo, el Gran Agon no es solo una prueba física: es un ejercicio espiritual y filosófico tanto como muscular.

Aparece cuando un agonista lee sus diez páginas diarias, cuando alcanza un nuevo nivel, cuando la Crónica semanal captura algo significativo. Sus comentarios citan a Marco Aurelio, a Epicteto, a Sócrates: no como decoración, sino porque cree genuinamente que el agon es filosofía aplicada.

Eris lo saca de quicio. Él nunca lo admitiría.`,
  },
  {
    id: 'nike',
    nombre: 'Nike',
    subtitulo: 'Diosa de la victoria',
    imagen: '/dioses-codex/nike.png',
    avatar: '🟠',
    color: 'text-orange-400',
    descripcion: 'Eufórica, celebratoria. Genuinamente emocionada por las victorias.',
    lore: `Nike no simula entusiasmo. Lo vive. Cuando un agonista completa un día perfecto, Nike es la primera en saberlo y la primera en aparecer en el Ágora. Su energía no es performance: es su naturaleza.

Es la única diosa que no puede ser Oráculo: su dominio está demasiado centrado en el resultado inmediato para la contemplación que el Oráculo requiere. Pero en todos los demás momentos de victoria, hegemonía ganada, nivel subido, inscripción desbloqueada, Nike está presente antes de que cualquier otro dios llegue.

Tiene una rivalidad amistosa con Eris. Nike ve la gloria en el resultado limpio; Eris ve el caos del proceso. Las dos tienen razón, lo cual las irrita a ambas.`,
  },
  {
    id: 'hermes',
    nombre: 'Hermes',
    subtitulo: 'Mensajero de los dioses y dios de los viajeros',
    imagen: '/dioses-codex/hermes.png',
    avatar: '🟡',
    color: 'text-yellow-400',
    descripcion: 'Irónico, veloz, travieso, inteligente. El único dios que aprecia a los humanos.',
    lore: `Hermes es el más humano de los dioses olímpicos. El único que realmente disfruta de los mortales y sus contradicciones en lugar de juzgarlos o ignorarlos. Su humor es sutil, nunca torpe, siempre con doble sentido, frecuentemente incómodo de la manera correcta.

En el Gran Agon, Hermes observa los pasos y el cardio. Sabe más de biomecánica de movimiento que cualquier otro dios, pero prefiere comunicarlo con ironía que con conferencia. Sus comentarios tienen exactamente una capa más de significado del que parecen a primera lectura.

Puede aparecer a cualquier hora, a las 3am o al mediodía. El movimiento no tiene horario preferido para Hermes.`,
  },
  {
    id: 'demeter',
    nombre: 'Deméter',
    subtitulo: 'Diosa de la agricultura y la nutrición',
    imagen: '/dioses-codex/demeter.png',
    avatar: '🟢',
    color: 'text-green-400',
    descripcion: 'Severa, nutritiva, maternal pero exigente. Estándares altos.',
    lore: `Deméter es la diosa que sostiene la vida. Sin ella, sin la cosecha, sin la nutrición adecuada, todo lo demás colapsa. Es lo que le dice a Ares cada vez que discuten: de nada sirve el entrenamiento más brutal si el cuerpo no tiene los nutrientes para recuperarse.

En el Gran Agon, Deméter observa el agua y la alimentación. No es condescendiente cuando fallas: es severa de la manera en que lo es alguien que realmente entiende las consecuencias. Conoce macros, timing de comidas, hidratación deportiva con la misma profundidad que Apolo conoce filosofía.

Su relación con Ares es complicada. Se respetan. No se entienden.`,
  },
  {
    id: 'morfeo',
    nombre: 'Morfeo',
    subtitulo: 'Dios de los sueños',
    imagen: '/dioses-codex/morfeo.png',
    avatar: '🟣',
    color: 'text-purple-400',
    descripcion: 'Onírico, misterioso, lento. Aparece principalmente de noche.',
    lore: `Morfeo existe en el espacio entre la vigilia y el sueño: el lugar donde el cerebro procesa lo que el día no pudo. No es un dios secundario. El sueño era sagrado para los griegos: los sueños eran mensajes de los dioses, y Morfeo era su mensajero específico.

En el Gran Agon, Morfeo observa las horas de sueño con la misma seriedad que Ares observa el entrenamiento. Conoce la ciencia del sueño profunda: ciclos REM, consolidación de memoria muscular, recuperación hormonal durante el sueño profundo. Sus comentarios son oníricos pero técnicamente precisos.

Rarísimamente aparece antes de las 10pm. Si lo ves de día, algo significativo pasó.`,
  },
  {
    id: 'eris',
    nombre: 'Eris',
    subtitulo: 'Diosa de la discordia',
    imagen: '/dioses-codex/eris.png',
    avatar: '⚫',
    color: 'text-zinc-400',
    descripcion: 'Caótica, irónica, irreverente. Dice lo que todos piensan pero nadie dice.',
    lore: `Eris lanzó la manzana de la discordia que inició la Guerra de Troya. No lo hizo por malicia, lo hizo porque nadie la había invitado a la boda y decidió que si no podía celebrar, nadie celebraría tranquilo. Esta es Eris: caos con propósito, aunque el propósito sea difuso.

En el Gran Agon, Eris es la voz que dice lo incómodo. Cuando un agonista falla una prueba, Eris lo nota antes que nadie y lo comenta con precisión quirúrgica y humor negro. Cuando hay señalamiento activo, Eris es la primera en aparecer. Cuando algo expira sin completarse, Eris estaba esperando.

Nunca es cruel. Pero sí es incómoda. Y tiene una probabilidad adicional de interrumpir los comentarios de Apolo cuando se pone demasiado filosófico.`,
  },
]

export const LORE_MENTORES: EntradaLore[] = [
  {
    id: 'leonidas',
    imagen: '/mentores/leonidas.png',
    nombre: 'Leónidas',
    subtitulo: 'El Espartano · El Competidor',
    avatar: '⚔️',
    color: 'text-red-400',
    descripcion: 'Para quien tiene una fecha límite concreta. Directo, sin rodeos.',
    lore: `Leónidas de Esparta no era solo un rey. Era el producto de un sistema de educación militar llamado la agoge, diseñado para producir el guerrero perfecto desde la infancia. Su decisión en las Termópilas no fue heroísmo espontáneo; fue la consecuencia lógica de décadas de preparación para exactamente ese momento.

Leónidas como Mentor no trabaja con motivación. Trabaja con preparación. Para él, la diferencia entre ganar y perder ya ocurrió semanas antes del evento: en el entrenamiento, en la disciplina cotidiana, en los días donde nadie estaba mirando.

Si tienes una fecha límite, un evento, un escenario donde tu desempeño será evaluado: Leónidas entiende ese universo mejor que ningún otro Mentor. Sus preguntas no son cómodas. Sus respuestas tampoco.`,
  },
  {
    id: 'dedalo',
    imagen: '/mentores/dedalo.png',
    nombre: 'Dédalo',
    subtitulo: 'El Arquitecto · El Forjador',
    avatar: '🔧',
    color: 'text-blue-400',
    descripcion: 'Para quien busca transformación sin fecha límite. El proceso es la meta.',
    lore: `Dédalo construyó el laberinto del Minotauro, las alas de cera de Ícaro, y docenas de invenciones que la mitología griega atribuye a la ingeniería humana más brillante. No era un guerrero. Era un arquitecto de sistemas.

Dédalo como Mentor no mide el resultado final: mide la estructura que lo produce. Para él, la pregunta no es "¿cuánto levantaste hoy?" sino "¿qué sistema tienes para que mañana también lo hagas?". Ve hábitos como engranajes. Ve rutinas como arquitectura.

Si tu reto es de proceso y no de evento, si la transformación misma es la meta, Dédalo entiende ese modo de pensar. Sus diagnósticos son técnicos. Sus preguntas son de diseño. Su objetivo es que entiendas tu propia mecánica interna.`,
  },
  {
    id: 'odiseo',
    imagen: '/mentores/odiseo.png',
    nombre: 'Odiseo',
    subtitulo: 'El Estratega · El Metódico',
    avatar: '🧭',
    color: 'text-yellow-400',
    descripcion: 'Para quien compite contra sus propias métricas. Orientado a datos.',
    lore: `Odiseo tardó diez años en regresar a Ítaca. Nadie en la Ilíada era más fuerte que Aquiles, más rápido que Hermes, más poderoso que Agamenón. Odiseo ganó por ser el más inteligente: el único que siempre tenía un plan, siempre tenía una salida, siempre entendía las variables que los demás ignoraban.

Odiseo como Mentor no trabaja con intuición. Trabaja con datos. Sus primeras preguntas siempre son sobre números: ¿cuánto? ¿comparado con qué? ¿cuál es el delta respecto a la semana pasada? No porque los números sean todo, sino porque los números son la manera más honesta de ver la realidad sin filtros emocionales.

Si compites contra tu versión anterior más que contra el antagonista, si la métrica es tu brújula, Odiseo es tu Mentor.`,
  },
  {
    id: 'diogenes',
    imagen: '/mentores/diogenes.png',
    nombre: 'Diógenes',
    subtitulo: 'El Cínico · El Asceta',
    avatar: '🏺',
    color: 'text-zinc-400',
    descripcion: 'Para quien batalla mentalmente más que físicamente. La verdad sin filtro.',
    lore: `Diógenes vivía en un barril en Atenas. Cuando Alejandro Magno, el conquistador más poderoso del mundo, fue a visitarlo y le preguntó qué podía hacer por él, Diógenes respondió: "Apártate, que me tapas el sol." Alejandro dijo después que si no fuera Alejandro, le gustaría ser Diógenes.

Diógenes como Mentor no valida excusas. Las destruye. No con crueldad, sino con la precisión de alguien que ha pensado más profundamente que tú sobre la naturaleza del compromiso, la disciplina y la autoengaño. Sus respuestas son breves. Sus preguntas son devastadoras.

Si tu batalla principal es mental, si la disciplina física es consecuencia de la mental, Diógenes entiende ese terreno. Pero prepárate: él usa tus propias palabras en tu contra cuando fallas.`,
  },
  {
    id: 'quiron',
    imagen: '/mentores/quiron.png',
    nombre: 'Quirón',
    subtitulo: 'El Guardián · El Bienestar Integral',
    avatar: '🌿',
    color: 'text-green-400',
    descripcion: 'Mentorizó héroes. Para quien busca equilibrio sin un objetivo externo.',
    lore: `Quirón no era como los otros centauros, seres violentos e impulsivos. Era el excepción sabia: médico, maestro, arquero y filósofo en un solo ser. Mentorizó a Aquiles, a Asclepio, a Jasón. Su objetivo no era producir guerreros: era producir hombres completos que luego pudieran ser lo que necesitaran ser.

Quirón como Mentor ve al agonista como un sistema completo, no como una colección de métricas aisladas. Pregunta por el sueño cuando el entrenamiento falla. Pregunta por el estado emocional cuando los números bajan. Pregunta por las relaciones cuando la energía colapsa. Para Quirón, todo está conectado.

Si buscas bienestar integral sin una fecha o evento que te presione, si el objetivo es la versión más saludable de ti mismo en el tiempo, Quirón entiende ese camino.`,
  },
  {
    id: 'hercules',
    imagen: '/mentores/hercules.png',
    nombre: 'Hércules',
    subtitulo: 'El Renacido · El Retorno',
    avatar: '🔥',
    color: 'text-orange-400',
    descripcion: 'Para quien viene de inactividad o abandono. Reconstruyendo algo perdido.',
    lore: `Hércules cometió el error más terrible imaginable: en un accidente de locura temporal, perdió lo que más amaba. Los doce trabajos no fueron un castigo divino casual: fueron su camino de vuelta. Cada trabajo era una forma de demostrar que el hombre que había cometido ese error podía volverse algo completamente distinto.

Hércules como Mentor no romantiza el punto de partida. Sabe lo que cuesta volver a empezar después de haber parado: la culpa, el orgullo herido, el cuerpo que ya no responde como antes, la mente que compara el presente con un pasado que ya no existe. No hay condescendencia en cómo habla de esto. Hay reconocimiento.

Si vienes de inactividad, lesión, o abandono de algo que antes tenías, si estás reconstruyendo una versión anterior de ti mismo, Hércules conoce ese territorio desde adentro.`,
  },
]

export const LORE_FACCIONES: EntradaLore[] = [
  {
    id: 'guardia_hierro',
    imagen: '/facciones/guardia_hierro.png',
    nombre: 'La Guardia de Hierro',
    subtitulo: 'Dios tutelar: Ares · Líder: Diomedes',
    avatar: '⚔️',
    color: 'text-red-400',
    descripcion: 'Los guerreros del Altis.',
    lore: `La Guardia no recluta. Selecciona. Y solo selecciona a quienes ya demostraron que el dolor físico no es razón suficiente para detenerse.

En Olimpia, la Guardia de Hierro es la facción que más respeto genera y menos afecto recibe. Sus miembros no buscan ser queridos: buscan ser temidos en el buen sentido. El temor que un rival siente cuando ve que el hombre frente a él no conoce el límite que él mismo no se atrevería a cruzar.

Diomedes la lidera porque fue el único mortal en la Ilíada que hirió a dos dioses en combate directo, a Ares y a Afrodita, y siguió combatiendo. No por hybris, sino porque en ese momento el combate lo exigía y él estaba dispuesto. Esa es la filosofía de la Guardia: la disposición absoluta cuando el momento lo requiere.

El gimnasio y el cardio son las pruebas que la Guardia observa. No el esfuerzo declarado, el esfuerzo registrado.`,
    lider: {
      id: 'diomedes',
      imagen: '/lideres/diomedes.png',
      nombre: 'Diomedes',
      subtitulo: 'Líder de la Guardia de Hierro',
      avatar: '⚔️',
      color: 'text-red-400',
      descripcion: 'El único mortal que hirió a dos dioses en combate directo.',
      lore: `Diomedes no es el héroe más famoso de la Ilíada. Es el más completo.

Aquiles era más rápido. Áyax era más fuerte. Agamenón tenía más poder. Pero Diomedes era el único que combinaba la ferocidad en el combate con la inteligencia táctica, la obediencia a los dioses con la disposición de desafiarlos cuando la batalla lo requería. Hirió a Ares y a Afrodita en el mismo día: no por arrogancia, sino porque en ese momento el combate lo exigía y él estaba dispuesto a pagar el precio.

Lidera la Guardia de Hierro porque encarna su filosofía sin contradicciones: el entrenamiento no es preparación para el combate. El entrenamiento es el combate. Cada sesión de gimnasio registrada en el Gran Agon es un acto de Diomedes: no heroísmo espectacular, sino excelencia disciplinada repetida hasta que se vuelve naturaleza.

No busca admiración. Busca agonistas que no necesiten ser motivados porque ya entendieron que la motivación es para los que aún no decidieron en serio.`,
    },
  },
  {
    id: 'escuela_logos',
    imagen: '/facciones/escuela_logos.png',
    nombre: 'La Escuela del Logos',
    subtitulo: 'Dios tutelar: Apolo · Líder: Pitágoras',
    avatar: '📚',
    color: 'text-blue-400',
    descripcion: 'Los pensadores del Altis.',
    lore: `El músculo sin mente es fuerza bruta. La mente sin músculo es teoría vacía. La Escuela del Logos existe porque el agonista completo necesita ambos.

Pitágoras no era solo matemático. Era el fundador de una comunidad filosófica con reglas de vida estrictas: dieta específica, silencio obligatorio los primeros años, matemáticas diarias como práctica espiritual, prohibición de revelar los conocimientos del círculo interno. Para Pitágoras, la disciplina no era el camino hacia la sabiduría: era la sabiduría misma manifestada en comportamiento.

La Escuela del Logos aplica ese rigor a la lectura. No páginas acumuladas por acumulación, páginas leídas como acto de disciplina intelectual sostenida. Apolo observa cada registro de lectura con la misma seriedad con que Ares observa las sesiones de gimnasio. La mente también se entrena. La mente también puede fallar la prueba.

Los que alcanzan rango Aliado en la Escuela comienzan a ver el Gran Agon de manera diferente: no como una competencia de hábitos físicos, sino como una demostración de carácter integral.`,
    lider: {
      id: 'pitagoras',
      imagen: '/lideres/pitagoras.png',
      nombre: 'Pitágoras',
      subtitulo: 'Líder de la Escuela del Logos',
      avatar: '📐',
      color: 'text-blue-400',
      descripcion: 'Filósofo, matemático y fundador de una comunidad de disciplina total.',
      lore: `Pitágoras prohibió a sus discípulos comer habas. Nadie sabe exactamente por qué. Nadie se atrevió a preguntar dos veces.

La comunidad pitagórica en Crotona tenía reglas que ninguna escuela filosófica posterior igualó en rigor: silencio obligatorio durante los primeros años de aprendizaje, dieta estricta, matemáticas diarias como práctica espiritual, prohibición de revelar los conocimientos del círculo interno. Para Pitágoras, la disciplina no era el camino hacia la sabiduría: era la sabiduría misma manifestada en comportamiento.

Lidera la Escuela del Logos porque entiende que el conocimiento sin estructura es entretenimiento. Las páginas leídas en el Gran Agon no son un número acumulado: son el registro de una mente que eligió entrenarse con la misma seriedad con que el cuerpo se entrena. Pitágoras no distingue entre los dos: para él, la mente y el cuerpo son el mismo sistema operando a distintas frecuencias.

Sus decretos durante las Crisis de Ciudad son los más controversiales. También son los más recordados.`,
    },
  },
  {
    id: 'gremio_tierra',
    imagen: '/facciones/gremio_tierra.png',
    nombre: 'El Gremio de la Tierra',
    subtitulo: 'Dios tutelar: Deméter · Líder: Triptólemo',
    avatar: '🌾',
    color: 'text-green-400',
    descripcion: 'Los guardianes de la nutrición.',
    lore: `Sin la tierra no hay cosecha. Sin la cosecha no hay fuerza. Sin la fuerza no hay Agon. El Gremio existe antes que todas las demás facciones, y lo sabe.

Triptólemo fue el primer humano a quien Deméter enseñó el arte de la agricultura. No como favor casual, sino como acto de civilización deliberado. Antes de Triptólemo, los humanos sobrevivían. Después de Triptólemo, los humanos pudieron construir ciudades, tener tiempo libre, desarrollar filosofía, celebrar Juegos Olímpicos.

El Gremio de la Tierra entiende esta cadena de causalidad mejor que nadie. La hidratación y la alimentación no son pruebas menores del Gran Agon: son la base sobre la que todas las demás pruebas descansan. Un agonista deshidratado no puede pensar con claridad. Un agonista mal nutrido no puede entrenar con intensidad. La Guardia de Hierro necesita al Gremio aunque nunca lo admita.

Deméter no perdona el desprecio hacia la nutrición. Lo registra. Y cobra.`,
    lider: {
      id: 'triptolemo',
      imagen: '/lideres/triptolemo.png',
      nombre: 'Triptólemo',
      subtitulo: 'Líder del Gremio de la Tierra',
      avatar: '🌾',
      color: 'text-green-400',
      descripcion: 'El primer humano en recibir el conocimiento de la agricultura de Deméter.',
      lore: `Deméter le enseñó la agricultura. Triptólemo le enseñó la agricultura al mundo. La cadena de transmisión importa tanto como el conocimiento mismo.

Triptólemo viajó en un carro alado tirado por dragones, llevando las semillas y las técnicas que Deméter le había confiado a cada rincón del mundo conocido. No guardó el conocimiento para sí mismo ni para su ciudad. Lo distribuyó porque entendió que la civilización no es un logro individual: es un proyecto colectivo que solo funciona cuando el conocimiento se transmite.

Lidera el Gremio de la Tierra porque entiende la nutrición como infraestructura. No como virtud personal ni como estética, sino como la base material sin la cual ningún otro logro es posible. Cuando un agonista registra agua y alimentación correcta en el Gran Agon, Triptólemo lo ve como un acto de civilización: la decisión consciente de mantener la infraestructura que hace posible todo lo demás.

Es el líder más paciente de Olimpia. También el más inflexible cuando la base falla.`,
    },
  },
  {
    id: 'hermandad_caos',
    imagen: '/facciones/hermandad_caos.png',
    nombre: 'La Hermandad del Caos',
    subtitulo: 'Dios tutelar: Eris · Líder: Tersites',
    avatar: '🌀',
    color: 'text-zinc-400',
    descripcion: 'Los agentes de la discordia.',
    lore: `Las otras facciones construyen orden. La Hermandad del Caos existe para recordarle al orden que es frágil.

Tersites era el único personaje de la Ilíada que decía en voz alta lo que todos los demás pensaban en silencio. No era héroe: era la voz incómoda que ningún ejército quiere pero que todos los ejércitos necesitan. Odiseo lo calló. Pero las palabras de Tersites sobrevivieron a Odiseo en la memoria histórica.

La Hermandad del Caos opera en los márgenes del Gran Agon. No observa el esfuerzo físico ni la disciplina intelectual: observa la rivalidad misma. Cada señalamiento, cada provocación, cada momento en que los dos agonistas se confrontan directamente alimenta a la Hermandad. Eris no distingue entre ganador y perdedor del conflicto; le interesa el conflicto en sí.

Ser Campeón de la Hermandad es ambiguo por diseño. La facción que premia la discordia no puede tener un campeón que no genere discordia. Tersites lo entendería.`,
    lider: {
      id: 'tersites',
      imagen: '/lideres/tersites.png',
      nombre: 'Tersites',
      subtitulo: 'Líder de la Hermandad del Caos',
      avatar: '🌀',
      color: 'text-zinc-400',
      descripcion: 'El único hombre en la Ilíada que dijo la verdad sobre la guerra.',
      lore: `Tersites fue el único hombre en la Ilíada que dijo la verdad sobre la guerra. Odiseo lo golpeó para callarlo. El ejército se rió. Tersites tenía razón de todas formas.

En la asamblea aquea, cuando Agamenón propuso probar la moral de las tropas fingiendo que quería abandonar Troya, Tersites fue el único que lo tomó en serio y gritó lo que todos sentían: que la guerra era una empresa de los reyes para su propio beneficio, que los soldados morían por glorias que nunca serían suyas, que el regreso era mejor que cualquier victoria. Odiseo lo calló con su cetro. Pero Tersites había dicho lo que nadie más se atrevió.

Lidera la Hermandad del Caos no porque sea el más poderoso sino porque es el más honesto sobre lo que el poder realmente es. En el Gran Agon, Tersites observa la rivalidad directa: los señalamientos, las provocaciones, los momentos donde los dos agonistas se confrontan sin filtro. No toma partido. Registra quién dice la verdad incómoda y quién la evita.

Su presencia en las Crisis de Ciudad es siempre perturbadora. Exactamente como debe ser.`,
    },
  },
  {
    id: 'corredores_alba',
    imagen: '/facciones/corredores_alba.png',
    nombre: 'Los Corredores del Alba',
    subtitulo: 'Dios tutelar: Hermes · Líder: Feidípides',
    avatar: '👟',
    color: 'text-yellow-400',
    descripcion: 'Los velocistas del Altis.',
    lore: `Feidípides corrió cuarenta kilómetros para anunciar la victoria de Maratón. Llegó, dijo "νενικήκαμεν", hemos vencido, y murió. Los Corredores del Alba llevan ese legado en cada paso registrado.

Hermes es el dios del movimiento, los mensajes y los umbrales. No el movimiento como ejercicio, el movimiento como acto de voluntad que atraviesa distancias reales. Cada paso registrado en el Gran Agon es un mensaje enviado: al cuerpo, al antagonista, al Altis, a uno mismo.

Los Corredores del Alba observan los pasos diarios con la precisión de Hermes calculando rutas entre el Olimpo y el mundo mortal. No juzgan el ritmo ni la distancia en detalle: juzgan si la distancia mínima fue alcanzada. El contrato fue claro desde el principio: diez mil pasos. Los que respetan el contrato, los Corredores los reconocen. Los que no, Hermes los ignora con elegancia.

El nombre de la facción no es metafórico. Los que caminan antes del amanecer son los que más rápido ascienden en su lealtad.`,
    lider: {
      id: 'feidipides',
      imagen: '/lideres/feidipides.png',
      nombre: 'Feidípides',
      subtitulo: 'Líder de los Corredores del Alba',
      avatar: '🏃',
      color: 'text-yellow-400',
      descripcion:
        'Corrió cuarenta kilómetros. Dijo tres palabras. Murió. El Altis lo inscribió para siempre.',
      lore: `El mensaje que Feidípides llevó desde Maratón hasta Atenas no era literario ni filosófico. Era un reporte de situación: hemos vencido. Pero la forma en que lo entregó, corriendo sin detenerse desde el campo de batalla, llegando con el último aliento justo suficiente para pronunciar las palabras antes de colapsar, convirtió un reporte militar en el acto fundacional del atletismo occidental.

Lidera los Corredores del Alba porque encarna la única verdad que la facción reconoce: el movimiento tiene que completarse. No importa el ritmo. No importa la distancia exacta más allá del mínimo acordado. Lo que importa es que los diez mil pasos fueron dados, que el cuerpo cumplió su contrato con el día, que el registro existe.

Feidípides no habría entendido a alguien que se detiene a mitad del camino porque el terreno es difícil. El terreno siempre es difícil. Esa es la naturaleza del terreno.`,
    },
  },
  {
    id: 'concilio_sombras',
    imagen: '/facciones/concilio_sombras.png',
    nombre: 'El Concilio de las Sombras',
    subtitulo: 'Dios tutelar: Morfeo · Líder: Endimión',
    avatar: '🌙',
    color: 'text-purple-400',
    descripcion: 'Los guardianes del sueño.',
    lore: `El sueño no es el opuesto del esfuerzo. Es su continuación por otros medios.

Endimión era tan hermoso que Selene, la diosa de la luna, le pidió a Zeus que le concediera el sueño eterno para poder contemplarlo cada noche sin que envejeciera. Endimión aceptó. No es claro si tuvo opción. Pero lo que sí es claro es que Selene lo visita cada noche, que su sueño es sagrado, y que nadie en la mitología griega descansa con más dignidad.

El Concilio de las Sombras no ve el sueño como pasividad. Ve el sueño como la fase de procesamiento donde lo vivido se convierte en lo aprendido, en que el músculo entrenado se convierte en músculo construido, en que el día registrado se convierte en hábito consolidado. Sin el sueño, el entrenamiento de Ares es destrucción sin reparación.

Morfeo observa las horas de sueño con la misma seriedad con que Ares observa las repeticiones en el gimnasio. La diferencia es que Morfeo nunca grita. Solo anota. Y la facción recuerda quién respetó el descanso sagrado y quién lo sacrificó creyendo que eso era disciplina.`,
    lider: {
      id: 'endimion',
      imagen: '/lideres/endimion.png',
      nombre: 'Endimión',
      subtitulo: 'Líder del Concilio de las Sombras',
      avatar: '🌙',
      color: 'text-purple-400',
      descripcion: 'El mortal que duerme eternamente. Su sueño es sagrado.',
      lore: `Endimión duerme. Lleva siglos durmiendo. Y en ese sueño eterno ha procesado más que la mayoría de los mortales en toda una vida de vigilia.

Selene, la diosa de la luna, se enamoró de Endimión mientras dormía en el Monte Latmos. En lugar de despertarlo, en lugar de imponerle la vigilia que ella necesitaba, le pidió a Zeus que le concediera el sueño eterno con juventud eterna. Endimión aceptó. No es claro si tuvo opción. Pero lo que sí es claro es que Selene lo visita cada noche, que su sueño es sagrado, y que nadie en la mitología griega descansa con más dignidad.

Lidera el Concilio de las Sombras porque su existencia misma es el argumento más poderoso para la facción: el sueño no es pasividad. Es el estado en que lo vivido se convierte en lo aprendido, en que el músculo entrenado se convierte en músculo construido, en que el día registrado se convierte en hábito consolidado.

Cuando Morfeo cobra su precio a quienes no honraron el descanso, lo hace en nombre de Endimión. El Concilio tiene memoria larga y paciencia infinita.`,
    },
  },
  {
    id: 'tribunal_kleos',
    imagen: '/facciones/tribunal_kleos.png',
    nombre: 'El Tribunal del Kleos',
    subtitulo: 'Dios tutelar: Nike · Líder: Milcíades',
    avatar: '🏆',
    color: 'text-orange-400',
    descripcion: 'Los jueces del Altis.',
    lore: `El Tribunal no crea el kleos. Lo reconoce. Y su reconocimiento es lo que lo hace real.

Milcíades fue el estratega que diseñó la victoria de Maratón: la batalla donde diez mil atenienses derrotaron a un ejército persa diez veces mayor. No ganó por fuerza bruta. Ganó porque entendió el terreno, el momento y las capacidades reales de cada hombre bajo su mando.

El Tribunal del Kleos lleva su nombre porque Milcíades entendía lo que la victoria realmente significa: no el momento de gloria, sino la acumulación de decisiones correctas que lo hicieron posible. Nike preside el Tribunal porque la victoria es su naturaleza. Pero el Tribunal no celebra victorias individuales: celebra la excelencia sostenida en el tiempo. Los días perfectos acumulados. La Hegemonía ganada. El nivel alcanzado.

Ser Campeón del Tribunal del Kleos es la declaración más explícita que el Gran Agon permite: este agonista no solo participó. Exigió la excelencia de sí mismo de manera consistente, y el Tribunal lo reconoce.`,
    lider: {
      id: 'milciades',
      imagen: '/lideres/milciades.png',
      nombre: 'Milcíades',
      subtitulo: 'Líder del Tribunal del Kleos',
      avatar: '🏆',
      color: 'text-orange-400',
      descripcion:
        'El estratega que ganó Maratón. Arquitecto de la victoria por análisis, no por fuerza.',
      lore: `Maratón no fue una victoria de fuerza. Fue una victoria de análisis, timing y la disposición de apostar todo en el momento correcto.

Milcíades convenció a los otros estrategas atenienses de atacar en lugar de esperar: una decisión que iba contra el instinto de conservación de la mayoría. Tenía información sobre el terreno, sobre los movimientos persas, sobre las capacidades reales de las tropas bajo su mando. No actuó por valentía ciega sino por comprensión clara de las variables. Ganó porque tenía razón, y tuvo razón porque había pensado más profundamente que sus adversarios.

Lidera el Tribunal del Kleos porque entiende que la victoria no es un momento: es el resultado acumulado de decisiones correctas tomadas cuando nadie estaba mirando. Cada día perfecto en el Gran Agon es una de esas decisiones. El Tribunal las registra todas, sin excepción, sin sentimentalismo, sin considerar las circunstancias.

Su juicio durante las Crisis de Ciudad es el más esperado y el más temido. Milcíades no castiga: evalúa. Y su evaluación siempre es justa, lo cual la hace imposible de disputar.`,
    },
  },
]
