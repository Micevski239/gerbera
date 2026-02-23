'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { HomepageSectionWithItems, ProductWithDetails, ProductGridConfig } from '@/lib/supabase/types'

interface ProductGridSectionProps {
  section: HomepageSectionWithItems
  products: ProductWithDetails[]
  whatsappNumber?: string
}

export default function ProductGridSection({ section, products, whatsappNumber }: ProductGridSectionProps) {
  const { language, t } = useLanguage()
  const config = section.config as ProductGridConfig

  const title = getLocalizedField(section, 'title', language)
  const subtitle = getLocalizedField(section, 'subtitle', language)

  const filteredProducts = filterProducts(products, config)
  const displayProducts = filteredProducts.slice(0, config.limit || 8)

  const getGridClass = () => {
    switch (section.layout_style) {
      case 'grid-2':
        return 'grid grid-cols-1 gap-6 sm:grid-cols-2'
      case 'grid-3':
        return 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
      case 'grid-5':
        return 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'
      case 'grid-6':
        return 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6'
      default:
        return 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'
    }
  }

  return (
    <section className="bg-canvas-50 py-12">
      <div className="section-shell space-y-8">
        {(title || subtitle) && (
          <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              {subtitle && <p className="eyebrow">{subtitle}</p>}
              {title && <h2 className="font-heading text-ds-section text-ink-strong">{title}</h2>}
            </div>
            {displayProducts.length > 0 && (
              <Link href="/products" className="btn-subtle">
                {t('common.viewAll')}
              </Link>
            )}
          </header>
        )}

        <div className={getGridClass()}>
          {displayProducts.map((product) => (
            <ProductGridCard
              key={product.id}
              product={product}
              showPrice={config.show_price !== false}
              showBadge={config.show_badge !== false}
              showInquiryButton={config.show_inquiry_button}
              whatsappNumber={whatsappNumber}
              shape={section.item_shape}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

interface ProductGridCardProps {
  product: ProductWithDetails
  showPrice: boolean
  showBadge: boolean
  showInquiryButton?: boolean
  whatsappNumber?: string
  shape: string
}

function ProductGridCard({
  product,
  showPrice,
  showBadge,
  showInquiryButton,
  whatsappNumber,
  shape,
}: ProductGridCardProps) {
  const { language, t } = useLanguage()
  const imageUrl = getImageUrl(product.primary_image_path)

  const name = getLocalizedField(product, 'name', language)
  const categoryName = getLocalizedField(product, 'category_name', language)

  const formatPrice = (price: number | null) => {
    if (!price) return null
    return new Intl.NumberFormat(language === 'mk' ? 'mk-MK' : 'en-US', {
      style: 'currency',
      currency: 'MKD',
    }).format(price)
  }

  const currentPrice = formatPrice(product.is_on_sale && product.sale_price ? product.sale_price : product.price)
  const originalPrice = product.is_on_sale && product.sale_price ? formatPrice(product.price) : null

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
    switch (shape) {
      case 'circle':
        return 'aspect-square rounded-full'
      case 'rectangle':
        return 'aspect-[3/4] rounded-lg'
      default:
        return 'aspect-[4/5] rounded-lg'
    }
  }

  return (
    <div className="space-y-3">
      <Link href={`/product/${product.id}`} className="group flex h-full flex-col rounded-2xl border border-border-soft bg-surface-base p-4 shadow-card transition-shadow hover:shadow-lift">
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
          <p className="text-ds-body-sm uppercase tracking-eyebrow text-ink-muted">{categoryName}</p>
          <h3 className="font-heading text-ds-body-lg text-ink-strong text-balance transition-colors group-hover:text-primary-500">
            {name}
          </h3>
          {showPrice && (currentPrice || product.price_text) && (
            <div className="flex items-baseline gap-2">
              <span className="text-ds-body text-ink-strong">
                {currentPrice || product.price_text}
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

function filterProducts(products: ProductWithDetails[], config: ProductGridConfig): ProductWithDetails[] {
  if (!config.filter) return products

  if (config.filter === 'best_seller') {
    return products.filter((p) => p.is_best_seller && p.is_visible && p.status === 'published')
  }

  if (config.filter === 'on_sale') {
    return products.filter((p) => p.is_on_sale && p.is_visible && p.status === 'published')
  }

  if (config.filter === 'new_arrival') {
    return [...products]
      .filter((p) => p.is_visible && p.status === 'published')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  if (config.filter === 'featured') {
    return products.filter((p) => (p.is_best_seller || p.is_on_sale) && p.is_visible && p.status === 'published')
  }

  if (config.filter.startsWith('category:')) {
    const categorySlug = config.filter.replace('category:', '')
    return products.filter((p) => p.category_slug === categorySlug && p.is_visible && p.status === 'published')
  }

  return products.filter((p) => p.is_visible && p.status === 'published')
}
