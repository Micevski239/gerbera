'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { ChevronRightIcon } from '@/components/icons'
import HeroBentoGrid from '@/components/HeroBentoGrid'
import OccasionShowcase from '@/components/sections/OccasionShowcase'
import TestimonialsShowcase from '@/components/sections/TestimonialsShowcase'
import ProductCard from '@/components/ProductCard'
import ScrollReveal from '@/components/ScrollReveal'
import type { Category, Product, Occasion, SiteStat, HeroTile, Testimonial } from '@/lib/supabase/types'

/* ─── Parallax Image ──────────────────────────────────────────────── */
function ParallaxImage({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const ticking = useRef(false)

  const onScroll = useCallback(() => {
    if (ticking.current) return
    ticking.current = true
    requestAnimationFrame(() => {
      const container = containerRef.current
      const inner = innerRef.current
      if (!container || !inner) { ticking.current = false; return }

      const rect = container.getBoundingClientRect()
      const windowH = window.innerHeight
      const progress = Math.min(Math.max(
        1 - (rect.bottom / (windowH + rect.height)), 0), 1)
      const maxTravel = inner.offsetHeight - rect.height
      inner.style.transform = `translate3d(0, ${-progress * maxTravel * 0.6}px, 0)`

      ticking.current = false
    })
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [onScroll])

  return (
    <div ref={containerRef} className="relative h-64 md:h-[480px] overflow-hidden">
      <div
        ref={innerRef}
        className="absolute top-0 left-0 w-full will-change-transform"
        style={{ height: '180%' }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />
    </div>
  )
}

interface HomePageClientProps {
  categories: Category[]
  occasions: Occasion[]
  stats: SiteStat[]
  heroTiles?: HeroTile[]
  testimonials?: Testimonial[]
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
  testimonials,
  productHighlights
}: HomePageClientProps) {
  const { language, t } = useLanguage()

  return (
    <div className="bg-canvas-100 text-ink-base">
      {/* Hero — no animation, immediately visible */}
      <HeroBentoGrid heroTiles={heroTiles} categories={categories} language={language} />

      {/* Shop by Occasion */}
      <ScrollReveal>
        <OccasionShowcase language={language} occasions={occasions} />
      </ScrollReveal>

      {/* Info Banner — Craft Story */}
      <ScrollReveal>
        <section className="bg-softPink">
          <div className="split-banner">
            {/* Left — Image with parallax scroll */}
            <ParallaxImage
              src="/images/gerbera.webp"
              alt={t('home.craftStoryTitle')}
            />
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
      </ScrollReveal>

      {/* New Collection */}
      <ScrollReveal>
        <NewCollectionSection
          productHighlights={productHighlights}
          language={language}
          t={t}
        />
      </ScrollReveal>

      {/* Testimonials */}
      <ScrollReveal>
        <TestimonialsShowcase language={language} testimonials={testimonials} />
      </ScrollReveal>

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
            Нашата колекција
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
        <ScrollReveal
          stagger={80}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5"
        >
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} variant="shop" />
          ))}
        </ScrollReveal>

        {/* Centered View All button */}
        <div className="text-center mt-8 md:mt-10">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border border-ink-strong text-ink-strong text-sm font-medium px-8 py-3 rounded-full hover:bg-ink-strong hover:text-white transition-colors"
          >
            {t('home.viewAllProducts')}
            <ChevronRightIcon />
          </Link>
        </div>
      </div>
    </section>
  )
}
