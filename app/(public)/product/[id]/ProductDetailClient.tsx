'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ProductCard from '@/components/ProductCard'
import type { Product, ProductImage, Category } from '@/lib/supabase/types'

const navLinks = [
  { label: { mk: 'Дома', en: 'Home' }, href: '/' },
  { label: { mk: 'Продавница', en: 'Shop' }, href: '/products' },
  { label: { mk: 'За нас', en: 'About Us' }, href: '/about' },
  { label: { mk: 'Контакт', en: 'Contact' }, href: '/contact' },
]

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

  // Contact info
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+389 70 123 456'
  const dialablePhone = contactPhone.replace(/[^+\d]/g, '')
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com'
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com'

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
  // Use product_images if available, otherwise fall back to product.image_url
  const selectedImageUrl = selectedImage
    ? getImageUrl(selectedImage.storage_path)
    : (product.image_url || null)

  return (
    <div className="min-h-screen bg-white text-neutral-600">
      {/* Header */}
      <header>
        <div className="container-custom py-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Link href="/" className="text-ink-strong font-heading">
              <span className="block text-3xl tracking-[0.25em] uppercase text-accent-burgundy-600">
                Gerbera
              </span>
              <span className="block text-ds-eyebrow uppercase tracking-[0.4em] text-accent-burgundy-500 font-medium">
                A moment of love
              </span>
            </Link>

            <nav className="flex flex-wrap items-center justify-center gap-1 text-ds-body-sm font-semibold uppercase tracking-wide text-neutral-700">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2 rounded hover:text-accent-burgundy-500"
                >
                  {language === 'mk' ? link.label.mk : link.label.en}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <a
                href={`tel:${dialablePhone}`}
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 hover:text-accent-burgundy-500 hover:bg-accent-burgundy-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2"
                aria-label={language === 'mk' ? 'Јави ни се' : 'Call us'}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6.5c0 8.008 6.492 14.5 14.5 14.5h1.5a2 2 0 002-2v-3a1 1 0 00-.883-.993l-3.017-.335a1 1 0 00-.96.524l-.9 1.68a.75.75 0 01-1.043.3 12.06 12.06 0 01-5.696-5.696.75.75 0 01.3-1.043l1.68-.9a1 1 0 00.524-.96l-.335-3.017A1 1 0 009.5 4H6.5a2 2 0 00-2 2v.5z" />
                </svg>
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 hover:text-accent-burgundy-500 hover:bg-accent-burgundy-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12.07C22 6.486 17.523 2 11.938 2 6.353 2 1.875 6.486 1.875 12.07c0 4.99 3.657 9.129 8.437 9.879v-6.988H7.898v-2.89h2.414V9.845c0-2.39 1.425-3.713 3.61-3.713 1.045 0 2.14.187 2.14.187v2.353h-1.206c-1.19 0-1.562.74-1.562 1.497v1.797h2.656l-.425 2.89h-2.231v6.988c4.78-.75 8.437-4.89 8.437-9.878z" />
                </svg>
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 hover:text-accent-burgundy-500 hover:bg-accent-burgundy-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="bg-neutral-50">
        <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm">
          <Link href="/" className="text-neutral-500 hover:text-primary-600 transition-colors">
            {t('nav.home')}
          </Link>
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/products" className="text-neutral-500 hover:text-primary-600 transition-colors">
            {t('nav.products')}
          </Link>
          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-neutral-800 font-medium truncate">{name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden bg-white border border-neutral-200">
              {selectedImageUrl ? (
                <Image
                  src={selectedImageUrl}
                  alt={selectedImage?.alt_text || name}
                  fill
                  className="object-cover"
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
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500 text-white rounded">
                    {language === 'mk' ? 'Попуст' : 'Sale'}
                  </span>
                )}
                {product.is_best_seller && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500 text-white rounded">
                    {language === 'mk' ? 'Топ' : 'Best'}
                  </span>
                )}
                {product.status === 'sold' && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-500 text-white rounded">
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
              <span className="inline-block px-2.5 py-1 text-xs font-medium uppercase tracking-wide bg-accent-burgundy-50 text-accent-burgundy-600 rounded mb-3">
                {categoryName}
              </span>
            )}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-neutral-800 mb-4">{name}</h1>

            {/* Price */}
            {(currentPrice || product.price_text) && (
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-bold text-accent-burgundy-600">
                  {currentPrice || product.price_text}
                </span>
                {originalPrice && (
                  <span className="text-lg text-neutral-400 line-through">
                    {originalPrice}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="mb-6">
                <p className="text-base text-neutral-600 whitespace-pre-wrap leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            {/* CTA Section */}
            <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">{t('product.contactUs')}</h3>
              <p className="text-base text-neutral-500 mb-4">
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
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-medium bg-accent-burgundy-600 text-white rounded-lg hover:bg-accent-burgundy-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    {t('product.inquireOnInstagram')}
                  </a>
                )}
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
                  <a
                    href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}?subject=${encodeURIComponent(name)}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-base font-medium border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {t('contact.sendMessage')}
                  </a>
                )}
              </div>
            </div>

            {/* Back link */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-base text-neutral-500 hover:text-accent-burgundy-600 transition-colors"
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
            <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500 mb-4">
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
