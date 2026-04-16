import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  // TODO PROMPT-01: acceso admin por CLERK_JAVIER_USER_ID eliminado (PROMPT 03)
  void userId
  redirect('/dashboard')
}
