'use client'

import type { Product } from '@/lib/supabase/types'

interface ProductStatusBadgesProps {
  product: Product
}

export default function ProductStatusBadges({ product }: ProductStatusBadgesProps) {
  return (
    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
      {product.is_on_sale && (
        <span className="badge-sale">Попуст</span>
      )}
      {product.is_best_seller && (
        <span className="badge-bestseller">Топ</span>
      )}
      {product.status === 'sold' && (
        <span className="badge-status">Продадено</span>
      )}
    </div>
  )
}
