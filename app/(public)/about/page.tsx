import type { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'About Us | Gerbera Gifts',
  description: 'Learn about Gerbera Gifts — handmade personalized gifts crafted with love in North Macedonia.',
}

export default function AboutPage() {
  return <AboutPageClient />
}
