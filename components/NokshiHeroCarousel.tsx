'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import type { Category } from '@/lib/supabase/types'

interface NokshiHeroCarouselProps {
  categories: Category[]
  language: 'mk' | 'en'
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1418573991218-0acf577650a3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1452457750107-cd084dce177d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
]

export default function NokshiHeroCarousel({ categories, language }: NokshiHeroCarouselProps) {
  const slides = categories.slice(0, 5)
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, slides.length, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, slides.length, goTo])

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, slides.length])

  if (slides.length === 0) return null

  const getCategoryLabel = (cat: Category) => {
    if (language === 'mk') return cat.name_mk || cat.name || cat.name_en || ''
    return cat.name_en || cat.name || cat.name_mk || ''
  }

  const getCategoryDescription = (cat: Category) => {
    if (language === 'mk') return cat.description_mk || cat.description || cat.description_en || ''
    return cat.description_en || cat.description || cat.description_mk || ''
  }

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="relative">
        {slides.map((cat, index) => {
          const imageSrc = cat.category_image_path
            ? getImageUrl(cat.category_image_path)
            : fallbackImages[index % fallbackImages.length]

          return (
            <div
              key={cat.id}
              className={`transition-opacity duration-500 ${
                index === current ? 'opacity-100 relative' : 'opacity-0 absolute inset-0'
              }`}
              aria-hidden={index !== current}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px] md:min-h-[520px]">
                {/* Left — Image */}
                <div className="relative h-64 md:h-auto overflow-hidden bg-canvas-200">
                  {imageSrc && (
                    <Image
                      src={imageSrc}
                      alt={getCategoryLabel(cat)}
                      fill
                      className="object-cover img-warm"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index === 0}
                    />
                  )}
                </div>

                {/* Right — Text */}
                <div className="flex flex-col justify-center px-8 py-10 md:px-16 md:py-20 bg-softPink">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted mb-3 font-body">
                    {language === 'mk' ? 'Истражи колекција' : 'Explore Collection'}
                  </p>
                  <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-ink-strong mb-4 leading-tight">
                    {getCategoryLabel(cat)}
                  </h2>
                  {getCategoryDescription(cat) && (
                    <p className="text-ink-base text-base md:text-lg mb-8 max-w-md leading-relaxed">
                      {getCategoryDescription(cat)}
                    </p>
                  )}
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="inline-flex items-center justify-center bg-ink-strong text-white font-medium px-8 py-3 rounded-full hover:bg-neutral-800 transition-colors w-fit text-sm"
                  >
                    {language === 'mk' ? 'Купи сега' : 'Shop Now'}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-ink-base hover:bg-white transition-colors shadow-soft"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-ink-base hover:bg-white transition-colors shadow-soft"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === current
                  ? 'bg-ink-strong w-6'
                  : 'bg-ink-strong/30 hover:bg-ink-strong/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
