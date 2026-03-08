'use client'

import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/supabase/types'

interface ProductRelatedSectionProps {
  relatedProducts: Product[]
  language: 'mk' | 'en'
  title: string
}

export default function ProductRelatedSection({
  relatedProducts,
  language,
  title,
}: ProductRelatedSectionProps) {
  if (relatedProducts.length === 0) return null

  return (
    <section className="mt-16 mb-8">
      <div className="text-center mb-8">
        <span className="text-xs font-medium uppercase tracking-wider text-secondary-600 font-body">
          {language === 'mk' ? 'Слични производи' : 'Related Products'}
        </span>
        <h2 className="text-2xl md:text-3xl font-heading font-semibold text-ink-strong mt-2">
          {title}
        </h2>
        <div className="w-12 h-0.5 bg-primary-500 mx-auto mt-3" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        {relatedProducts.map((relatedProduct) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} variant="shop" />
        ))}
      </div>
    </section>
  )
}
