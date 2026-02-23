'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import ProductCard from '@/components/ProductCard'
import { SOCIAL } from '@/lib/social'
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
    return `${price.toFixed(0)} ден`
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

  // Image error state
  const [imageError, setImageError] = useState(false)

  // Keyboard navigation for gallery
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (images.length <= 1) return
    if (e.key === 'ArrowLeft') {
      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    } else if (e.key === 'ArrowRight') {
      setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }
  }, [images.length])

  // Touch/swipe support
  const touchStartX = useRef(0)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (images.length <= 1) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
      } else {
        setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
      }
    }
  }, [images.length])

  return (
    <div className="min-h-screen bg-canvas-100 text-ink-base">
      <main className="bg-canvas-100">
        <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-8 flex items-center gap-2 text-sm">
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
          {/* Image Gallery - sticky on desktop */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Main image */}
            <div
              className="relative aspect-square overflow-hidden bg-surface-base border border-border-soft rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              tabIndex={0}
              role="region"
              aria-label={images.length > 1 ? `Image gallery, ${selectedImageIndex + 1} of ${images.length}` : 'Product image'}
              onKeyDown={handleKeyDown}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {selectedImageUrl && !imageError ? (
                <Image
                  src={selectedImageUrl}
                  alt={selectedImage?.alt_text || name}
                  fill
                  className="object-cover img-warm"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  onError={() => setImageError(true)}
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
                      onClick={() => { setSelectedImageIndex(index); setImageError(false) }}
                      aria-label={`View image ${index + 1} of ${images.length}`}
                      aria-pressed={index === selectedImageIndex}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
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
          <div className="flex flex-col">
            {/* Top: category, title, price, description */}
            <div>
              {/* Category pill */}
              {category && (
                <span className="inline-block px-3 py-1 text-xs font-medium uppercase tracking-wider bg-secondary-50 text-secondary-700 rounded-full mb-3">
                  {categoryName}
                </span>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-heading font-semibold text-ink-strong mb-4">{name}</h1>

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
            </div>

            {/* Bottom section: trust badges, CTAs, social - aligned with image bottom */}
            <div className="lg:mt-auto">
            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="flex flex-col items-center text-center p-3 bg-canvas-200/60 rounded-xl">
                <svg className="w-5 h-5 text-secondary-600 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-[11px] text-ink-muted">{t('product.handmade')}</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-canvas-200/60 rounded-xl">
                <svg className="w-5 h-5 text-secondary-600 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span className="text-[11px] text-ink-muted">
                  {language === 'mk' ? 'Пакување за подарок' : 'Gift wrapping'}
                </span>
              </div>
              <div className="flex flex-col items-center text-center p-3 bg-canvas-200/60 rounded-xl">
                <svg className="w-5 h-5 text-secondary-600 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-[11px] text-ink-muted">
                  {language === 'mk' ? 'Брза достава' : 'Fast delivery'}
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-border-soft mb-6" />

            {/* WhatsApp CTA Section */}
            {whatsappNumber && product.status !== 'sold' && (
              <div className="space-y-3 mb-6">
                <a
                  href={getWhatsAppLink(orderMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp w-full justify-center text-base py-3.5 rounded-full"
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
                  className="btn-outline w-full justify-center text-base py-3.5 rounded-full"
                >
                  {t('cta.whatsapp_ask')}
                </a>
              </div>
            )}

            {/* Social links */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs text-ink-muted">{language === 'mk' ? 'Следете не:' : 'Follow us:'}</span>
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-canvas-200 hover:bg-ink-strong hover:text-white rounded-full flex items-center justify-center text-ink-muted transition-colors" aria-label="Instagram">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 bg-canvas-200 hover:bg-ink-strong hover:text-white rounded-full flex items-center justify-center text-ink-muted transition-colors" aria-label="Facebook">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 mb-8">
            {/* Section header */}
            <div className="text-center mb-8">
              <span className="text-xs font-medium uppercase tracking-wider text-secondary-600 font-body">
                {language === 'mk' ? 'Слични производи' : 'Related Products'}
              </span>
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-ink-strong mt-2">
                {t('product.moreFromCategory')}
              </h2>
              <div className="w-12 h-0.5 bg-primary-500 mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} variant="shop" />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
    </div>
  )
}
