import { db } from '@/lib/db'
import { notificaciones, notificacionTipoEnum } from '@/lib/db/schema'

type TipoNotificacion = (typeof notificacionTipoEnum.enumValues)[number]

interface NotificacionInput {
  agonistId: string
  tipo: TipoNotificacion
  titulo: string
  descripcion: string
  metadata?: Record<string, unknown>
}

// Helper principal — llamar desde cualquier API route o lib
export async function crearNotificacion(input: NotificacionInput): Promise<void> {
  try {
    await db.insert(notificaciones).values({
      id: crypto.randomUUID(),
      agonistId: input.agonistId,
      tipo: input.tipo,
      titulo: input.titulo,
      descripcion: input.descripcion,
      metadata: input.metadata ?? null,
      leida: false,
    })
  } catch (err) {
    // Silencioso — nunca bloquear el flujo principal por una notificación
    console.error('crearNotificacion error:', err)
  }
}

// Helpers por tipo — para usar directamente en las API routes
export async function notificarInscripcion(
  agonistId: string,
  inscripcionNombre: string,
  inscripcionId: string
) {
  return crearNotificacion({
    agonistId,
    tipo: 'inscripcion_desbloqueada',
    titulo: 'Inscripción desbloqueada',
    descripcion: `"${inscripcionNombre}" fue inscrita en el Altis.`,
    metadata: { inscripcionId },
  })
}

export async function notificarNivelSubido(
  agonistId: string,
  nivelNuevo: string,
  nivelLabel: string
) {
  return crearNotificacion({
    agonistId,
    tipo: 'nivel_subido',
    titulo: 'El Altis te reconoce',
    descripcion: `Nuevo nivel: ${nivelLabel}.`,
    metadata: { nivel: nivelNuevo },
  })
}

export async function notificarComentarioDios(
  agonistId: string,
  diosNombre: string,
  preview: string
) {
  return crearNotificacion({
    agonistId,
    tipo: 'comentario_dios',
    titulo: `${diosNombre} habló en el Ágora`,
    descripcion: preview.length > 80 ? preview.slice(0, 80) + '...' : preview,
    metadata: { diosNombre },
  })
}

export async function notificarHegemoniaGanada(
  agonistId: string,
  semana: number,
  kleos: number
) {
  return crearNotificacion({
    agonistId,
    tipo: 'hegemonia_ganada',
    titulo: 'La Hegemonía es tuya',
    descripcion: `Conquistaste la Hegemonía de la semana ${semana} con ${kleos} kleos.`,
    metadata: { semana, kleos },
  })
}

export async function notificarPruebaExtraordinaria(
  agonistId: string,
  descripcion: string,
  kleosBonus: number
) {
  return crearNotificacion({
    agonistId,
    tipo: 'prueba_extraordinaria',
    titulo: 'Nueva Prueba Extraordinaria',
    descripcion: `${descripcion} — ${kleosBonus} kleos bonus.`,
    metadata: { kleosBonus },
  })
}

export async function notificarSenalamiento(
  agonistId: string,
  senaladorNombre: string
) {
  return crearNotificacion({
    agonistId,
    tipo: 'senalamiento',
    titulo: 'Fuiste señalado',
    descripcion: `${senaladorNombre} activó El Señalamiento. Tienes 24 horas para responder.`,
    metadata: { senaladorNombre },
  })
}

export async function notificarProvocacion(
  agonistId: string,
  remitente: string,
  mensaje: string
) {
  return crearNotificacion({
    agonistId,
    tipo: 'provocacion',
    titulo: `${remitente} lanzó La Voz del Agon`,
    descripcion: mensaje.length > 80 ? mensaje.slice(0, 80) + '...' : mensaje,
    metadata: { remitente },
  })
}

export async function notificarAntagonistaActivo(
  agonistId: string,
  antagonistaNombre: string,
  pruebasCompletadas: number
) {
  return crearNotificacion({
    agonistId,
    tipo: 'antagonista_activo',
    titulo: `${antagonistaNombre} está en combate`,
    descripcion: `Tu antagonista completó una prueba. Lleva ${pruebasCompletadas}/7 hoy.`,
    metadata: { antagonistaNombre, pruebasCompletadas },
  })
}

export async function notificarMentor(
  agonistId: string,
  mentorNombre: string,
  preview: string
) {
  return crearNotificacion({
    agonistId,
    tipo: 'mentor',
    titulo: `${mentorNombre} tiene algo para ti`,
    descripcion: preview.length > 80 ? preview.slice(0, 80) + '...' : preview,
    metadata: { mentorNombre },
  })
}
