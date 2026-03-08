'use client'

import type { Product } from '@/lib/supabase/types'

interface ProductStatusBadgesProps {
  product: Product
  language: 'mk' | 'en'
}

export default function ProductStatusBadges({ product, language }: ProductStatusBadgesProps) {
  return (
    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
      {product.is_on_sale && (
        <span className="badge-sale">
          {language === 'mk' ? 'Попуст' : 'Sale'}
        </span>
      )}
      {product.is_best_seller && (
        <span className="badge-bestseller">
          {language === 'mk' ? 'Топ' : 'Best'}
        </span>
      )}
      {product.status === 'sold' && (
        <span className="badge-status">
          {language === 'mk' ? 'Продадено' : 'Sold'}
        </span>
      )}
    </div>
  )
}
