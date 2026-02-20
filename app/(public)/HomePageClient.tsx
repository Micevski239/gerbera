'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import HeroBentoGrid from '@/components/HeroBentoGrid'
import OccasionShowcase from '@/components/sections/OccasionShowcase'
import TestimonialsShowcase from '@/components/sections/TestimonialsShowcase'
import ProductCard from '@/components/ProductCard'
import SplashScreen from '@/components/SplashScreen'
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

  return (
    <div className="bg-canvas-100 text-ink-base">
      <SplashScreen />

      {/* Hero Bento Grid */}
      <div className="animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <HeroBentoGrid heroTiles={heroTiles} categories={categories} language={language} />
      </div>

      {/* Shop by Occasion */}
      <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <OccasionShowcase language={language} occasions={occasions} />
      </div>

      {/* Info Banner — Craft Story */}
      <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
        <section className="bg-softPink">
          <div className="split-banner">
            {/* Left — Image */}
            <div className="relative h-64 md:h-[480px] overflow-hidden">
              <Image
                src="/images/gerbera.jpg"
                alt={t('home.craftStoryTitle')}
                fill
                className="object-cover img-warm animate-subtle-scale"
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
      </div>

      {/* New Collection */}
      <div className="animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <NewCollectionSection
          productHighlights={productHighlights}
          language={language}
          t={t}
        />
      </div>

      {/* Testimonials */}
      <div className="animate-slide-up" style={{ animationDelay: '0.45s' }}>
        <TestimonialsShowcase language={language} />
      </div>

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
        {/* Centered heading */}
        <div className="text-center mb-8 md:mb-10">
          <p className="eyebrow font-body mb-2">{t('home.newCollection')}</p>
          <h2 className="font-heading text-ds-section text-ink-strong">
            {language === 'mk' ? 'Нашата колекција' : 'Our Collection'}
          </h2>
          <div className="w-12 h-px bg-ink-muted/40 mx-auto mt-4" />
        </div>

        {/* Centered tab pills */}
        <div className="flex gap-2 mb-8 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key)
                scrollRef.current?.scrollTo({ left: 0 })
              }}
              className={`w-32 py-2.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-ink-strong text-white shadow-sm'
                  : 'bg-white text-ink-muted border border-border-soft hover:border-ink-strong hover:text-ink-base'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 2-row × 4-column product grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} variant="shop" />
          ))}
        </div>

        {/* Centered View All button */}
        <div className="text-center mt-8 md:mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border border-ink-strong text-ink-strong text-sm font-medium px-8 py-3 rounded-full hover:bg-ink-strong hover:text-white transition-colors"
          >
            {t('home.viewAllProducts')}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
