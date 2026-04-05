import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Agon — El Gran Agon',
    short_name: 'Agon',
    description: 'La excelencia no se declara. Se inscribe.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#080808',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
