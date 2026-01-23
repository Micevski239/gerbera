'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ProductShowcase from '@/components/sections/ProductShowcase'
import TestimonialsShowcase from '@/components/sections/TestimonialsShowcase'
import OccasionShowcase from '@/components/sections/OccasionShowcase'
import RecipientShowcase from '@/components/sections/RecipientShowcase'
import type { Category, Product, Occasion, SiteStat } from '@/lib/supabase/types'

const navLinks = [
  { label: { mk: 'Дома', en: 'Home' }, href: '/' },
  { label: { mk: 'Продавница', en: 'Shop' }, href: '/products' },
  { label: { mk: 'За нас', en: 'About Us' }, href: '/about' },
  { label: { mk: 'Контакт', en: 'Contact' }, href: '/contact' },
]

interface HomePageClientProps {
  categories: Category[]
  occasions: Occasion[]
  stats: SiteStat[]
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
  productHighlights
}: HomePageClientProps) {
  const { language } = useLanguage()

  const heroBackgroundStyle = {
    backgroundImage: "url('/images/hero-background.png')",
    backgroundSize: '500px 500px',
    backgroundPosition: 'center',
    backgroundRepeat: 'repeat',
    backgroundAttachment: 'fixed',
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
              {stats.map((stat) => {
                const label = language === 'mk' ? stat.label_mk : stat.label_en
                const suffix = language === 'mk' ? stat.suffix_mk : stat.suffix_en
                return (
                  <div
                    key={stat.id}
                    className="flex items-center gap-4 rounded-2xl bg-surface-base/80 backdrop-blur-sm p-5 shadow-soft transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-burgundy-50 text-accent-burgundy-500">
                      <StatIcon icon={stat.icon ?? 'star'} />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-accent-burgundy-500">{stat.value}</span>
                        {suffix && <span className="text-lg font-semibold text-accent-burgundy-400">{suffix}</span>}
                      </div>
                      <p className="mt-0.5 text-ds-body-sm text-ink-muted">
                        {label}
                      </p>
                    </div>
                  </div>
                )
              })}
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

function StatIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'calendar':
      return (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'users':
      return (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case 'box':
      return (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    case 'heart':
      return (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'star':
      return (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    case 'award':
      return (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    case 'check':
      return (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'gift':
      return (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    default:
      return (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
  }
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
