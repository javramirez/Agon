import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getCurrentAgonista } from '@/lib/auth'
import { getMentor } from '@/lib/mentor/config'
import { MentorChat } from '@/components/agon/mentor-chat'
import { sleep } from '@/lib/utils/sleep'

export default async function MentorPage() {
  const __t0 = Date.now()
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  if (!agonista.mentorAsignado) redirect('/dashboard')

  const mentor = getMentor(agonista.mentorAsignado)
  if (!mentor) redirect('/dashboard')

  await sleep(Math.max(0, 4000 - (Date.now() - __t0)))

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs text-amber/70 tracking-widest uppercase font-body">El Mentor</p>
        <h1 className="font-display text-2xl font-bold">{mentor.nombre}</h1>
        <p className="text-sm text-muted-foreground font-body">{mentor.descripcion}</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface-1 p-4">
        <MentorChat mentorKey={agonista.mentorAsignado} />
      </div>

      <p className="text-center text-xs text-muted-foreground/40 font-body">
        El Mentor recuerda cada conversación. Habla con honestidad.
      </p>
    </div>
  )
}
