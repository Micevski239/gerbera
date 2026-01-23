'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { ProductWithDetails, Product } from '@/lib/supabase/types'

type ProductType = ProductWithDetails | Product

interface ProductCardProps {
  product: ProductType
  variant?: 'default' | 'compact' | 'horizontal' | 'showcase' | 'shop' | 'mini'
  imageShape?: 'square' | 'portrait' | 'circle'
  alignment?: 'center' | 'left'
  showPrice?: boolean
  showBadge?: boolean
  showInquiryButton?: boolean
  whatsappNumber?: string
}

function isProductWithDetails(product: ProductType): product is ProductWithDetails {
  return 'primary_image_path' in product
}

export default function ProductCard({
  product,
  variant = 'default',
  imageShape = 'portrait',
  alignment = 'center',
  showPrice = true,
  showBadge = true,
  showInquiryButton = false,
  whatsappNumber,
}: ProductCardProps) {
  const { language, t } = useLanguage()

  const imageUrl = isProductWithDetails(product)
    ? getImageUrl(product.primary_image_path)
    : product.image_url

  const name = isProductWithDetails(product)
    ? getLocalizedField(product, 'name', language)
    : language === 'mk'
      ? product.name_mk || product.name_en || product.name
      : product.name_en || product.name_mk || product.name

  const categoryName = isProductWithDetails(product)
    ? getLocalizedField(product, 'category_name', language)
    : null

  const formatPrice = (price: number | null) => {
    if (!price) return null
    return new Intl.NumberFormat(language === 'mk' ? 'mk-MK' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const currentPrice = formatPrice(product.is_on_sale && product.sale_price ? product.sale_price : product.price)
  const originalPrice = product.is_on_sale && product.sale_price ? formatPrice(product.price) : null
  const priceText = isProductWithDetails(product) ? product.price_text : null

  const getWhatsAppLink = () => {
    if (!whatsappNumber) return '#'
    const message = encodeURIComponent(
      language === 'mk'
        ? `Здраво, ме интересира производот: ${name}`
        : `Hi, I'm interested in: ${name}`
    )
    return `https://wa.me/${whatsappNumber}?text=${message}`
  }

  const getImageAspectClass = () => {
    switch (imageShape) {
      case 'circle':
        return 'aspect-square rounded-full'
      case 'square':
        return 'aspect-square rounded-lg'
      default:
        return 'aspect-[4/5] rounded-lg'
    }
  }

  const getAlignmentClass = () => {
    return alignment === 'left' ? 'text-left' : 'text-center'
  }

  const getPriceAlignmentClass = () => {
    return alignment === 'left' ? 'justify-start' : 'justify-center'
  }

  // Showcase variant - for product highlights section
  if (variant === 'showcase') {
    const hasSale = !!originalPrice && !!currentPrice && originalPrice !== currentPrice
    const discountPercent = product.is_on_sale && product.price && product.sale_price
      ? Math.max(5, Math.min(40, Math.round((product.price - product.sale_price) / product.price * 100)))
      : 0

    return (
      <div className="flex flex-col rounded-2xl border border-accent-coral-100 bg-surface-base shadow-feature p-5 gap-4">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-canvas-200">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 240px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-muted text-ds-body-sm">
              No image
            </div>
          )}
          {showBadge && hasSale && (
            <span className="absolute top-3 left-3 badge-coral shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>
        <div className="space-y-2">
          <Link href={`/product/${product.id}`} className="font-semibold text-ds-body-sm text-ink-strong line-clamp-2 hover:text-accent-coral transition-colors">
            {name}
          </Link>
          <div className="flex items-center gap-1 text-accent-marigold text-ds-body-sm">
            {Array.from({ length: 5 }).map((_, idx) => (
              <span key={idx}>★</span>
            ))}
          </div>
          {showPrice && (
            <div className="flex items-baseline gap-3">
              {hasSale ? (
                <>
                  <span className="text-ds-body font-semibold text-ink-strong">{currentPrice}</span>
                  <span className="text-ds-body-sm text-ink-muted line-through">{originalPrice}</span>
                </>
              ) : currentPrice ? (
                <span className="text-ds-body font-semibold text-ink-strong">{currentPrice}</span>
              ) : null}
            </div>
          )}
        </div>
        <Link
          href={`/product/${product.id}`}
          className="mt-auto btn-secondary text-ds-body-sm"
        >
          {language === 'mk' ? 'Додај во кошничка' : 'Add to Cart'}
        </Link>
      </div>
    )
  }

  // Shop variant - clean, centered design for shop grid
  if (variant === 'shop') {
    const hasSale = product.is_on_sale && product.sale_price && product.price

    return (
      <Link
        href={`/product/${product.id}`}
        className="group block bg-white"
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-neutral-50 border border-neutral-200 rounded-sm mb-4">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-50">
              <svg className="w-16 h-16 text-neutral-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          {showBadge && (product.is_on_sale || product.is_best_seller) && (
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              {product.is_on_sale && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded">
                  {language === 'mk' ? 'Попуст' : 'Sale'}
                </span>
              )}
              {product.is_best_seller && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500 text-white rounded">
                  {language === 'mk' ? 'Топ' : 'Best'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content - Centered */}
        <div className="text-center px-2">
          {/* Product Name */}
          <h3 className="font-medium text-neutral-700 line-clamp-2 mb-2 group-hover:text-accent-burgundy-600 transition-colors text-sm md:text-base">
            {name}
          </h3>

          {/* Price */}
          {showPrice && (
            <div className="flex items-center justify-center gap-2">
              {hasSale ? (
                <>
                  <span className="text-base font-semibold text-accent-burgundy-500">
                    {formatPrice(product.sale_price)}
                  </span>
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : currentPrice ? (
                <span className="text-base font-semibold text-accent-burgundy-500">
                  {currentPrice}
                </span>
              ) : priceText ? (
                <span className="text-sm text-neutral-500">
                  {priceText}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </Link>
    )
  }

  // Mini variant - tiny cards for related products
  if (variant === 'mini') {
    return (
      <Link
        href={`/product/${product.id}`}
        className="group block"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-50 border border-neutral-200 rounded mb-2">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="120px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-50">
              <svg className="w-6 h-6 text-neutral-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <p className="text-xs text-neutral-600 text-center line-clamp-2 group-hover:text-accent-burgundy-600 transition-colors">
          {name}
        </p>
      </Link>
    )
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <Link href={`/product/${product.id}`} className="product-card-shell group flex-row overflow-hidden">
        <div className="relative h-full w-32 flex-shrink-0 overflow-hidden rounded-lg bg-canvas-200 sm:w-40">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="160px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-muted">No image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-strong/10 to-transparent" />
          {showBadge && (
            <div className="absolute left-3 top-3 flex flex-col gap-1">
              {product.is_on_sale && <span className="badge-sale">{t('product.onSale')}</span>}
              {product.is_best_seller && <span className="badge-bestseller">{t('product.bestSeller')}</span>}
              {product.status === 'sold' && <span className="badge-status">{t('product.sold')}</span>}
            </div>
          )}
        </div>
        <div className="flex-1 px-4 py-4">
          {categoryName && <p className="text-ds-body-sm uppercase tracking-eyebrow text-ink-muted">{categoryName}</p>}
          <h3 className="mt-2 font-heading text-ds-body-lg text-ink-strong transition-colors group-hover:text-accent-coral">
            {name}
          </h3>
          {showPrice && (currentPrice || priceText) && (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-ds-body text-ink-strong">
                {currentPrice || priceText}
              </span>
              {originalPrice && <span className="text-ds-body-sm text-ink-muted line-through">{originalPrice}</span>}
            </div>
          )}
        </div>
      </Link>
    )
  }

  // Compact variant - for grid sections with more options
  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        <Link href={`/product/${product.id}`} className="group flex h-full flex-col rounded-xl border border-border-soft bg-surface-base p-4 shadow-card transition-shadow hover:shadow-lift">
          <div className={`relative overflow-hidden bg-canvas-200 ${getImageAspectClass()}`}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

          <div className="mt-4 space-y-2 text-left">
            {categoryName && <p className="text-ds-body-sm uppercase tracking-eyebrow text-ink-muted">{categoryName}</p>}
            <h3 className="font-heading text-ds-body-lg text-ink-strong text-balance transition-colors group-hover:text-accent-coral">
              {name}
            </h3>
            {showPrice && (currentPrice || priceText) && (
              <div className="flex items-baseline gap-2">
                <span className="text-ds-body text-ink-strong">
                  {currentPrice || priceText}
                </span>
                {originalPrice && <span className="text-ds-body-sm text-ink-muted line-through">{originalPrice}</span>}
              </div>
            )}
          </div>
        </Link>

        {showInquiryButton && whatsappNumber && product.status !== 'sold' && (
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {language === 'mk' ? 'Побарај' : 'Inquire'}
          </a>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <Link href={`/product/${product.id}`} className="product-card-shell group overflow-hidden">
      <div className={`relative overflow-hidden bg-canvas-200 ${getImageAspectClass()}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

      <div className={`px-4 pb-5 pt-4 ${getAlignmentClass()}`}>
        {categoryName && <p className="text-ds-body-sm uppercase tracking-eyebrow text-ink-muted">{categoryName}</p>}
        <h3 className="mt-2 font-heading text-ds-section text-ink-strong text-balance transition-colors group-hover:text-accent-coral">
          {name}
        </h3>
        {showPrice && (currentPrice || priceText) && (
          <div className={`mt-3 flex items-center gap-2 ${getPriceAlignmentClass()}`}>
            <span className="text-ds-body text-ink-strong">
              {currentPrice || priceText}
            </span>
            {originalPrice && <span className="text-ds-body-sm text-ink-muted line-through">{originalPrice}</span>}
          </div>
        )}
      </div>
    </Link>
  )
}
