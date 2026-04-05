import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 p-6 animate-fade-in">
      <span className="text-6xl opacity-20">🏛️</span>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground tracking-widest uppercase font-body">
          El Altis habla
        </p>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Esta página no existe en el Gran Agon.
        </h1>
        <p className="text-sm text-muted-foreground font-body max-w-sm leading-relaxed">
          El Altis no ha inscrito lo que buscas. Quizás el agon te llevó por el
          camino equivocado.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="px-6 py-3 bg-amber text-black font-display font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber/90 transition-colors"
      >
        Volver al Agon
      </Link>
    </div>
  )
}
