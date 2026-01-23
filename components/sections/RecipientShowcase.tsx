'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Category } from '@/lib/supabase/types'
import { getImageUrl } from '@/lib/supabase/client'

interface RecipientShowcaseProps {
  language: 'mk' | 'en'
  categories: Category[]
}

const fallbacks = [
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
]

function RecipientCard({ category, language, fallback }: { category: Category; language: 'mk' | 'en'; fallback: string }) {
  const label = language === 'mk'
    ? category.name_mk || category.name || category.name_en || ''
    : category.name_en || category.name || category.name_mk || ''
  const imageSrc = (category.category_image_path ? getImageUrl(category.category_image_path) : null) ?? fallback

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative mx-auto block aspect-square w-full max-w-[216px] overflow-hidden rounded-full shadow-card transition-all duration-300 hover:shadow-lift hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2"
    >
      {/* Background Image */}
      <Image
        src={imageSrc}
        alt={label}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 640px) 40vw, (max-width: 1024px) 20vw, 12vw"
        loading="lazy"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60 opacity-60 transition-opacity duration-300 group-hover:opacity-70" />

      {/* Centered Label */}
      <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
        <h3 className="font-heading text-ds-body sm:text-ds-body-lg font-semibold text-white text-center drop-shadow-lg leading-snug line-clamp-2">
          {label}
        </h3>
      </div>

      {/* Arrow indicator on hover */}
      <span className="pointer-events-none absolute left-1/2 bottom-5 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-sm opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  )
}

export default function RecipientShowcase({ language, categories }: RecipientShowcaseProps) {
  const displayCategories = categories.slice(0, 6)
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/hero-background.png')",
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="container-custom relative py-16 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow font-body">
            {language === 'mk' ? 'Купувај по категорија' : 'Shop by category'}
          </p>
          <h2 className="font-heading text-ds-section text-ink-strong">
            {language === 'mk' ? 'Подароци за секого' : 'Gifts for everyone'}
          </h2>
          <p className="mt-3 text-ds-body text-ink-muted">
            {language === 'mk'
              ? 'Пронајдете го идеалниот подарок за секоја личност во вашиот живот'
              : 'Find the ideal gift for every person in your life'}
          </p>
        </div>

        {/* Responsive Layout */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {displayCategories.map((category, index) => (
            <RecipientCard
              key={category.id}
              category={category}
              language={language}
              fallback={fallbacks[index % fallbacks.length]}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
