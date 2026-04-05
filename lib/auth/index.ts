import { currentUser } from '@clerk/nextjs/server'
import { getOrCreateAgonista, getAgonistaByClerkId } from '@/lib/db/queries'
import { AGONISTAS } from './agonistas'

export { AGONISTAS }

export async function getCurrentAgonista() {
  const user = await currentUser()
  if (!user) return null
  return getOrCreateAgonista(user.id)
}

export async function getAntagonista(clerkId: string) {
  const ids = Object.values(AGONISTAS).map((a) => a.clerkId)
  const antagonistaClerkId = ids.find((id) => id !== clerkId)
  if (!antagonistaClerkId) return null
  return getAgonistaByClerkId(antagonistaClerkId)
}

export function isAuthorized(clerkId: string): boolean {
  return Object.values(AGONISTAS).some((a) => a.clerkId === clerkId)
}
