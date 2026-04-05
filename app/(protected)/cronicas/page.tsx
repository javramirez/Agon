import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { cronicas } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { CronicaCard } from '@/components/agon/cronica-card'
import { EmptyState } from '@/components/agon/empty-state'

export const revalidate = 300

export default async function CronicasPage() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  const todas = await db
    .select()
    .from(cronicas)
    .orderBy(desc(cronicas.semana))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          Las Crónicas del Período
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">
          La memoria del Gran Agon.
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-1">
          Cada semana, el cronista del Altis inscribe lo que ocurrió. Para siempre.
        </p>
      </div>

      {todas.length === 0 ? (
        <EmptyState
          icono="📜"
          titulo="El cronista aún no ha escrito."
          descripcion="La primera Crónica del Período se generará al terminar la semana 1."
        />
      ) : (
        <div className="space-y-4">
          {todas.map((c) => (
            <CronicaCard key={c.id} cronica={c} />
          ))}
        </div>
      )}
    </div>
  )
}
