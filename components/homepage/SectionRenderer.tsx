'use client'

import type { HomepageSectionWithItems, ProductWithDetails } from '@/lib/supabase/types'
import ProductGridSection from './ProductGridSection'
import CategoryGridSection from './CategoryGridSection'
import BannerSection from './BannerSection'
import TrustBadgesSection from './TrustBadgesSection'
import GallerySection from './GallerySection'
import TextImageSection from './TextImageSection'

interface SectionRendererProps {
  section: HomepageSectionWithItems
  products?: ProductWithDetails[]
  whatsappNumber?: string
}

export default function SectionRenderer({ section, products = [], whatsappNumber }: SectionRendererProps) {
  if (!section.is_active) return null

  const getPaddingClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'py-8'
      case 'large':
        return 'py-20'
      default:
        return 'py-12'
    }
  }

  const getBackgroundStyle = () => {
    if (section.background_style === 'gradient') {
      return {
        background: `linear-gradient(135deg, ${section.background_color} 0%, ${adjustColor(section.background_color, 20)} 100%)`
      }
    }
    return {
      backgroundColor: section.background_color || '#FFFFFF'
    }
  }

  const renderSection = () => {
    switch (section.section_type) {
      case 'product_grid':
        return (
          <ProductGridSection
            section={section}
            products={products}
            whatsappNumber={whatsappNumber}
          />
        )
      case 'category_grid':
        return <CategoryGridSection section={section} />
      case 'banner':
        return <BannerSection section={section} />
      case 'trust_badges':
        return <TrustBadgesSection section={section} />
      case 'gallery':
        return <GallerySection section={section} />
      case 'text_image':
        return <TextImageSection section={section} />
      default:
        return null
    }
  }

  return (
    <section
      className={`${getPaddingClass(section.padding_size)}`}
      style={getBackgroundStyle()}
    >
      <div className="container-custom">
        {renderSection()}
      </div>
    </section>
  )
}

// Helper function to adjust color brightness
function adjustColor(hex: string, percent: number): string {
  if (!hex || !hex.startsWith('#')) return hex

  const num = parseInt(hex.slice(1), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, Math.max(0, (num >> 16) + amt))
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt))
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt))

  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}
