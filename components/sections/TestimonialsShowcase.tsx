'use client'

import { useTestimonials } from '@/hooks/useTestimonials'
import type { Testimonial } from '@/lib/supabase/types'

interface TestimonialsShowcaseProps {
  language: 'mk' | 'en'
}

export default function TestimonialsShowcase({ language }: TestimonialsShowcaseProps) {
  const { testimonials } = useTestimonials({ limit: 5 })

  if (testimonials.length === 0) return null

  const getContent = (t: Testimonial) =>
    language === 'mk' ? t.content_mk : t.content_en

  const getLocation = (t: Testimonial) =>
    language === 'mk' ? t.customer_location_mk : t.customer_location_en

  return (
    <section className="bg-white border-t border-border-soft">
      <div className="container-custom py-16 md:py-20">
        {/* Eyebrow */}
        <p className="eyebrow font-body text-center mb-12">
          {language === 'mk' ? 'Задоволни клиенти' : 'Happy Clients'}
        </p>

        {/* Testimonials row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-0">
          {testimonials.map((t, i) => {
            const content = getContent(t)
            const location = getLocation(t)

            // Mobile (2-col): right border on left column, bottom border except last row
            // Desktop (5-col): right border on all except last
            const isLeftCol = i % 2 === 0
            const isLastRow = i >= testimonials.length - 2
            const isLastItem = i === testimonials.length - 1

            return (
              <div
                key={t.id}
                className={`px-4 py-4 flex flex-col gap-3 items-center text-center lg:items-start lg:text-left
                  ${isLeftCol ? 'border-r border-border-soft' : ''}
                  ${!isLastRow ? 'border-b border-border-soft' : ''}
                  lg:border-b-0
                  ${!isLastItem ? 'lg:border-r border-border-soft' : 'lg:border-r-0'}
                `}
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <svg key={j} className="h-3.5 w-3.5 fill-current text-accent-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-ink-base leading-relaxed italic flex-1">
                  &ldquo;{content}&rdquo;
                </p>

                {/* Author */}
                <div className="text-xs text-ink-muted">
                  <span className="font-semibold text-ink-strong not-italic">{t.customer_name}</span>
                  {location && <span className="ml-1">· {location}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
