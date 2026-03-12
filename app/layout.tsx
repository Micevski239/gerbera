import type { Metadata } from 'next'
import { Nunito, Bad_Script } from 'next/font/google'
import { LanguageProvider } from '@/context/LanguageContext'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import SplashScreen from '@/components/SplashScreen'
import PageViewTracker from '@/components/PageViewTracker'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-nunito',
  display: 'swap',
})

const badScript = Bad_Script({
  subsets: ['latin', 'cyrillic'],
  weight: '400',
  variable: '--font-handwriting',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Gerbera - Моменти на љубов',
  description:
    'Гербера Подароци изработува персонализирани подароци, балони, цветни аранжмани, вина и декорации за секоја незаборавна прослава.',
  keywords: [
    'Гербера Подароци',
    'персонализирани подароци',
    'балони',
    'цветни аранжмани',
    'декорации',
    'персонализирано вино',
    'подароци Македонија',
  ],
  openGraph: {
    title: 'Gerbera - Моменти на љубов',
    description:
      'Гербера Подароци изработува персонализирани подароци, балони, цветни аранжмани, вина и декорации за секоја незаборавна прослава.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="mk"
      suppressHydrationWarning
      className={`${nunito.variable} ${badScript.variable}`}
    >
      <body className="min-h-screen bg-canvas-100 text-ink-base font-body" suppressHydrationWarning>
        <LanguageProvider>
          <SplashScreen />
          {children}
          <PageViewTracker />
          <Analytics />
          <FloatingWhatsApp />
        </LanguageProvider>
      </body>
    </html>
  )
}
