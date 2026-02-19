'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import ProductCard from '@/components/ProductCard'
import type { Product, ProductImage, Category } from '@/lib/supabase/types'

interface ProductDetailClientProps {
  product: Product
  images: ProductImage[]
  category: Category | null
  relatedProducts: Product[]
}

export default function ProductDetailClient({
  product,
  images,
  category,
  relatedProducts,
}: ProductDetailClientProps) {
  const { language, t } = useLanguage()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const name = getLocalizedField(product, 'name', language)
  const description = getLocalizedField(product, 'description', language)
  const categoryName = category ? getLocalizedField(category, 'name', language) : ''

  // WhatsApp
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''
  const getWhatsAppLink = (message: string) => {
    if (!whatsappNumber) return '#'
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  }

  // Format price display
  const formatPrice = (price: number | null) => {
    if (!price) return null
    return new Intl.NumberFormat(language === 'mk' ? 'mk-MK' : 'en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const currentPrice = formatPrice(product.is_on_sale && product.sale_price ? product.sale_price : product.price)
  const originalPrice = product.is_on_sale && product.sale_price ? formatPrice(product.price) : null

  const selectedImage = images[selectedImageIndex]
  const selectedImageUrl = selectedImage
    ? getImageUrl(selectedImage.storage_path)
    : (product.image_url || null)

  // WhatsApp pre-filled messages
  const orderMessage = language === 'mk'
    ? `Здраво! Ме интересира ${name}${currentPrice ? ` (${currentPrice})` : ''}`
    : `Hi! I'm interested in ${name}${currentPrice ? ` (${currentPrice})` : ''}`
  const askMessage = language === 'mk'
    ? `Здраво! Имам прашање за ${name}`
    : `Hi! I have a question about ${name}`

  return (
    <div className="min-h-screen bg-canvas-100 text-ink-base">
      <main className="bg-canvas-100">
        <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <Link href="/" className="text-ink-muted hover:text-primary-500 transition-colors">
            {t('nav.home')}
          </Link>
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/products" className="text-ink-muted hover:text-primary-500 transition-colors">
            {t('nav.products')}
          </Link>
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-ink-strong font-medium truncate">{name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden bg-surface-base border border-border-soft rounded-lg">
              {selectedImageUrl ? (
                <Image
                  src={selectedImageUrl}
                  alt={selectedImage?.alt_text || name}
                  fill
                  className="object-cover img-warm"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Status badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
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
            </div>

            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {images.map((image, index) => {
                  const thumbUrl = getImageUrl(image.storage_path)
                  return (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all ${
                        index === selectedImageIndex
                          ? 'ring-2 ring-primary-500 ring-offset-2'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {thumbUrl && (
                        <Image
                          src={thumbUrl}
                          alt={image.alt_text || `${name} - ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:py-4">
            {/* Category */}
            {category && (
              <span className="inline-block px-2.5 py-1 text-xs font-medium uppercase tracking-wide bg-secondary-50 text-secondary-700 rounded mb-3">
                {categoryName}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-ink-strong mb-4">{name}</h1>

            {/* Price */}
            {(currentPrice || product.price_text) && (
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-bold text-primary-500">
                  {currentPrice || product.price_text}
                </span>
                {originalPrice && (
                  <span className="text-lg text-ink-muted line-through">
                    {originalPrice}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="mb-6">
                <p className="text-base text-ink-base whitespace-pre-wrap leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* Handmade callout */}
            <div className="flex items-center gap-2 mb-6 text-secondary-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">{t('product.handmade')}</span>
            </div>

            {/* WhatsApp CTA Section */}
            {whatsappNumber && product.status !== 'sold' && (
              <div className="space-y-3 mb-6">
                <a
                  href={getWhatsAppLink(orderMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full justify-center text-base py-3.5"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t('cta.whatsapp_order')}
                </a>
                <a
                  href={getWhatsAppLink(askMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline w-full justify-center text-base py-3.5"
                >
                  {t('cta.whatsapp_ask')}
                </a>
              </div>
            )}

            {/* Fallback CTA if no WhatsApp */}
            {!whatsappNumber && (
              <div className="bg-canvas-200 border border-border-soft rounded-lg p-5 mb-6">
                <h3 className="text-lg font-semibold text-ink-strong mb-2">{t('product.contactUs')}</h3>
                <p className="text-base text-ink-muted mb-4">
                  {language === 'mk'
                    ? 'Заинтересирани сте за овој производ? Контактирајте не за повеќе информации.'
                    : 'Interested in this product? Contact us for more information.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
                    <a
                      href={process.env.NEXT_PUBLIC_INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary w-full sm:w-auto"
                    >
                      {t('product.inquireOnInstagram')}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Back link */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-base text-ink-muted hover:text-primary-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('common.back')} {t('nav.products').toLowerCase()}
            </Link>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted mb-4 font-body">
              {t('product.moreFromCategory')}
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} variant="mini" />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
    </div>
  )
}
