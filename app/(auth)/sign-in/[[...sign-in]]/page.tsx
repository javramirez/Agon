import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-background px-4">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2 tracking-widest">
          AGON
        </h1>
        <p className="text-muted-foreground text-sm font-body">
          La excelencia no se declara. Se inscribe.
        </p>
      </div>
      <SignIn />
    </div>
  )
}
