import { getCurrentAgonista } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { GaleriaInscripciones } from '@/components/agon/galeria-inscripciones'

export default async function InscripcionesPage() {
  const agonista = await getCurrentAgonista()
  if (!agonista) redirect('/sign-in')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body mb-1">
          Las Inscripciones
        </p>
        <h1 className="font-display text-2xl font-bold tracking-wide">
          Grabadas en tu temple.
        </h1>
        <p className="text-xs text-muted-foreground font-body mt-1">
          En la antigüedad, las hazañas del agon quedaban inscritas en piedra en
          el Altis de Olimpia. Las tuyas también.
        </p>
      </div>

      <GaleriaInscripciones nivel={agonista.nivel} />
    </div>
  )
}
