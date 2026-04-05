import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/sonner'
import { ToastAltis } from '@/components/agon/toast-agon'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agon — El Gran Agon',
  description: 'La excelencia no se declara. Se inscribe.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Agon',
  },
  openGraph: {
    title: 'Agon',
    description: 'La excelencia no se declara. Se inscribe.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#080808',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning className="dark h-full antialiased">
        <body className="min-h-full flex flex-col font-body">
          <Providers>
            {children}
            <Toaster />
            <ToastAltis />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
