export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <p className="text-muted-foreground text-sm tracking-widest uppercase mb-4 font-body">
        El Altis habla
      </p>
      <h1 className="font-display text-3xl font-bold mb-3">
        No eres un agonista del Gran Agon.
      </h1>
      <p className="text-muted-foreground text-sm max-w-sm font-body">
        Este agon es entre dos. El Altis no reconoce tu kleos.
      </p>
    </div>
  )
}
