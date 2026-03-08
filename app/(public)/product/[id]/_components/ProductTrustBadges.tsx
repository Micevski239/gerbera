'use client'

import { GiftIcon, HeartOutlineIcon, LightningIcon } from './ProductDetailIcons'

interface ProductTrustBadgesProps {
  language: 'mk' | 'en'
  handmadeLabel: string
}

export default function ProductTrustBadges({
  language,
  handmadeLabel,
}: ProductTrustBadgesProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="flex flex-col items-center text-center p-3 bg-canvas-200/60 rounded-xl">
        <HeartOutlineIcon className="w-5 h-5 text-secondary-600 mb-1.5" />
        <span className="text-[11px] text-ink-muted">{handmadeLabel}</span>
      </div>

      <div className="flex flex-col items-center text-center p-3 bg-canvas-200/60 rounded-xl">
        <GiftIcon className="w-5 h-5 text-secondary-600 mb-1.5" />
        <span className="text-[11px] text-ink-muted">
          {language === 'mk' ? 'Пакување за подарок' : 'Gift wrapping'}
        </span>
      </div>

      <div className="flex flex-col items-center text-center p-3 bg-canvas-200/60 rounded-xl">
        <LightningIcon className="w-5 h-5 text-secondary-600 mb-1.5" />
        <span className="text-[11px] text-ink-muted">
          {language === 'mk' ? 'Брза достава' : 'Fast delivery'}
        </span>
      </div>
    </div>
  )
}
