'use client'

import { WhatsAppIcon, InstagramIcon, FacebookIcon } from './ProductDetailIcons'

interface ProductOrderChannelsProps {
  language: 'mk' | 'en'
  whatsappUrl: string
  instagramUrl: string
  facebookUrl: string
}

export default function ProductOrderChannels({
  language,
  whatsappUrl,
  instagramUrl,
  facebookUrl,
}: ProductOrderChannelsProps) {
  const mk = language === 'mk'

  return (
    <div className="mb-6">
      <p className="text-xs text-ink-muted uppercase tracking-wider font-medium mb-3">
        {mk ? 'Нарачај преку' : 'Order via'}
      </p>

      <div className="grid grid-cols-3 gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-center p-3 bg-[#25D366]/10 rounded-xl hover:bg-[#25D366]/20 transition-colors"
        >
          <WhatsAppIcon className="w-5 h-5 text-[#25D366] mb-1.5" />
          <span className="text-[11px] text-[#25D366]">WhatsApp</span>
        </a>

        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-center p-3 bg-pink-500/10 rounded-xl hover:bg-pink-500/20 transition-colors"
        >
          <InstagramIcon className="w-5 h-5 text-pink-500 mb-1.5" />
          <span className="text-[11px] text-pink-500">Instagram</span>
        </a>

        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-center p-3 bg-[#1877F2]/10 rounded-xl hover:bg-[#1877F2]/20 transition-colors"
        >
          <FacebookIcon className="w-5 h-5 text-[#1877F2] mb-1.5" />
          <span className="text-[11px] text-[#1877F2]">Facebook</span>
        </a>
      </div>
    </div>
  )
}
