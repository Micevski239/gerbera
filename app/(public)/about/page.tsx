import type { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'За нас | Гербера Подароци',
  description: 'Дознајте повеќе за Гербера Подароци — рачно изработени персонализирани подароци направени со љубов во Македонија.',
}

export default function AboutPage() {
  return <AboutPageClient />
}
