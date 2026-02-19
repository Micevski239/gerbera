'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import HeroBentoGrid from '@/components/HeroBentoGrid'
import OccasionShowcase from '@/components/sections/OccasionShowcase'
import TestimonialsShowcase from '@/components/sections/TestimonialsShowcase'
import ProductCard from '@/components/ProductCard'
import type { Category, Product, Occasion, SiteStat, HeroTile } from '@/lib/supabase/types'

interface HomePageClientProps {
  categories: Category[]
  occasions: Occasion[]
  stats: SiteStat[]
  heroTiles?: HeroTile[]
  productHighlights?: {
    latest: Product[]
    popular: Product[]
    best: Product[]
  }
}

export default function HomePageClient({
  categories,
  occasions,
  stats,
  heroTiles,
  productHighlights
}: HomePageClientProps) {
  const { language, t } = useLanguage()

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''

  const getWhatsAppLink = (message?: string) => {
    if (!whatsappNumber) return '#'
    const text = encodeURIComponent(message || t('cta.whatsapp_greeting'))
    return `https://wa.me/${whatsappNumber}?text=${text}`
  }

  return (
    <div className="bg-canvas-100 text-ink-base">
      {/* Hero Bento Grid */}
      <HeroBentoGrid heroTiles={heroTiles} categories={categories} language={language} />

      {/* Shop by Occasion */}
      <OccasionShowcase language={language} occasions={occasions} />

      {/* Info Banner — Craft Story */}
      <section className="bg-softPink">
        <div className="split-banner">
          {/* Left — Image */}
          <div className="relative h-64 md:h-[480px] overflow-hidden">
            <Image
              src="/images/gerbera.jpg"
              alt={t('home.craftStoryTitle')}
              fill
              className="object-cover img-warm"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {/* Right — Text */}
          <div className="flex flex-col justify-center px-8 py-10 md:px-16 md:py-20">
            <p className="eyebrow font-body mb-2">
              Gerbera Gifts
            </p>
            <h2 className="font-heading text-2xl md:text-3xl text-ink-strong mb-4 leading-tight">
              {t('home.craftStoryTitle')}
            </h2>
            <p className="text-ink-base text-base leading-relaxed mb-8 max-w-md">
              {t('home.craftStoryText')}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center bg-ink-strong text-white font-medium px-8 py-3 rounded-full hover:bg-neutral-800 transition-colors w-fit text-sm"
            >
              {t('home.shopNow')}
            </Link>
          </div>
        </div>
      </section>

      {/* New Collection */}
      <NewCollectionSection
        productHighlights={productHighlights}
        language={language}
        t={t}
      />

      {/* Service Features */}
      <section className="bg-white">
        <div className="container-custom py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="service-box bg-pastel-peach">
              <div className="w-12 h-12 mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-ink-strong" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-heading text-base md:text-lg text-ink-strong mb-1">
                {t('home.serviceHandmade')}
              </h3>
              <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
                {t('home.serviceHandmadeDesc')}
              </p>
            </div>

            <div className="service-box bg-pastel-lime">
              <div className="w-12 h-12 mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-ink-strong" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-heading text-base md:text-lg text-ink-strong mb-1">
                {t('home.serviceWhatsapp')}
              </h3>
              <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
                {t('home.serviceWhatsappDesc')}
              </p>
            </div>

            <div className="service-box bg-pastel-pink">
              <div className="w-12 h-12 mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-ink-strong" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="font-heading text-base md:text-lg text-ink-strong mb-1">
                {t('home.serviceGiftWrap')}
              </h3>
              <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
                {t('home.serviceGiftWrapDesc')}
              </p>
            </div>

            <div className="service-box bg-pastel-blue">
              <div className="w-12 h-12 mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-ink-strong" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              <h3 className="font-heading text-base md:text-lg text-ink-strong mb-1">
                {t('home.serviceDelivery')}
              </h3>
              <p className="text-xs md:text-sm text-ink-muted leading-relaxed">
                {t('home.serviceDeliveryDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsShowcase language={language} />

      {/* WhatsApp CTA Banner */}
      <section className="bg-ink-strong">
        <div className="container-custom py-14 md:py-16 text-center">
          <p className="text-white/60 text-sm uppercase tracking-widest font-body font-medium mb-3">
            Gerbera Gifts
          </p>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
            {t('home.ctaHeading')}
          </h2>
          <p className="text-white/70 text-base mb-8 max-w-lg mx-auto">
            {t('home.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {whatsappNumber ? (
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1fba59] transition-colors w-full sm:w-auto"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('cta.whatsapp_order')}
              </a>
            ) : (
              <Link
                href="/products"
                className="inline-flex items-center justify-center bg-white text-ink-strong font-semibold px-6 py-3 rounded-full hover:bg-neutral-100 transition-colors w-full sm:w-auto"
              >
                {t('home.ctaBrowse')}
              </Link>
            )}
            <Link
              href="/products"
              className="inline-flex items-center justify-center border-2 border-white text-white font-semibold px-6 py-3 rounded-full hover:bg-white/10 transition-colors w-full sm:w-auto"
            >
              {t('home.ctaBrowse')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function NewCollectionSection({
  productHighlights,
  language,
  t,
}: {
  productHighlights?: HomePageClientProps['productHighlights']
  language: 'mk' | 'en'
  t: (key: string) => string
}) {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular' | 'best'>('popular')
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!productHighlights) return null

  const tabs = [
    { key: 'latest' as const, label: t('home.tabNew') },
    { key: 'popular' as const, label: t('home.tabPopular') },
    { key: 'best' as const, label: t('home.tabBestSellers') },
  ]

  const products = productHighlights[activeTab] || []

  if (products.length === 0 && productHighlights.popular.length === 0) return null

  return (
    <section className="bg-canvas-100">
      <div className="container-custom py-12 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="eyebrow font-body mb-1">
              {t('home.newCollection')}
            </p>
            <h2 className="font-heading text-ds-section text-ink-strong">
              {language === 'mk' ? 'Нашата колекција' : 'Our Collection'}
            </h2>
          </div>
          <Link
            href="/products"
            className="text-ink-strong font-medium text-sm hover:text-primary-700 transition-colors flex items-center gap-1"
          >
            {t('home.viewAllProducts')}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                scrollRef.current?.scrollTo({ left: 0 })
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-ink-strong text-white'
                  : 'bg-surface-base text-ink-muted border border-border-soft hover:text-ink-base'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="product-grid-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} variant="shop" />
          ))}
        </div>
      </div>
    </section>
  )
}
