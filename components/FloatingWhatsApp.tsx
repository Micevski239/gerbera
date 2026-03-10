'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { WhatsAppIcon } from '@/components/icons'

export default function FloatingWhatsApp() {
  const { language, t } = useLanguage()
  const [showPulse, setShowPulse] = useState(true)

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''

  // Stop pulse animation after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  if (!whatsappNumber) return null

  const greeting = encodeURIComponent(t('cta.whatsapp_greeting'))
  const href = `https://wa.me/${whatsappNumber}?text=${greeting}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-30 flex items-center gap-3 focus-visible:outline-none"
      aria-label="Контактирај не на WhatsApp"
    >
      {/* Text bubble */}
      <span className="hidden sm:block bg-white text-ink-strong text-sm font-medium px-4 py-2 rounded-full shadow-md whitespace-nowrap">
        Дали сакаш да нарачаш?
      </span>

      {/* Green circle button */}
      <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1fba59] transition-colors duration-200">
        {showPulse && (
          <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-pulse-ring" />
        )}
        <WhatsAppIcon className="h-7 w-7" />
      </div>
    </a>
  )
}
