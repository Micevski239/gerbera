'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { HomepageSectionWithItems, HomepageSectionItem, GalleryConfig } from '@/lib/supabase/types'

interface GallerySectionProps {
  section: HomepageSectionWithItems
}

export default function GallerySection({ section }: GallerySectionProps) {
  const { language } = useLanguage()
  const config = section.config as GalleryConfig

  const title = getLocalizedField(section, 'title', language)
  const subtitle = getLocalizedField(section, 'subtitle', language)

  // Filter active items and sort by display_order
  const items = (section.items || [])
    .filter(item => item.is_active)
    .sort((a, b) => a.display_order - b.display_order)

  const getGridClass = () => {
    const columns = config.columns || 6
    switch (columns) {
      case 3:
        return 'grid grid-cols-2 sm:grid-cols-3 gap-2'
      case 4:
        return 'grid grid-cols-2 sm:grid-cols-4 gap-2'
      case 5:
        return 'grid grid-cols-3 sm:grid-cols-5 gap-2'
      default: // 6
        return 'grid grid-cols-3 sm:grid-cols-6 gap-2'
    }
  }

  return (
    <div>
      {/* Section Header */}
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && <h2 className="heading-2 mb-2">{title}</h2>}
          {subtitle && <p className="text-neutral-600">{subtitle}</p>}
        </div>
      )}

      {/* Gallery Grid */}
      <div className={getGridClass()}>
        {items.map((item) => (
          <GalleryItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

interface GalleryItemProps {
  item: HomepageSectionItem
}

function GalleryItem({ item }: GalleryItemProps) {
  const { language } = useLanguage()

  const title = getLocalizedField(item, 'title', language)
  const imageUrl = getImageUrl(item.image_path)

  const content = (
    <div className="group relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title || 'Gallery image'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 640px) 33vw, 16vw"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
        {item.link && (
          <svg className="w-8 h-8 text-white transform scale-75 group-hover:scale-100 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </div>

      {/* Title Overlay (optional) */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-sm font-medium truncate">{title}</p>
        </div>
      )}
    </div>
  )

  if (item.link) {
    return (
      <Link href={item.link} target="_blank" rel="noopener noreferrer">
        {content}
      </Link>
    )
  }

  return content
}
