'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { HeroSlide } from '@/lib/supabase/types'

interface HeroCarouselProps {
  slides: HeroSlide[]
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const { language } = useLanguage()

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 5000)
  }

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide, slides.length])

  if (!slides.length) {
    return (
      <section className="bg-canvas-100">
        <div className="section-shell py-10 md:py-12">
          <div className="rounded-lg border border-border-soft bg-surface-base p-10 text-center shadow-card">
            <h1 className="font-heading text-ds-section text-ink-strong">Welcome to Gerbera</h1>
            <p className="mt-3 text-ds-body text-ink-muted">Add hero slides in the admin panel</p>
          </div>
        </div>
      </section>
    )
  }

  const slide = slides[currentSlide]
  const title = getLocalizedField(slide, 'title', language)
  const subtitle = getLocalizedField(slide, 'subtitle', language)
  const buttonText = getLocalizedField(slide, 'button_text', language)

  return (
    <section className="bg-canvas-100">
      <div className="section-shell py-10 md:py-12">
        <div className="relative overflow-hidden rounded-lg border border-border-soft bg-surface-base shadow-card">
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            {slides.map((s, index) => {
              const imageUrl = getImageUrl(s.image_path)
              return (
                <div
                  key={s.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={getLocalizedField(s, 'title', language)}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 1400px"
                    />
                  ) : (
                    <div className="h-full w-full bg-canvas-200" />
                  )}
                </div>
              )
            })}

            <div className="absolute inset-0 z-10 bg-gradient-to-r from-ink-strong/70 via-ink-strong/40 to-transparent" />

            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-md rounded-lg bg-surface-base/95 px-5 py-6 shadow-card md:ml-8 md:px-8 md:py-8">
                <div className="h-0.5 w-10 bg-accent-coral" />
                <h1 className="mt-4 font-heading text-ds-title text-ink-strong">{title}</h1>
                {subtitle && (
                  <p className="mt-3 text-ds-body text-ink-muted">{subtitle}</p>
                )}
                {buttonText && slide.button_link && (
                  <Link href={slide.button_link} className="btn-primary mt-5">
                    {buttonText}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {slides.length > 1 && (
            <div className="absolute bottom-5 right-5 z-30 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-pill transition-all ${
                    index === currentSlide ? 'w-8 bg-ink-strong' : 'w-2 bg-ink-muted/50 hover:bg-ink-muted'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
