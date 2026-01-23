'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { HomepageSectionWithItems, TextImageConfig } from '@/lib/supabase/types'

interface TextImageSectionProps {
  section: HomepageSectionWithItems
}

export default function TextImageSection({ section }: TextImageSectionProps) {
  const { language } = useLanguage()
  const config = section.config as TextImageConfig

  const title = getLocalizedField(section, 'title', language)
  const subtitle = getLocalizedField(section, 'subtitle', language)
  const content = language === 'mk' ? config.content_mk : config.content_en
  const ctaText = language === 'mk' ? config.cta_text_mk : config.cta_text_en
  const imageUrl = getImageUrl(config.image_path || null)

  const isImageLeft = config.image_position === 'left'

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 lg:gap-24 items-center ${isImageLeft ? '' : 'md:flex-row-reverse'}`}>
      {/* Image */}
      <div className={`relative aspect-[4/5] overflow-hidden ${isImageLeft ? 'md:order-1' : 'md:order-2'}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || 'Section image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full bg-cream-300 flex items-center justify-center">
            <svg className="w-16 h-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content - Fiorello elegant style */}
      <div className={`${isImageLeft ? 'md:order-2' : 'md:order-1'}`}>
        {subtitle && (
          <p className="subheading mb-4">{subtitle}</p>
        )}
        {title && (
          <h2 className="heading-2 mb-6">{title}</h2>
        )}
        {content && (
          <div
            className="body-text leading-relaxed mb-8"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
          />
        )}
        {ctaText && config.cta_link && (
          <Link href={config.cta_link} className="btn btn-outline">
            {ctaText}
          </Link>
        )}
      </div>
    </div>
  )
}
