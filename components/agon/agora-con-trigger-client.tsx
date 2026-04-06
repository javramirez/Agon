'use client'

import dynamic from 'next/dynamic'
import type { AgoraEvento } from '@/lib/db/schema'

const AgoraConTrigger = dynamic(
  () => import('./agora-con-trigger').then((m) => m.AgoraConTrigger),
  { ssr: false }
)

type Props = {
  eventosIniciales: AgoraEvento[]
  aclamacionesHoy: number
  tiposPorEvento: Record<string, string>
}

/** Feed del Ágora solo en cliente — evita mismatch de hidratación con el feed interactivo. */
export function AgoraConTriggerClient(props: Props) {
  return <AgoraConTrigger {...props} />
}
