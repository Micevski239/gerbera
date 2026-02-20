'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import type { Category, HeroTile } from '@/lib/supabase/types'

interface HeroBentoGridProps {
  heroTiles?: HeroTile[]
  categories: Category[]
  language: 'mk' | 'en'
}

const SLOT_ORDER = ['left', 'right_top', 'right_bottom_left', 'right_bottom_right'] as const

const fallbackImages = [
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1418573991218-0acf577650a3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1452457750107-cd084dce177d?auto=format&fit=crop&w=900&q=80',
]

interface NormalizedTile {
  label: string
  tagline: string
  image: string
  href: string
  isExternal: boolean
}

function TileLink({ tile, className, children }: { tile: NormalizedTile; className: string; children: React.ReactNode }) {
  if (tile.isExternal) {
    return (
      <a href={tile.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link href={tile.href} className={className}>
      {children}
    </Link>
  )
}

export default function HeroBentoGrid({ heroTiles, categories, language }: HeroBentoGridProps) {
  const shopNow = language === 'mk' ? 'Купи сега' : 'Shop Now'
  const eyebrow = language === 'mk' ? 'Колекција' : 'Collection'

  // Build a map of slot → HeroTile for quick lookup
  const tileBySlot = new Map<string, HeroTile>()
  if (heroTiles) {
    for (const t of heroTiles) {
      tileBySlot.set(t.slot, t)
    }
  }

  // Build the 4 normalized tiles: prefer hero tiles, fall back to categories
  const catFallbacks = categories.slice(0, 4)
  const tiles: (NormalizedTile | null)[] = SLOT_ORDER.map((slot, i) => {
    const ht = tileBySlot.get(slot)
    if (ht) {
      const tileUrl = ht.url || '/products'
      return {
        label: language === 'mk' ? ht.label_mk : ht.label_en,
        tagline: language === 'mk' ? ht.tagline_mk : ht.tagline_en,
        image: ht.image_url,
        href: tileUrl,
        isExternal: tileUrl.startsWith('http'),
      }
    }
    const cat = catFallbacks[i]
    if (cat) {
      const label = language === 'mk'
        ? (cat.name_mk || cat.name || cat.name_en || '')
        : (cat.name_en || cat.name || cat.name_mk || '')
      const url = cat.category_image_path ? getImageUrl(cat.category_image_path) : null
      return {
        label,
        tagline: '',
        image: url || fallbackImages[i % fallbackImages.length],
        href: `/products?category=${cat.slug}`,
        isExternal: false,
      }
    }
    return null
  })

  if (tiles.every((t) => t === null)) return null

  return (
    <section className="bg-canvas-100">
      <div className="container-custom py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-[5fr_5fr] md:h-[660px] gap-3 md:gap-4">

          {/* ───── LEFT: Large card (full height) ───── */}
          {tiles[0] && (
            <TileLink
              tile={tiles[0]}
              className="group relative rounded-2xl overflow-hidden bg-neutral-100 min-h-[320px]"
            >
              <Image
                src={tiles[0].image}
                alt={tiles[0].label}
                fill
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              {/* gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-8 lg:p-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 mb-2 font-body">
                  {eyebrow}
                </p>
                <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl text-white leading-tight mb-5 max-w-[280px]">
                  {tiles[0].label}
                </h2>
                <span className="inline-flex items-center justify-center bg-white text-ink-strong text-[11px] font-semibold px-6 py-2.5 rounded-full group-hover:bg-neutral-100 transition-colors uppercase tracking-widest">
                  {shopNow}
                </span>
              </div>
            </TileLink>
          )}

          {/* ───── RIGHT COLUMN: nested 2-row grid ───── */}
          <div className="grid grid-cols-1 grid-rows-[1fr_1fr] gap-3 md:gap-4">

            {/* Right top card */}
            {tiles[1] && (
              <TileLink
                tile={tiles[1]}
                className="group relative rounded-2xl overflow-hidden bg-neutral-100 h-[240px] md:h-auto md:min-h-0"
              >
                <Image
                  src={tiles[1].image}
                  alt={tiles[1].label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-5 md:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/70 mb-1.5 font-body">
                    {eyebrow}
                  </p>
                  <h3 className="font-heading text-lg md:text-xl lg:text-2xl text-white leading-tight">
                    {tiles[1].label}
                  </h3>
                </div>
              </TileLink>
            )}

            {/* Right bottom: 2 equal cards */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 min-h-0">
              {tiles[2] && (
                <TileLink
                  tile={tiles[2]}
                  className="group relative rounded-2xl overflow-hidden bg-neutral-50 h-[200px] md:h-auto md:min-h-0"
                >
                  <Image
                    src={tiles[2].image}
                    alt={tiles[2].label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70 mb-1 font-body">
                      {eyebrow}
                    </p>
                    <h3 className="font-heading text-sm md:text-base lg:text-lg text-white leading-tight">
                      {tiles[2].label}
                    </h3>
                  </div>
                </TileLink>
              )}

              {tiles[3] && (
                <TileLink
                  tile={tiles[3]}
                  className="group relative rounded-2xl overflow-hidden bg-white h-[200px] md:h-auto md:min-h-0"
                >
                  <Image
                    src={tiles[3].image}
                    alt={tiles[3].label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                  <div className="absolute bottom-0 left-0 right-0 z-20 p-4 md:p-5">
                    <h3 className="font-heading text-sm md:text-base lg:text-lg text-white leading-tight">
                      {tiles[3].label}
                    </h3>
                  </div>
                </TileLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
