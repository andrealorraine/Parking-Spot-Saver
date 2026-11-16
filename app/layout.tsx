import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Barlow_Condensed, Inter } from 'next/font/google'
import { BottomNav } from '@/components/bottom-nav'
import { InstallHint } from '@/components/install-hint'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Parking Spot Saver',
  description: 'Save where you parked at the mall, track your parking time, and walk back to your car.',
  applicationName: 'Parking Spot Saver',
  appleWebApp: { capable: true, title: 'Park Saver', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e2e4e7' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2226' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable}`}>
      <body className="min-h-dvh antialiased">
        <div className="mx-auto flex min-h-dvh max-w-md flex-col pt-safe">
          <main className="flex-1 px-safe pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4">{children}</main>
        </div>
        <InstallHint />
        <BottomNav />
        <ServiceWorkerRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
