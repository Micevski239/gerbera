'use client'

import type { JSX } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ProductShowcase from '@/components/sections/ProductShowcase'
import TestimonialsShowcase from '@/components/sections/TestimonialsShowcase'
import OccasionShowcase from '@/components/sections/OccasionShowcase'
import RecipientShowcase from '@/components/sections/RecipientShowcase'
import type { Category, Product, Occasion } from '@/lib/supabase/types'

const navLinks = [
  { label: { mk: 'Дома', en: 'Home' }, href: '/' },
  { label: { mk: 'Продавница', en: 'Shop' }, href: '/products' },
  { label: { mk: 'За нас', en: 'About Us' }, href: '/about' },
  { label: { mk: 'Контакт', en: 'Contact' }, href: '/contact' },
]

type BusinessFeatureIcon = 'gift' | 'flower' | 'balloon' | 'wine' | 'sparkles'

interface BusinessFeature {
  icon: BusinessFeatureIcon
  text: { mk: string; en: string }
}

const featureIconMap: Record<BusinessFeatureIcon, JSX.Element> = {
  gift: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7m16 0H4m16 0V7a2 2 0 00-2-2h-3.5a1.5 1.5 0 010-3 1.5 1.5 0 010 3V5m-7 0v2m0-2a1.5 1.5 0 110-3 1.5 1.5 0 010 3H6a2 2 0 00-2 2v5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v16" />
    </svg>
  ),
  flower: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c2.5-2 4-4 4-6s-1.5-4-4-4-4 2-4 4 1.5 4 4 6z" />
      <circle cx="12" cy="7" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2m5 5h2m-2 0l1.5-1.5M7 7H5m2 0L5.5 5.5" />
    </svg>
  ),
  balloon: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-1.5-2-1.5-3 1.5-1 1.5-1 1.5 0 1.5 1-1.5 3-1.5 3zm0-5c-3.037 0-5.5-2.686-5.5-6S8.963 4 12 4s5.5 2.686 5.5 6-2.463 6-5.5 6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v2" />
    </svg>
  ),
  wine: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8v4a4 4 0 01-4 4 4 4 0 01-4-4V3zm4 8v9m-4 0h8" />
    </svg>
  ),
  sparkles: (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 15l.8 1.8L9 17.6l-1.8.8L6 21l-.8-2.6L3.4 17.6 5.2 16.8 6 15zm12 0l.8 1.8 2.2.8-1.8.8L18 21l-.8-2.6-2.2-.8 2.2-.8.8-1.8z" />
    </svg>
  ),
}

const businessFeatures: BusinessFeature[] = [
  { icon: 'gift', text: { mk: 'Персонализирани подароци', en: 'Personalized gifts' } },
  { icon: 'flower', text: { mk: 'Свежи и вештачки цвеќиња', en: 'Fresh & artificial flowers' } },
  { icon: 'balloon', text: { mk: 'Балони со посвета', en: 'Custom balloons' } },
  { icon: 'wine', text: { mk: 'Персонализирани вина', en: 'Personalized wines' } },
  { icon: 'sparkles', text: { mk: 'Декорации за настани', en: 'Event decorations' } },
]

interface HomePageClientProps {
  categories: Category[]
  occasions: Occasion[]
  productHighlights?: {
    latest: Product[]
    popular: Product[]
    best: Product[]
  }
}

