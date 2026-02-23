import type { Metadata } from 'next'
import { Playfair_Display, Nunito, Bad_Script } from 'next/font/google'
import { LanguageProvider } from '@/context/LanguageContext'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
})

const nunito = Nunito({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
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
  title: 'Gerbera Gifts - Personalized Gifts & Decorations',
  description:
    'Gerbera Gifts crafts personalized gifts, balloons, floral arrangements, wines, and decor that make every celebration memorable.',
  keywords: [
    'Gerbera Gifts',
    'personalized gifts',
    'custom balloons',
    'flower arrangements',
    'event decorations',
    'personalized wine',
  ],
  openGraph: {
    title: 'Gerbera Gifts - Personalized Gifts & Decorations',
    description:
      'Gerbera Gifts crafts personalized gifts, balloons, floral arrangements, wines, and decor that make every celebration memorable.',
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
      className={`${playfair.variable} ${nunito.variable} ${badScript.variable}`}
    >
      <body className="min-h-screen bg-canvas-100 text-ink-base font-body" suppressHydrationWarning>
        <LanguageProvider>
          {children}
          <FloatingWhatsApp />
        </LanguageProvider>
      </body>
    </html>
  )
}
