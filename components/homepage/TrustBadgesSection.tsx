'use client'

import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { HomepageSectionWithItems, HomepageSectionItem, TrustBadgesConfig } from '@/lib/supabase/types'

interface TrustBadgesSectionProps {
  section: HomepageSectionWithItems
}

export default function TrustBadgesSection({ section }: TrustBadgesSectionProps) {
  const { language } = useLanguage()
  const config = section.config as TrustBadgesConfig

  const title = getLocalizedField(section, 'title', language)
  const subtitle = getLocalizedField(section, 'subtitle', language)

  // Filter active items and sort by display_order
  const items = (section.items || [])
    .filter(item => item.is_active)
    .sort((a, b) => a.display_order - b.display_order)

  const getGridClass = () => {
    switch (section.layout_style) {
      case 'grid-3':
        return 'grid grid-cols-1 sm:grid-cols-3 gap-6'
      case 'grid-2':
        return 'grid grid-cols-1 sm:grid-cols-2 gap-6'
      default: // grid-4
        return 'grid grid-cols-2 md:grid-cols-4 gap-6'
    }
  }

  const getIconSize = () => {
    switch (config.icon_size) {
      case 'small':
        return 'w-8 h-8'
      case 'large':
        return 'w-14 h-14'
      default:
        return 'w-10 h-10'
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

      {/* Trust Badges Grid */}
      <div className={getGridClass()}>
        {items.map((item) => (
          <TrustBadgeItem
            key={item.id}
            item={item}
            iconSize={getIconSize()}
          />
        ))}
      </div>
    </div>
  )
}

interface TrustBadgeItemProps {
  item: HomepageSectionItem
  iconSize: string
}

function TrustBadgeItem({ item, iconSize }: TrustBadgeItemProps) {
  const { language } = useLanguage()

  const title = getLocalizedField(item, 'title', language)
  const subtitle = getLocalizedField(item, 'subtitle', language)

  return (
    <div className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-neutral-50 transition-colors">
      {/* Icon */}
      <div
        className={`${iconSize} mb-3 text-primary flex items-center justify-center`}
        style={{ color: item.background_color || undefined }}
      >
        <TrustIcon name={item.icon || 'check'} />
      </div>

      {/* Text */}
      <h3
        className="font-semibold text-neutral-800 mb-1"
        style={{ color: item.text_color || undefined }}
      >
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-neutral-500">{subtitle}</p>
      )}
    </div>
  )
}

interface TrustIconProps {
  name: string
}

function TrustIcon({ name }: TrustIconProps) {
  const iconClass = "w-full h-full"

  switch (name) {
    case 'truck':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    case 'shield':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'clock':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'heart':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'star':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    case 'refresh':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    case 'lock':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    case 'leaf':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    case 'gift':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    case 'flower':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      )
    default: // check
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
  }
}