export default function HomePageClient({
  categories,
  occasions,
  productHighlights
}: HomePageClientProps) {
  const { language } = useLanguage()

  const heroBackgroundStyle = {
    backgroundImage: "url('/images/hero-background.png')",
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    backgroundRepeat: 'repeat',
  } as const

  // Get category label helper
  const getCategoryLabel = (category: Category) => {
    if (language === 'mk') {
      return category.name_mk || category.name || category.name_en || ''
    }
    return category.name_en || category.name || category.name_mk || ''
  }

  // Contact info
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+389 70 123 456'
  const dialablePhone = contactPhone.replace(/[^+\d]/g, '')
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com'
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com'

  // Use first 5 categories for hero tiles (mapped to the grid positions)
  const heroCategories = categories.slice(0, 5)
  const [leftTop, leftBottom, center, rightTop, rightBottom] = heroCategories

  const heroTilesLayout = [
    {
      category: leftTop,
      fallback: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=700&q=80',
      className: 'lg:col-start-1 lg:row-start-1',
      featured: false,
    },
    {
      category: leftBottom,
      fallback: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80',
      className: 'lg:col-start-1 lg:row-start-2',
      featured: false,
    },
    {
      category: center,
      fallback: 'https://images.unsplash.com/photo-1418573991218-0acf577650a3?auto=format&fit=crop&w=900&q=80',
      className: 'col-span-2 sm:col-span-2 lg:col-span-2 lg:col-start-2 lg:row-span-2',
      featured: true,
    },
    {
      category: rightTop,
      fallback: 'https://images.unsplash.com/photo-1452457750107-cd084dce177d?auto=format&fit=crop&w=500&q=80',
      className: 'lg:col-start-4 lg:row-start-1',
      featured: false,
    },
    {
      category: rightBottom,
      fallback: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=500&q=80',
      className: 'lg:col-start-4 lg:row-start-2',
      featured: false,
    },
  ]

  return (
    <div className="bg-white text-neutral-600">
      {/* Header */}
      <header className="">
        {/* Main Header */}
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
                  className={`relative px-3 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2 rounded ${
                    link.href === '/'
                      ? 'text-accent-burgundy-500'
                      : 'hover:text-accent-burgundy-500'
                  }`}
                >
                  {language === 'mk' ? link.label.mk : link.label.en}
                  {/* Underline animation */}
                  <span
                    className={`absolute bottom-1 left-3 right-3 h-0.5 bg-accent-burgundy-500 transition-transform duration-200 origin-left ${
                      link.href === '/' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                    style={{ transform: link.href === '/' ? 'scaleX(1)' : undefined }}
                  />
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

      <main>
        <section
          className="bg-accent-sage-50"
          style={heroBackgroundStyle}
        >
          <div className="container-custom grid grid-cols-2 gap-4 py-12 sm:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2">
            {heroTilesLayout.map((tile, index) => (
              tile.category ? (
                <HeroCategoryTile
                  key={tile.category.id}
                  category={tile.category}
                  label={getCategoryLabel(tile.category)}
                  fallback={tile.fallback}
                  className={tile.className}
                  featured={tile.featured}
                />
              ) : null
            ))}
          </div>
        </section>

        {productHighlights && (
          <ProductShowcase
            products={{
              latest: productHighlights.latest,
              popular: productHighlights.popular,
              best: productHighlights.best,
            }}
            language={language}
          />
        )}

        <RecipientShowcase language={language} categories={categories} />

        {/* Testimonials */}
        <TestimonialsShowcase language={language} />

        {/* Shop by Occasion */}
        <OccasionShowcase language={language} occasions={occasions} />

        {/* About/Trust Section */}
        <section className="bg-[#fefaf9]">
          <div className="container-custom grid gap-12 py-20 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="brand-pill">Gerbera Gifts</span>
              <h2 className="heading-2 mt-4">
                {language === 'mk' ? 'Персонализирани подароци и декорации' : 'Personalized gifts & decorations'}
              </h2>
              <p className="mt-5 text-ds-body text-ink-base leading-relaxed">
                {language === 'mk'
                  ? 'Gerbera Gifts е креативно студио кое создава персонализирани подароци и декорации за секоја пригода.'
                  : 'Gerbera Gifts is a creative studio crafting personalized gifts and decorations for every occasion.'
                }
              </p>
              <p className="mt-4 text-ds-body text-ink-base leading-relaxed">
                {language === 'mk'
                  ? 'Нашата колекција вклучува балони со посвета, свежи и вештачки цветни аранжмани, персонализирани вина за прослави и именувања.'
                  : 'Our collection includes custom balloons with heartfelt text, fresh and artificial flower arrangements, and personalized wines for celebrations and name days.'
                }
              </p>
              <p className="mt-4 text-ds-body text-ink-base leading-relaxed">
                {language === 'mk'
                  ? 'Секој производ е изработен со внимание и љубов, создавајќи незаборавни и значајни моменти.'
                  : 'Every treasure is made to order with attention to detail and love, creating memorable, meaningful moments.'
                }
              </p>
              {/* CTA Button */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/about"
                  className="btn-primary"
                >
                  {language === 'mk' ? 'Дознај повеќе' : 'Learn More'}
                </Link>
                <Link
                  href="/contact"
                  className="btn-outline-primary"
                >
                  {language === 'mk' ? 'Контактирај нè' : 'Contact Us'}
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 content-start">
              {businessFeatures.map((feature) => (
                <div
                  key={feature.text.en}
                  className="flex items-start gap-4 rounded-2xl bg-surface-base/80 backdrop-blur-sm p-5 shadow-soft transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-burgundy-50 text-accent-burgundy-500">
                    {featureIconMap[feature.icon]}
                  </div>
                  <div>
                    <p className="text-ds-body font-semibold text-ink-strong">
                      {language === 'mk' ? feature.text.mk : feature.text.en}
                    </p>
                    <p className="mt-1 text-ds-body-sm text-ink-muted leading-relaxed">
                      {language === 'mk' ? 'Изработено со љубов и внимание.' : 'Made to order with love and attention.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

interface HeroCategoryTileProps {
  category: Category
  label: string
  fallback: string
  className?: string
  featured?: boolean
}

function HeroCategoryTile({ category, label, fallback, className = '', featured = false }: HeroCategoryTileProps) {
  const imageSrc = (category.category_image_path ? getImageUrl(category.category_image_path) : null) || fallback
  const tileHeight = featured ? 'h-60 sm:h-80 lg:h-[32rem]' : 'h-60'

  return (
    <Link
      href={`/category/${category.slug}`}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hero focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2 ${className}`}
    >
      <div className={`${tileHeight} w-full`}>
        <Image
          src={imageSrc}
          alt={label}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={featured ? '(max-width: 1024px) 100vw, 600px' : '(max-width: 768px) 50vw, 360px'}
          priority={featured}
        />
      </div>
      {/* Softer gradient with inner vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.15)]" />
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
        <h2 className="font-heading text-ds-body-lg font-semibold text-white drop-shadow-lg">{label}</h2>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
