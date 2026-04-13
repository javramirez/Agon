import { LoadingAltis } from '@/components/agon/loading-altis'

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#080808]">
      <LoadingAltis size="lg" frase="La Balanza del Altis se ajusta..." />
    </div>
  )
}
