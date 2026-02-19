'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Occasion } from '@/lib/supabase/types'
import { getImageUrl } from '@/lib/supabase/client'

interface OccasionShowcaseProps {
  language: 'mk' | 'en'
  occasions: Occasion[]
}

function OccasionCard({ occasion, language }: { occasion: Occasion; language: 'mk' | 'en' }) {
  const label = language === 'mk' ? occasion.name_mk : occasion.name_en
  const imageSrc = occasion.occasion_image_path ? getImageUrl(occasion.occasion_image_path) : null

  return (
    <Link
      href={`/products?occasion=${occasion.slug}`}
      className="group flex flex-col items-center gap-3 w-[120px] sm:w-[140px] md:w-[160px] flex-shrink-0"
    >
      {/* Circle image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-full border-2 border-border-soft shadow-card transition-all duration-300 group-hover:shadow-lift group-hover:-translate-y-1 group-hover:border-primary-300">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={label}
            fill
            className="object-cover img-warm transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 120px, (max-width: 1024px) 140px, 160px"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-canvas-200">
            <span className="text-4xl transition-transform duration-300 group-hover:scale-110">{occasion.icon}</span>
          </div>
        )}

        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-ink-strong/0 transition-colors duration-300 group-hover:bg-ink-strong/10 rounded-full" />
      </div>

      {/* Label below circle */}
      <h3 className="font-body text-sm font-medium text-ink-base text-center leading-snug line-clamp-2 group-hover:text-ink-strong transition-colors">
        {label}
      </h3>
    </Link>
  )
}

export default function OccasionShowcase({ language, occasions }: OccasionShowcaseProps) {
  if (occasions.length === 0) {
    return null
  }

  return (
    <section className="bg-white">
      <div className="container-custom py-12 md:py-16 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow font-body">
            {language === 'mk' ? 'Купувај по пригода' : 'Shop by occasion'}
          </p>
          <h2 className="font-heading text-ds-section text-ink-strong">
            {language === 'mk' ? 'Пронајди го совршениот подарок' : 'Find the perfect gift'}
          </h2>
        </div>

        {/* Horizontally scrollable on mobile, centered wrap on desktop */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {occasions.map((occasion) => (
            <OccasionCard
              key={occasion.id}
              occasion={occasion}
              language={language}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
