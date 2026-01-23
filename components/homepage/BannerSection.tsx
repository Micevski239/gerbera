'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { HomepageSectionWithItems, BannerConfig } from '@/lib/supabase/types'

interface BannerSectionProps {
  section: HomepageSectionWithItems
}

export default function BannerSection({ section }: BannerSectionProps) {
  const { language } = useLanguage()
  const config = section.config as BannerConfig

  const title = getLocalizedField(section, 'title', language)
  const subtitle = getLocalizedField(section, 'subtitle', language)
  const ctaText = language === 'mk' ? config.cta_text_mk : config.cta_text_en
  const imageUrl = getImageUrl(config.image_path || null)

  const getHeightClass = () => {
    switch (config.height) {
      case 'small':
        return 'h-64 md:h-72'
      case 'large':
        return 'h-96 md:h-[500px]'
      default: // medium
        return 'h-80 md:h-96'
    }
  }

  const getTextAlignClass = () => {
    switch (config.text_position) {
      case 'left':
        return 'text-left items-start'
      case 'right':
        return 'text-right items-end'
      default:
        return 'text-center items-center'
    }
  }

  const overlayOpacity = config.overlay_opacity ?? 30

  const content = (
    <div className={`relative ${getHeightClass()} overflow-hidden`}>
      {/* Background Image */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title || 'Banner'}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-cream-300" />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
      />

      {/* Content - Fiorello elegant style */}
      <div className={`relative h-full flex flex-col justify-center ${getTextAlignClass()} px-8 md:px-16 lg:px-24`}>
        {subtitle && (
          <p className="text-white/90 text-xs uppercase tracking-elegant mb-4">
            {subtitle}
          </p>
        )}
        {title && (
          <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-normal text-white mb-6 leading-tight">
            {title}
          </h2>
        )}
        {ctaText && config.cta_link && (
          <Link
            href={config.cta_link}
            className="btn btn-white inline-flex"
            style={
              config.text_position === 'left'
                ? { alignSelf: 'flex-start' }
                : config.text_position === 'right'
                ? { alignSelf: 'flex-end' }
                : { alignSelf: 'center' }
            }
          >
            {ctaText}
          </Link>
        )}
      </div>
    </div>
  )

  // If the entire banner is clickable
  if (config.link && !config.cta_link) {
    return (
      <Link href={config.link} className="block group">
        <div className="transition-transform duration-500 group-hover:scale-[1.01]">
          {content}
        </div>
      </Link>
    )
  }

  return content
}
