'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useCategories } from '@/hooks/useCategories'

interface CategoryShowcaseProps {
  language: 'mk' | 'en'
}

const fallbackCategories = [
  {
    id: 'fallback-1',
    name: { mk: 'Керамика', en: 'Ceramics' },
    count: 7,
    image: 'https://images.unsplash.com/photo-1500522144261-ea64433bbe27?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'fallback-2',
    name: { mk: 'Сликарство', en: 'Painting' },
    count: 5,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'fallback-3',
    name: { mk: 'Аранжмани', en: 'Arrangements' },
    count: 4,
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'fallback-4',
    name: { mk: 'Скулптура', en: 'Sculpture' },
    count: 6,
    image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'fallback-5',
    name: { mk: 'Подароци', en: 'Gifting' },
    count: 8,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'fallback-6',
    name: { mk: 'Декор', en: 'Decor' },
    count: 5,
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=80',
  },
]

export default function CategoryShowcase({ language }: CategoryShowcaseProps) {
  const { categories } = useCategories()
  const [startIndex, setStartIndex] = useState(0)
  const visibleCount = 5

  const dataset = useMemo(() => {
    if (categories.length === 0) {
      return fallbackCategories.map((cat) => ({
        id: cat.id,
        name: language === 'mk' ? cat.name.mk : cat.name.en,
        count: cat.count,
        image: cat.image,
        slug: null,
      }))
    }

    return categories.map((cat) => ({
      id: cat.id,
      name: language === 'mk'
        ? cat.name_mk || cat.name
        : cat.name_en || cat.name,
      count: cat.product_count || 0,
      image: cat.category_image_path ? getImageUrl(cat.category_image_path) : null,
      slug: cat.slug,
    }))
  }, [categories, language])

  const maxIndex = Math.max(0, dataset.length - visibleCount)
  const currentIndex = Math.min(startIndex, maxIndex)
  const slice = dataset.slice(currentIndex, currentIndex + visibleCount)

  const handlePrev = () => setStartIndex((prev) => Math.max(0, prev - 1))
  const handleNext = () => setStartIndex((prev) => Math.min(maxIndex, prev + 1))

  return (
    <section className="bg-accent-sage-50">
      <div className="container-custom space-y-8 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow font-body">{language === 'mk' ? 'Категории' : 'Collections'}</p>
            <h2 className="font-heading text-ds-section text-ink-strong">
              {language === 'mk' ? 'Купувај по категорија' : 'Shop by category'}
            </h2>
          </div>
          <div className="flex gap-3">
            <button
              aria-label={language === 'mk' ? 'Претходни категории' : 'Previous categories'}
              className="h-9 w-9 rounded-full border border-border-soft text-ink-muted hover:bg-state-hover hover:text-accent-burgundy-500 hover:border-accent-burgundy-500/50 transition-all duration-200 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              ←
            </button>
            <button
              aria-label={language === 'mk' ? 'Следни категории' : 'Next categories'}
              className="h-9 w-9 rounded-full border border-border-soft text-ink-muted hover:bg-state-hover hover:text-accent-burgundy-500 hover:border-accent-burgundy-500/50 transition-all duration-200 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2"
              onClick={handleNext}
              disabled={currentIndex === maxIndex}
            >
              →
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {slice.map((category) => (
            <Link
              key={category.id}
              href={category.slug ? `/category/${category.slug}` : '/categories'}
              className="group flex flex-col items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-4 rounded-xl"
            >
              <div className="relative h-44 w-44 overflow-hidden rounded-full border-2 border-border-soft bg-surface-base shadow-card transition-all duration-300 group-hover:shadow-lift group-hover:border-accent-burgundy-200 group-hover:scale-105">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="176px"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-accent-burgundy-50/50 text-accent-burgundy-500/40 gap-2">
                    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c2.5-2 4-4 4-6s-1.5-4-4-4-4 2-4 4 1.5 4 4 6z" />
                      <circle cx="12" cy="7" r="3" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2m5 5h2m-2 0l1.5-1.5M7 7H5m2 0L5.5 5.5" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="font-heading text-ds-body font-semibold text-ink-strong group-hover:text-accent-burgundy-500 transition-colors duration-200">{category.name}</p>
                <span className="inline-flex items-center gap-1 text-ds-body-sm text-ink-muted">
                  <span className="font-medium">{category.count || 0}</span> {language === 'mk' ? 'продукти' : 'products'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
