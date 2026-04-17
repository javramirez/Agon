import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AdminClient } from '@/components/agon/admin-client'

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  if (userId !== process.env.ADMIN_CLERK_ID) redirect('/dashboard')

  return <AdminClient />
}
