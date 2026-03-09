import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact | Gerbera Gifts',
  description: 'Get in touch with Gerbera Gifts via WhatsApp, Instagram, or Facebook. We are always here for you.',
}

export default function ContactPage() {
  return <ContactPageClient />
}
