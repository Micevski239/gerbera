'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { WelcomeTile } from '@/lib/supabase/types'

interface WelcomeSectionProps {
  tiles: WelcomeTile[]
  title?: string
}

export default function WelcomeSection({ tiles, title }: WelcomeSectionProps) {
  const { language, t } = useLanguage()

  if (!tiles.length) return null

  return (
    <section className="section bg-white">
      <div className="container-custom">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="heading-2 mb-4">
            {title || t('home.exploreCategories')}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full mx-auto" />
        </div>

        {/* Tiles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiles.map((tile) => {
            const tileTitle = getLocalizedField(tile, 'title', language)
            const tileSubtitle = getLocalizedField(tile, 'subtitle', language)
            const imageUrl = getImageUrl(tile.image_path)

            return (
              <Link
                key={tile.id}
                href={tile.link}
                className="group relative overflow-hidden rounded-3xl aspect-[4/3] hover-lift"
                style={{ backgroundColor: tile.background_color }}
              >
                {/* Background image */}
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={tileTitle}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">
                    {tileTitle}
                  </h3>
                  {tileSubtitle && (
                    <p className="text-white/80 text-sm md:text-base drop-shadow-md line-clamp-2">
                      {tileSubtitle}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span>{t('home.shopNow')}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* Hover border effect */}
                <div className="absolute inset-0 rounded-3xl border-4 border-transparent group-hover:border-white/30 transition-colors duration-300" />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
