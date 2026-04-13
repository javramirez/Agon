import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AdminPanel } from '@/components/agon/admin-panel'
import { sleep } from '@/lib/utils/sleep'

export default async function AdminPage() {
  const __pageLoadT0 = Date.now()
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  if (userId !== process.env.CLERK_JAVIER_USER_ID) {
    redirect('/dashboard')
  }

  await sleep(Math.max(0, 3000 - (Date.now() - __pageLoadT0)))

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
