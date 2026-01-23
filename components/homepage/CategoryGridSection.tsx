'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { HomepageSectionWithItems, HomepageSectionItem } from '@/lib/supabase/types'

interface CategoryGridSectionProps {
  section: HomepageSectionWithItems
}

export default function CategoryGridSection({ section }: CategoryGridSectionProps) {
  const { language } = useLanguage()

  const title = getLocalizedField(section, 'title', language)
  const subtitle = getLocalizedField(section, 'subtitle', language)

  // Filter active items and sort by display_order
  const items = (section.items || [])
    .filter(item => item.is_active)
    .sort((a, b) => a.display_order - b.display_order)

  const getGridClass = () => {
    switch (section.layout_style) {
      case 'grid-3':
        return 'grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8'
      case 'grid-5':
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6'
      case 'grid-6':
        return 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-6'
      default: // grid-4
        return 'grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8'
    }
  }

  return (
    <div>
      {/* Section Header - Fiorello Style */}
      {(title || subtitle) && (
        <div className="section-header">
          {subtitle && <p className="subheading">{subtitle}</p>}
          {title && <h2 className="heading-2">{title}</h2>}
        </div>
      )}

      {/* Category Grid */}
      <div className={getGridClass()}>
        {items.map((item) => (
          <CategoryGridItem
            key={item.id}
            item={item}
            shape={section.item_shape}
          />
        ))}
      </div>
    </div>
  )
}

interface CategoryGridItemProps {
  item: HomepageSectionItem
  shape: string
}

function CategoryGridItem({ item, shape }: CategoryGridItemProps) {
  const { language } = useLanguage()

  const title = getLocalizedField(item, 'title', language)
  const subtitle = getLocalizedField(item, 'subtitle', language)
  const imageUrl = getImageUrl(item.image_path)

  const isCircle = shape === 'circle'

  const content = (
    <div className="group flex flex-col items-center text-center">
      {/* Image */}
      <div
        className={`relative w-full aspect-square overflow-hidden mb-4 transition-transform duration-500 group-hover:scale-[1.02] ${
          isCircle ? 'rounded-full' : ''
        }`}
        style={{
          backgroundColor: item.background_color || '#F8F8F8'
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title || ''}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Subtle hover overlay */}
        <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 ${
          isCircle ? 'rounded-full' : ''
        }`} />
      </div>

      {/* Text - Fiorello elegant style */}
      <h3
        className="font-heading text-lg text-neutral-800 group-hover:text-primary-500 transition-colors"
        style={{ color: item.text_color || undefined }}
      >
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
      )}
    </div>
  )

  if (item.link) {
    return (
      <Link href={item.link} className="block">
        {content}
      </Link>
    )
  }

  return content
}
