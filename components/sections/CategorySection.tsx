'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { Category, Product } from '@/lib/supabase/types'

type BackgroundVariant = 'warm' | 'white' | 'green' | 'peach' | 'gray'

interface CategorySectionProps {
  category: Category
  products: Product[]
  backgroundVariant?: BackgroundVariant
}

const backgroundClasses: Record<BackgroundVariant, string> = {
  warm: 'bg-canvas-100',
  white: 'bg-white',
  green: 'bg-accent-fern-50',
  peach: 'bg-accent-coral-50',
  gray: 'bg-neutral-50',
}

export default function CategorySection({
  category,
  products,
  backgroundVariant = 'white'
}: CategorySectionProps) {
  const { language, t } = useLanguage()

  const categoryName = language === 'mk'
    ? category.name_mk || category.name
    : category.name_en || category.name

  const formatPrice = (price: number | null) => {
    if (!price) return null
    return new Intl.NumberFormat(language === 'mk' ? 'mk-MK' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const viewAllLabel = language === 'mk' ? 'Погледни сè' : 'View All'

  return (
    <section className={`border-b border-border-soft ${backgroundClasses[backgroundVariant]}`}>
      <div className="container-custom py-12 md:py-16">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h2 className="font-heading text-ds-section text-ink-strong">
              {categoryName}
            </h2>
          </div>
          <Link
            href={`/category/${category.slug}`}
            className="inline-flex items-center gap-2 text-ds-body font-medium text-accent-coral hover:text-accent-coral-600 transition-colors"
          >
            {viewAllLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => {
            const productName = language === 'mk'
              ? product.name_mk || product.name
              : product.name_en || product.name

            const currentPrice = formatPrice(
              product.is_on_sale && product.sale_price ? product.sale_price : product.price
            )
            const originalPrice = product.is_on_sale && product.sale_price
              ? formatPrice(product.price)
              : null

            return (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group flex flex-col rounded-xl border border-border-soft bg-surface-base shadow-soft overflow-hidden transition-all duration-300 hover:shadow-card hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-canvas-200">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={productName}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-ink-muted text-ds-body-sm">
                      No image
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex flex-col gap-2">
                    {product.is_on_sale && (
                      <span className="badge-sale text-xs">
                        {language === 'mk' ? 'Попуст' : 'Sale'}
                      </span>
                    )}
                    {product.is_best_seller && (
                      <span className="badge-bestseller text-xs">
                        {language === 'mk' ? 'Најпродавано' : 'Bestseller'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-heading text-ds-body-lg text-ink-strong line-clamp-2 transition-colors group-hover:text-accent-coral">
                    {productName}
                  </h3>

                  {currentPrice && (
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-ds-body font-semibold text-ink-strong">
                        {currentPrice}
                      </span>
                      {originalPrice && (
                        <span className="text-ds-body-sm text-ink-muted line-through">
                          {originalPrice}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ink-muted">
              {language === 'mk' ? 'Нема достапни производи.' : 'No products available.'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
