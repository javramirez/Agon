// Pool de preguntas hardcodeadas por categoría
// 7 categorías — 10 preguntas por categoría = 70 preguntas totales
// La trivia selecciona 1 pregunta por categoría = 7 preguntas por duelo

export interface PreguntaTrivia {
  id: string
  categoria: string
  pregunta: string
  opciones: [string, string, string, string]
  correcta: 0 | 1 | 2 | 3
}

export const PREGUNTAS_TRIVIA: PreguntaTrivia[] = [
  // MITOLOGÍA
  {
    id: 'mit_01',
    categoria: 'mitologia',
    pregunta:
      '¿Quién fue el único mortal que hirió a dos dioses olímpicos en combate?',
    opciones: ['Aquiles', 'Odiseo', 'Diomedes', 'Heracles'],
    correcta: 2,
  },
  {
    id: 'mit_02',
    categoria: 'mitologia',
    pregunta: '¿Qué castigo recibió Prometeo por robar el fuego de los dioses?',
    opciones: [
      'Fue desterrado al Tártaro',
      'Fue encadenado a una roca y un águila devoró su hígado eternamente',
      'Fue convertido en mortal',
      'Fue obligado a sostener el mundo',
    ],
    correcta: 1,
  },
  {
    id: 'mit_03',
    categoria: 'mitologia',
    pregunta: '¿Quién fue Endimión en la mitología griega?',
    opciones: [
      'Un general espartano',
      'Un pastor amado por Selene que fue sumido en sueño eterno',
      'El fundador de Olimpia',
      'Un semidiós hijo de Hermes',
    ],
    correcta: 1,
  },
  {
    id: 'mit_04',
    categoria: 'mitologia',
    pregunta:
      '¿Qué enseñó Triptólemo a la humanidad por encargo de Deméter?',
    opciones: ['La escritura', 'La agricultura', 'La navegación', 'La medicina'],
    correcta: 1,
  },
  {
    id: 'mit_05',
    categoria: 'mitologia',
    pregunta: '¿Por qué Tersites fue golpeado por Odiseo en la Ilíada?',
    opciones: [
      'Por cobardía en batalla',
      'Por robar comida al ejército',
      'Por criticar públicamente a Agamenón',
      'Por insultar a Aquiles',
    ],
    correcta: 2,
  },
  {
    id: 'mit_06',
    categoria: 'mitologia',
    pregunta: '¿Qué representa Eris en la mitología griega?',
    opciones: [
      'La victoria',
      'La discordia y el caos',
      'La sabiduría',
      'La justicia',
    ],
    correcta: 1,
  },
  {
    id: 'mit_07',
    categoria: 'mitologia',
    pregunta: '¿Cuál fue el don y la maldición de Morfeo?',
    opciones: [
      'Podía matar con el pensamiento',
      'Podía tomar cualquier forma humana en los sueños',
      'Era inmortal pero no podía moverse',
      'Veía el futuro pero no podía comunicarlo',
    ],
    correcta: 1,
  },
  {
    id: 'mit_08',
    categoria: 'mitologia',
    pregunta:
      '¿Cuál fue el destino final de Milcíades, el vencedor de Maratón?',
    opciones: [
      'Murió en batalla en Persia',
      'Fue exiliado de Atenas',
      'Murió en prisión esperando pagar una multa por traición',
      'Se retiró como héroe honrado',
    ],
    correcta: 2,
  },
  {
    id: 'mit_09',
    categoria: 'mitologia',
    pregunta:
      '¿Qué ocurrió con Feidípides después de anunciar la victoria de Maratón?',
    opciones: [
      'Fue nombrado general',
      'Murió inmediatamente después de dar el mensaje',
      'Se convirtió en mensajero oficial de Atenas',
      'Recibió tierras como recompensa',
    ],
    correcta: 1,
  },
  {
    id: 'mit_10',
    categoria: 'mitologia',
    pregunta: '¿Quién era Pitágoras además de matemático?',
    opciones: [
      'Un general macedonio',
      'El fundador de los Juegos Olímpicos',
      'Líder de una secta filosófica con reglas de vida estrictas',
      'El primer historiador griego',
    ],
    correcta: 2,
  },
  // FILOSOFÍA
  {
    id: 'fil_01',
    categoria: 'filosofia',
    pregunta:
      '¿Cuál es la inscripción del Oráculo de Delfos que sintetiza la filosofía socrática?',
    opciones: [
      'Nada en exceso',
      'Conócete a ti mismo',
      'El camino es la meta',
      'La virtud es suficiente',
    ],
    correcta: 1,
  },
  {
    id: 'fil_02',
    categoria: 'filosofia',
    pregunta: '¿Qué es la "eudaimonia" en la filosofía aristotélica?',
    opciones: [
      'El estado de ignorancia perfecta',
      'La felicidad como florecimiento pleno del ser humano',
      'El placer máximo de los sentidos',
      'La ausencia de dolor',
    ],
    correcta: 1,
  },
  {
    id: 'fil_03',
    categoria: 'filosofia',
    pregunta: '¿Qué enseñaba Diógenes de Sinope sobre la vida buena?',
    opciones: [
      'Que la riqueza era el camino a la virtud',
      'Que vivir con el mínimo necesario liberaba al hombre de ataduras falsas',
      'Que el conocimiento era el único bien',
      'Que la política era el arte supremo',
    ],
    correcta: 1,
  },
  {
    id: 'fil_04',
    categoria: 'filosofia',
    pregunta: '¿Qué es la "arete" en la filosofía griega clásica?',
    opciones: [
      'El amor romántico',
      'La excelencia o virtud en el cumplimiento del propósito propio',
      'La sabiduría de los dioses',
      'El destino inevitable',
    ],
    correcta: 1,
  },
  {
    id: 'fil_05',
    categoria: 'filosofia',
    pregunta: '¿Qué significa "hybris" en el contexto griego clásico?',
    opciones: [
      'La humildad extrema',
      'El orgullo desmedido que desafía el orden divino y natural',
      'La sabiduría adquirida con la edad',
      'El valor en batalla',
    ],
    correcta: 1,
  },
  {
    id: 'fil_06',
    categoria: 'filosofia',
    pregunta: '¿Qué decía Heráclito sobre el cambio?',
    opciones: [
      'Que nada cambia verdaderamente',
      'Que no se puede bañar dos veces en el mismo río',
      'Que el cambio era una ilusión de los sentidos',
      'Que los dioses controlaban todo cambio',
    ],
    correcta: 1,
  },
  {
    id: 'fil_07',
    categoria: 'filosofia',
    pregunta: '¿Qué es el "logos" en la filosofía griega?',
    opciones: [
      'El lenguaje de los dioses exclusivamente',
      'La razón, el orden y el discurso que estructura el mundo',
      'El libro sagrado de los filósofos',
      'La capacidad de engañar con palabras',
    ],
    correcta: 1,
  },
  {
    id: 'fil_08',
    categoria: 'filosofia',
    pregunta: '¿Qué sostenían los estoicos sobre las emociones?',
    opciones: [
      'Que debían expresarse libremente para vivir bien',
      'Que solo las emociones positivas debían cultivarse',
      'Que podían controlarse a través de la razón y la disciplina mental',
      'Que eran mensajes directos de los dioses',
    ],
    correcta: 2,
  },
  {
    id: 'fil_09',
    categoria: 'filosofia',
    pregunta: '¿Qué es la "ataraxia" para los epicúreos?',
    opciones: [
      'El máximo placer sensorial',
      'La tranquilidad mental y ausencia de perturbación',
      'La sabiduría política',
      'La victoria en debate filosófico',
    ],
    correcta: 1,
  },
  {
    id: 'fil_10',
    categoria: 'filosofia',
    pregunta: '¿Cuál era la idea central de la filosofía de Sócrates?',
    opciones: [
      'Que el conocimiento se adquiría solo con la experiencia',
      'Que la virtud era conocimiento y la ignorancia la causa del mal',
      'Que los dioses eran la fuente de toda sabiduría',
      'Que el placer era el fin último de la vida',
    ],
    correcta: 1,
  },
  // HISTORIA GRIEGA
  {
    id: 'his_01',
    categoria: 'historia_griega',
    pregunta: '¿En qué año ocurrió la batalla de Maratón?',
    opciones: ['490 a.C.', '480 a.C.', '431 a.C.', '338 a.C.'],
    correcta: 0,
  },
  {
    id: 'his_02',
    categoria: 'historia_griega',
    pregunta:
      '¿Cada cuántos años se celebraban los Juegos Olímpicos en la antigua Grecia?',
    opciones: ['Cada año', 'Cada dos años', 'Cada cuatro años', 'Cada diez años'],
    correcta: 2,
  },
  {
    id: 'his_03',
    categoria: 'historia_griega',
    pregunta: '¿Qué fue la "Ekecheiria" en los Juegos Olímpicos?',
    opciones: [
      'La ceremonia de apertura',
      'La tregua sagrada que suspendía las guerras durante los Juegos',
      'El premio al ganador',
      'El juramento de los atletas',
    ],
    correcta: 1,
  },
  {
    id: 'his_04',
    categoria: 'historia_griega',
    pregunta: '¿Qué ciudad-estado ganó la batalla de Salamina en 480 a.C.?',
    opciones: ['Esparta', 'Corinto', 'Atenas', 'Tebas'],
    correcta: 2,
  },
  {
    id: 'his_05',
    categoria: 'historia_griega',
    pregunta:
      '¿Cuál era el premio material que recibían los ganadores en los Juegos Olímpicos originales?',
    opciones: [
      'Oro y plata',
      'Una corona de ramas de olivo',
      'Tierras y esclavos',
      'Una estatua de oro',
    ],
    correcta: 1,
  },
  {
    id: 'his_06',
    categoria: 'historia_griega',
    pregunta:
      '¿Qué evento deportivo era el más prestigioso en los Juegos Olímpicos antiguos?',
    opciones: [
      'El lanzamiento de disco',
      'La lucha',
      'La carrera de estadio (stade)',
      'El pentatlon',
    ],
    correcta: 2,
  },
  {
    id: 'his_07',
    categoria: 'historia_griega',
    pregunta: '¿Qué fue el "Altis" en Olimpia?',
    opciones: [
      'El estadio principal de los Juegos',
      'El recinto sagrado donde se ubicaban los templos y el altar de Zeus',
      'El palacio del gobernador',
      'El mercado central de Olimpia',
    ],
    correcta: 1,
  },
  {
    id: 'his_08',
    categoria: 'historia_griega',
    pregunta: '¿Qué fue la "Polis" en la antigua Grecia?',
    opciones: [
      'Una forma de escritura antigua',
      'La ciudad-estado como unidad política y social fundamental',
      'El ejército ciudadano',
      'El consejo de ancianos',
    ],
    correcta: 1,
  },
  {
    id: 'his_09',
    categoria: 'historia_griega',
    pregunta: '¿Quién fue Temístocles?',
    opciones: [
      'El fundador de los Juegos Olímpicos',
      'El estratega ateniense que ideó la victoria naval en Salamina',
      'El filósofo que sucedió a Sócrates',
      'El primer rey de Macedonia',
    ],
    correcta: 1,
  },
  {
    id: 'his_10',
    categoria: 'historia_griega',
    pregunta: '¿Qué fue el "Kleos" en la cultura griega antigua?',
    opciones: [
      'Una moneda de intercambio',
      'La gloria y fama que perdura después de la muerte',
      'Un tipo de armadura espartana',
      'El título del líder militar',
    ],
    correcta: 1,
  },
  // DISCIPLINA
  {
    id: 'dis_01',
    categoria: 'disciplina',
    pregunta:
      '¿Cuántos días tarda en promedio en formarse un nuevo hábito según la investigación moderna?',
    opciones: ['21 días', '30 días', '66 días', '90 días'],
    correcta: 2,
  },
  {
    id: 'dis_02',
    categoria: 'disciplina',
    pregunta:
      '¿Qué es el "efecto compuesto" en el contexto del rendimiento personal?',
    opciones: [
      'El esfuerzo máximo en un día específico',
      'Los resultados extraordinarios de pequeñas acciones consistentes acumuladas en el tiempo',
      'La suma de todos los errores cometidos',
      'La técnica de entrenar múltiples habilidades simultáneamente',
    ],
    correcta: 1,
  },
  {
    id: 'dis_03',
    categoria: 'disciplina',
    pregunta: '¿Qué es el "overtraining" o sobreentrenamiento?',
    opciones: [
      'Entrenar más de lo recomendado con resultados positivos',
      'Un estado de fatiga crónica donde el rendimiento disminuye por exceso de carga sin recuperación suficiente',
      'Entrenar demasiadas disciplinas diferentes',
      'La fase avanzada del entrenamiento de élite',
    ],
    correcta: 1,
  },
  {
    id: 'dis_04',
    categoria: 'disciplina',
    pregunta:
      '¿Qué propone la teoría de "sistemas vs metas" de James Clear?',
    opciones: [
      'Que las metas son más importantes que los sistemas',
      'Que los sistemas y procesos diarios son más determinantes para el éxito que las metas finales',
      'Que ninguno importa, solo el talento innato',
      'Que las metas deben revisarse cada semana',
    ],
    correcta: 1,
  },
  {
    id: 'dis_05',
    categoria: 'disciplina',
    pregunta: '¿Qué es la "zona 2" en el entrenamiento cardiovascular?',
    opciones: [
      'El esfuerzo máximo sostenible',
      'Una intensidad moderada donde se puede mantener conversación, que optimiza la eficiencia aeróbica',
      'El segundo ejercicio de la rutina',
      'El entrenamiento por intervalos de alta intensidad',
    ],
    correcta: 1,
  },
  {
    id: 'dis_06',
    categoria: 'disciplina',
    pregunta:
      '¿Cuántas horas de sueño recomienda la ciencia del sueño para adultos?',
    opciones: ['5-6 horas', '6-7 horas', '7-9 horas', '9-10 horas'],
    correcta: 2,
  },
  {
    id: 'dis_07',
    categoria: 'disciplina',
    pregunta:
      '¿Qué es el "principio de Pareto" aplicado a la productividad?',
    opciones: [
      'Que el 50% del esfuerzo produce el 50% de los resultados',
      'Que el 20% de las acciones produce el 80% de los resultados',
      'Que solo el 10% de las personas son verdaderamente productivas',
      'Que la productividad cae un 30% después del mediodía',
    ],
    correcta: 1,
  },
  {
    id: 'dis_08',
    categoria: 'disciplina',
    pregunta: '¿Qué sostiene la investigación sobre la fuerza de voluntad?',
    opciones: [
      'Que es ilimitada si se entrena correctamente',
      'Que es un músculo que se fortalece sin límite',
      'Que es un recurso limitado que se agota durante el día',
      'Que no existe — todo es motivación',
    ],
    correcta: 2,
  },
  {
    id: 'dis_09',
    categoria: 'disciplina',
    pregunta:
      '¿Qué es la "práctica deliberada" según Anders Ericsson?',
    opciones: [
      'Practicar todos los días sin importar cómo',
      'El entrenamiento enfocado en los puntos débiles específicos con feedback inmediato',
      'La práctica en grupo con un mentor',
      'Repetir las fortalezas hasta dominarlas completamente',
    ],
    correcta: 1,
  },
  {
    id: 'dis_10',
    categoria: 'disciplina',
    pregunta:
      '¿Qué demuestra la investigación sobre los 10.000 pasos diarios?',
    opciones: [
      'Que es el mínimo absoluto para mantenerse sano',
      'Que es un número de marketing sin base científica — beneficios significativos ocurren desde 7.000-8.000',
      'Que es insuficiente — se necesitan 15.000',
      'Que solo importa si se hacen continuos, no repartidos',
    ],
    correcta: 1,
  },
  // DIOSES (categoría interna: deuses)
  {
    id: 'dio_01',
    categoria: 'deuses',
    pregunta:
      '¿Cuál era el dominio principal de Hermes además del comercio?',
    opciones: [
      'La guerra',
      'Los mensajeros, viajeros y guía de almas al inframundo',
      'La agricultura',
      'El mar',
    ],
    correcta: 1,
  },
  {
    id: 'dio_02',
    categoria: 'deuses',
    pregunta:
      '¿Por qué Nike era representada con alas en la iconografía griega?',
    opciones: [
      'Porque era hija de Zeus y Hera',
      'Para simbolizar la velocidad con que llega la victoria',
      'Porque vivía en el Olimpo más alto',
      'Para distinguirla de los mortales',
    ],
    correcta: 1,
  },
  {
    id: 'dio_03',
    categoria: 'deuses',
    pregunta:
      '¿Qué diferenciaba a Apolo de otros dioses en cuanto a sus dominios?',
    opciones: [
      'Era el único dios inmortal',
      'Dominaba tanto la luz y la razón como la música, la profecía y la medicina',
      'Era el único que podía derrotar a Zeus',
      'Controlaba todos los elementos naturales',
    ],
    correcta: 1,
  },
  {
    id: 'dio_04',
    categoria: 'deuses',
    pregunta:
      '¿Cómo se distinguía Deméter de otras diosas del Olimpo?',
    opciones: [
      'Era la única diosa guerrera',
      'Era la diosa de la agricultura y la fertilidad, conectada con los ciclos de vida y muerte a través de Perséfone',
      'Era la más joven de los doce olímpicos',
      'Era la única que podía visitar el inframundo libremente',
    ],
    correcta: 1,
  },
  {
    id: 'dio_05',
    categoria: 'deuses',
    pregunta: '¿Qué representaba Ares en la visión griega del mundo?',
    opciones: [
      'La guerra justa y estratégica',
      'El aspecto brutal, caótico y sanguinario de la guerra',
      'La protección de los guerreros virtuosos',
      'La victoria inevitable en batalla',
    ],
    correcta: 1,
  },
  {
    id: 'dio_06',
    categoria: 'deuses',
    pregunta: '¿Qué poder específico tenía Morfeo sobre los mortales?',
    opciones: [
      'Podía matar en sueños',
      'Podía aparecer en los sueños tomando la forma de cualquier persona',
      'Controlaba cuánto dormían los mortales',
      'Veía todos los sueños pero no podía intervenir',
    ],
    correcta: 1,
  },
  {
    id: 'dio_07',
    categoria: 'deuses',
    pregunta: '¿Cuál era el símbolo más característico de Hermes?',
    opciones: [
      'El tridente',
      'El caduceo — un bastón con dos serpientes entrelazadas',
      'El rayo',
      'El arco y las flechas',
    ],
    correcta: 1,
  },
  {
    id: 'dio_08',
    categoria: 'deuses',
    pregunta:
      '¿En qué contexto específico aparecía Nike en la religión griega?',
    opciones: [
      'Solo en guerras entre ciudades-estado',
      'En cualquier competición o conflicto donde se determinaba un ganador',
      'Exclusivamente en los Juegos Olímpicos',
      'Solo cuando Zeus lo ordenaba',
    ],
    correcta: 1,
  },
  {
    id: 'dio_09',
    categoria: 'deuses',
    pregunta: '¿Qué rol tuvo Eris en el inicio de la Guerra de Troya?',
    opciones: [
      'Ninguno — fue una guerra puramente política',
      'Lanzó la manzana de la discordia que desencadenó el conflicto entre diosas',
      'Fue la mensajera que llevó el rapto de Helena',
      'Convenció a Paris de ir a Esparta',
    ],
    correcta: 1,
  },
  {
    id: 'dio_10',
    categoria: 'deuses',
    pregunta:
      '¿Cómo era Apolo diferente de Dioniso en la visión de Nietzsche?',
    opciones: [
      'Apolo representaba el caos creativo, Dioniso el orden racional',
      'Apolo representaba el orden, la razón y la forma; Dioniso el caos, la emoción y lo irracional',
      'Eran idénticos en naturaleza pero opuestos en método',
      'Nietzsche no comparó a estos dioses',
    ],
    correcta: 1,
  },
  // HÉROES
  {
    id: 'her_01',
    categoria: 'heroes',
    pregunta:
      '¿Cuántos trabajos realizó Heracles (Hércules) como penitencia?',
    opciones: ['7', '10', '12', '15'],
    correcta: 2,
  },
  {
    id: 'her_02',
    categoria: 'heroes',
    pregunta:
      '¿Cuál fue la estrategia principal de Odiseo para ganar la Guerra de Troya?',
    opciones: [
      'La superioridad numérica del ejército griego',
      'El engaño del caballo de madera',
      'La intervención directa de Zeus',
      'La traición de un troyano',
    ],
    correcta: 1,
  },
  {
    id: 'her_03',
    categoria: 'heroes',
    pregunta:
      '¿Qué característica distinguía a Aquiles de otros héroes griegos?',
    opciones: [
      'Su inteligencia superior',
      'Su invulnerabilidad casi total excepto en el talón',
      'Su capacidad de hablar con los dioses',
      'Su inmortalidad otorgada por Zeus',
    ],
    correcta: 1,
  },
  {
    id: 'her_04',
    categoria: 'heroes',
    pregunta: '¿Quién fue Quirón en la mitología griega?',
    opciones: [
      'Un rey de Esparta',
      'El centauro más sabio, maestro de héroes como Aquiles y Jasón',
      'Un dios menor del bosque',
      'El guardián del inframundo',
    ],
    correcta: 1,
  },
  {
    id: 'her_05',
    categoria: 'heroes',
    pregunta:
      '¿Qué distinguía al héroe griego del hombre común en la visión clásica?',
    opciones: [
      'Su linaje divino exclusivamente',
      'Su disposición a enfrentar pruebas imposibles y su kleos posterior',
      'Su riqueza y poder político',
      'Su amistad con los dioses',
    ],
    correcta: 1,
  },
  {
    id: 'her_06',
    categoria: 'heroes',
    pregunta: '¿Qué fue el "nostos" en la narrativa heroica griega?',
    opciones: [
      'La victoria en batalla',
      'El regreso del héroe a su hogar después de las pruebas',
      'El reconocimiento de los dioses',
      'La muerte honorable en combate',
    ],
    correcta: 1,
  },
  {
    id: 'her_07',
    categoria: 'heroes',
    pregunta:
      '¿Cuál era el mayor temor del héroe griego, peor que la muerte?',
    opciones: [
      'La cobardía en batalla',
      'El olvido — morir sin dejar kleos, sin que nadie recuerde su nombre',
      'La derrota ante un igual',
      'La traición de los amigos',
    ],
    correcta: 1,
  },
  {
    id: 'her_08',
    categoria: 'heroes',
    pregunta: '¿Qué lección representa el mito de Ícaro?',
    opciones: [
      'Que volar es imposible para los mortales',
      'Que ignorar las advertencias y exceder los límites tiene consecuencias fatales',
      'Que los dioses siempre protegen a los valientes',
      'Que el conocimiento técnico supera a la fuerza',
    ],
    correcta: 1,
  },
  {
    id: 'her_09',
    categoria: 'heroes',
    pregunta:
      '¿Qué caracterizaba la amistad entre Aquiles y Patroclo en la Ilíada?',
    opciones: [
      'Era una rivalidad encubierta',
      'Era el vínculo más sagrado del poema — la muerte de Patroclo desencadenó la furia definitiva de Aquiles',
      'Era una relación de maestro y alumno',
      'Era principalmente estratégica para la guerra',
    ],
    correcta: 1,
  },
  {
    id: 'her_10',
    categoria: 'heroes',
    pregunta:
      '¿Qué tipo de héroe representa Leónidas en la tradición griega?',
    opciones: [
      'El héroe astuto que vence con inteligencia',
      'El héroe que sacrifica su vida conscientemente por un bien mayor',
      'El héroe que busca inmortalidad personal',
      'El héroe que negocia la paz entre ciudades',
    ],
    correcta: 1,
  },
  // OLIMPIA
  {
    id: 'oli_01',
    categoria: 'olimpia',
    pregunta: '¿En qué región de Grecia se ubicaba la antigua Olimpia?',
    opciones: ['Ática', 'Macedonia', 'Élide, en el Peloponeso', 'Beocia'],
    correcta: 2,
  },
  {
    id: 'oli_02',
    categoria: 'olimpia',
    pregunta: '¿A qué dios estaban dedicados los Juegos Olímpicos originales?',
    opciones: ['Apolo', 'Ares', 'Zeus', 'Poseidón'],
    correcta: 2,
  },
  {
    id: 'oli_03',
    categoria: 'olimpia',
    pregunta: '¿Cuándo comenzaron los primeros Juegos Olímpicos registrados?',
    opciones: ['776 a.C.', '650 a.C.', '490 a.C.', '1000 a.C.'],
    correcta: 0,
  },
  {
    id: 'oli_04',
    categoria: 'olimpia',
    pregunta:
      '¿Qué personas tenían prohibido participar como atletas en los Juegos Olímpicos originales?',
    opciones: [
      'Los no griegos y los esclavos',
      'Las mujeres casadas y los extranjeros',
      'Los esclavos, las mujeres y los no griegos',
      'Solo los esclavos',
    ],
    correcta: 2,
  },
  {
    id: 'oli_05',
    categoria: 'olimpia',
    pregunta:
      '¿Qué famosa estatua se encontraba en el templo de Zeus en Olimpia?',
    opciones: [
      'La Victoria de Samotracia',
      'La estatua crisoelefantina de Zeus, una de las Siete Maravillas del Mundo',
      'La Venus de Milo',
      'El Discóbolo de Mirón',
    ],
    correcta: 1,
  },
  {
    id: 'oli_06',
    categoria: 'olimpia',
    pregunta:
      '¿Qué evento marcó el fin de los Juegos Olímpicos de la antigüedad?',
    opciones: [
      'La invasión persa',
      'El decreto del emperador romano Teodosio I en 393 d.C. prohibiendo festivales paganos',
      'Un terremoto que destruyó Olimpia',
      'La caída de Atenas ante Esparta',
    ],
    correcta: 1,
  },
  {
    id: 'oli_07',
    categoria: 'olimpia',
    pregunta:
      '¿Qué era el "estadio" en Olimpia además de recinto deportivo?',
    opciones: [
      'Solo el edificio donde se celebraban los eventos',
      'Una unidad de medida de longitud equivalente a unos 192 metros — la distancia de la primera carrera',
      'El palco donde se sentaban los jueces',
      'El nombre del evento deportivo principal',
    ],
    correcta: 1,
  },
  {
    id: 'oli_08',
    categoria: 'olimpia',
    pregunta:
      '¿Qué deportes incluía el Pentatlón en los Juegos Olímpicos antiguos?',
    opciones: [
      'Carrera, lucha, boxeo, lanzamiento de jabalina, salto',
      'Carrera, lucha, lanzamiento de disco, lanzamiento de jabalina y salto de longitud',
      'Carrera de caballos, lucha, boxeo, disco y jabalina',
      'Los cinco eventos de mayor prestigio de cada edición',
    ],
    correcta: 1,
  },
  {
    id: 'oli_09',
    categoria: 'olimpia',
    pregunta:
      '¿Qué significaba ganar en Olimpia para un atleta griego más allá del premio?',
    opciones: [
      'Riqueza garantizada de por vida',
      'Gloria eterna, estatuas en su ciudad y beneficios materiales de su polis',
      'El derecho a gobernar su ciudad',
      'La ciudadanía en Atenas automáticamente',
    ],
    correcta: 1,
  },
  {
    id: 'oli_10',
    categoria: 'olimpia',
    pregunta: '¿Cuándo se restauraron los Juegos Olímpicos modernos?',
    opciones: ['1876', '1896', '1900', '1912'],
    correcta: 1,
  },
]

export function sortearPreguntasTrivia(categorias: string[]): PreguntaTrivia[] {
  return categorias
    .map((categoria) => {
      const pool = PREGUNTAS_TRIVIA.filter((p) => p.categoria === categoria)
      if (pool.length === 0) return undefined
      const idx = Math.floor(Math.random() * pool.length)
      return pool[idx]!
    })
    .filter((p): p is PreguntaTrivia => p !== undefined)
}

export function getPreguntasTrivia(ids: string[]): PreguntaTrivia[] {
  return ids
    .map((id) => PREGUNTAS_TRIVIA.find((p) => p.id === id))
    .filter(Boolean) as PreguntaTrivia[]
}
