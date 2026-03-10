'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { getThumbnailUrl } from '@/lib/utils'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import { HeartIcon, ImagePlaceholderIcon } from '@/components/icons'
import type { ProductWithDetails, Product } from '@/lib/supabase/types'

type ProductType = ProductWithDetails | Product

// Tiny 1x1 neutral blur placeholder for remote images
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVjZTgiLz48L3N2Zz4='

interface ProductCardProps {
  product: ProductType
  variant?: 'default' | 'shop'
  showPrice?: boolean
  showBadge?: boolean
}

function isProductWithDetails(product: ProductType): product is ProductWithDetails {
  return 'primary_image_path' in product
}

export default function ProductCard({
  product,
  variant = 'default',
  showPrice = true,
  showBadge = true,
}: ProductCardProps) {
  const { language, t } = useLanguage()

  const imageUrl = isProductWithDetails(product)
    ? getImageUrl(product.primary_image_path)
    : product.image_url

  const thumbUrl = imageUrl ? getThumbnailUrl(imageUrl) : null

  const name = isProductWithDetails(product)
    ? getLocalizedField(product, 'name')
    : product.name_mk || product.name_en || product.name

  const categoryName = isProductWithDetails(product)
    ? getLocalizedField(product, 'category_name')
    : null

  const formatPrice = (price: number | null) => {
    if (!price) return null
    return `${price.toFixed(0)} ден`
  }

  const currentPrice = formatPrice(product.is_on_sale && product.sale_price ? product.sale_price : product.price)
  const originalPrice = product.is_on_sale && product.sale_price ? formatPrice(product.price) : null
  const priceText = isProductWithDetails(product) ? product.price_text : null

  // Shop variant — grid card used on shop, homepage, related products
  if (variant === 'shop') {
    const hasSale = product.is_on_sale && product.sale_price && product.price
    const discountPercent = hasSale
      ? Math.round(((product.price! - product.sale_price!) / product.price!) * 100)
      : 0

    return (
      <Link
        href={`/product/${product.id}`}
        className="group block"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-100 rounded-2xl mb-3">
          {imageUrl ? (
            <Image
              src={thumbUrl || imageUrl}
              alt={name}
              fill
              className="object-cover img-warm transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100">
              <ImagePlaceholderIcon className="w-16 h-16 text-neutral-300" />
            </div>
          )}

          {showBadge && hasSale && discountPercent > 0 && (
            <span className="absolute top-3 left-3 bg-primary-400 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
              {discountPercent}% OFF
            </span>
          )}

          <span className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity">
            <HeartIcon />
          </span>
        </div>

        <div className="flex items-start justify-between gap-2 px-1">
          <div className="min-w-0">
            <h3 className="font-body text-sm text-ink-base font-normal line-clamp-1 group-hover:text-ink-strong transition-colors">
              {name}
            </h3>
            {showPrice && (
              <div className="flex items-center gap-2 mt-1">
                {hasSale ? (
                  <>
                    <span className="text-sm text-ink-muted line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm font-semibold text-ink-strong">
                      {formatPrice(product.sale_price)}
                    </span>
                  </>
                ) : currentPrice ? (
                  <span className="text-sm font-semibold text-ink-strong">
                    {currentPrice}
                  </span>
                ) : priceText ? (
                  <span className="text-sm text-ink-muted">
                    {priceText}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          <span className="flex-shrink-0 mt-0.5 text-ink-muted md:hidden">
            <HeartIcon />
          </span>
        </div>
      </Link>
    )
  }

  // Default variant — card with border and category label
  return (
    <Link href={`/product/${product.id}`} className="product-card-shell group overflow-hidden">
      <div className="relative overflow-hidden bg-canvas-200 aspect-[4/5] rounded-lg">
        {imageUrl ? (
          <Image
            src={thumbUrl || imageUrl}
            alt={name}
            fill
            className="object-cover img-warm transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-muted">No image</div>
        )}
        <div className="absolute inset-0 bg-ink-strong/0 transition-colors duration-500 group-hover:bg-ink-strong/5" />
        {showBadge && (
          <div className="absolute left-4 top-4 flex flex-col gap-2">
            {product.is_on_sale && <span className="badge-sale">{t('product.onSale')}</span>}
            {product.is_best_seller && <span className="badge-bestseller">{t('product.bestSeller')}</span>}
            {product.status === 'sold' && <span className="badge-status">{t('product.sold')}</span>}
          </div>
        )}
      </div>

      <div className="px-4 pb-5 pt-4 text-center">
        {categoryName && <p className="text-ds-body-sm uppercase tracking-eyebrow text-ink-muted">{categoryName}</p>}
        <h3 className="mt-2 font-heading text-ds-section text-ink-strong text-balance transition-colors group-hover:text-primary-700">
          {name}
        </h3>
        {showPrice && (currentPrice || priceText) && (
          <div className="mt-3 flex items-center gap-2 justify-center">
            <span className="text-ds-body text-primary-500 font-semibold">
              {currentPrice || priceText}
            </span>
            {originalPrice && <span className="text-ds-body-sm text-ink-muted line-through">{originalPrice}</span>}
          </div>
        )}
      </div>
    </Link>
  )
}
