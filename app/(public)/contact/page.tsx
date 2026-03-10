import type { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Контакт | Гербера Подароци',
  description: 'Контактирајте не преку WhatsApp, Instagram или Facebook. Секогаш сме тука за вас.',
}

export default function ContactPage() {
  return <ContactPageClient />
}
