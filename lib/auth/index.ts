import { currentUser } from '@clerk/nextjs/server'
import { getAgonistaByClerkId, getAntagonistaPorReto } from '@/lib/db/queries'

/**
 * Retorna el agonista del usuario autenticado actualmente.
 * Retorna null si no está autenticado o no tiene registro en DB.
 * NO crea el agonista — eso ocurre durante el onboarding.
 */
export async function getCurrentAgonista() {
  const user = await currentUser()
  if (!user) return null
  return getAgonistaByClerkId(user.id)
}

/**
 * Retorna el antagonista del agonista actual dentro del mismo reto.
 * Retorna null si el reto es solo o si el rival aún no se unió.
 */
export async function getAntagonista(retoId: string, agonistId: string) {
  return getAntagonistaPorReto(retoId, agonistId)
}

/**
 * Retorna true si el usuario tiene un agonista registrado en DB.
 * Usado por el layout para decidir si redirigir al onboarding.
 */
export async function isRegistered(): Promise<boolean> {
  const agonista = await getCurrentAgonista()
  return agonista !== null
}
