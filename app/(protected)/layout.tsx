import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getCurrentAgonista } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')
  if (!agonista.oraculoSellado) redirect('/onboarding')

  const isAdmin = userId === process.env.CLERK_JAVIER_USER_ID

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-28 sm:pb-10">
        {children}
      </main>
      <MobileNav isAdmin={Boolean(isAdmin)} />
    </div>
  )
}
