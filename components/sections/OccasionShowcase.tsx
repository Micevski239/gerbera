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
      className="group relative mx-auto block aspect-square w-full max-w-[216px] overflow-hidden rounded-full shadow-card transition-all duration-300 hover:shadow-lift hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2"
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={label}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 40vw, (max-width: 1024px) 20vw, 12vw"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-accent-burgundy-50">
          <span className="text-5xl transition-transform duration-300 group-hover:scale-110">{occasion.icon}</span>
        </div>
      )}

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

export default function OccasionShowcase({ language, occasions }: OccasionShowcaseProps) {
  if (occasions.length === 0) {
    return null
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container-custom relative py-16 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow font-body">
            {language === 'mk' ? 'Купувај по пригода' : 'Shop by occasion'}
          </p>
          <h2 className="font-heading text-ds-section text-ink-strong">
            {language === 'mk' ? 'Пронајди го совршениот подарок' : 'Find the perfect gift'}
          </h2>
          <p className="mt-3 text-ds-body text-ink-muted">
            {language === 'mk'
              ? 'Изберете од нашата колекција за секоја специјална пригода'
              : 'Choose from our collection for every special occasion'}
          </p>
        </div>

        {/* Responsive Layout - matching RecipientShowcase */}
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
