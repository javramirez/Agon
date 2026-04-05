import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AdminPanel } from '@/components/agon/admin-panel'

export default async function AdminPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          Panel del Altis
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">
          Administración del Gran Agon.
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-1">
          Solo el administrador puede ver esta página.
        </p>
      </div>
      <AdminPanel />
    </div>
  )
}
