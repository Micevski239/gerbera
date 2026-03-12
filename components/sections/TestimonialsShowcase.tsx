'use client'

import ScrollReveal from '@/components/ScrollReveal'
import { StarIcon } from '@/components/icons'
import type { Testimonial } from '@/lib/supabase/types'

interface TestimonialsShowcaseProps {
  language: 'mk'
  testimonials?: Testimonial[]
}

export default function TestimonialsShowcase({ language, testimonials = [] }: TestimonialsShowcaseProps) {
  if (testimonials.length === 0) return null

  const getContent = (t: Testimonial) => t.content_mk

  const getLocation = (t: Testimonial) => t.customer_location_mk

  return (
    <section className="bg-white border-t border-border-soft">
      <div className="container-custom py-16 md:py-20">
        {/* Eyebrow */}
        <p className="eyebrow font-body text-center mb-12">
          Задоволни клиенти
        </p>

        {/* Testimonials row */}
        <ScrollReveal
          stagger={80}
          className="grid grid-cols-2 lg:grid-cols-3 gap-0"
        >
          {testimonials.map((t, i) => {
            const content = getContent(t)
            const location = getLocation(t)

            // Mobile (2-col): right border on left column, bottom border except last row
            // Desktop (3-col): right border except every 3rd, bottom border except last row
            const isLeftCol = i % 2 === 0
            const mobileLastRow = i >= testimonials.length - (testimonials.length % 2 === 0 ? 2 : 1)
            const lgCol = i % 3
            const lgLastRow = i >= testimonials.length - (testimonials.length % 3 === 0 ? 3 : testimonials.length % 3)

            return (
              <div
                key={t.id}
                className={`px-4 py-4 flex flex-col gap-3 items-center text-center lg:items-start lg:text-left
                  ${isLeftCol ? 'border-r border-border-soft' : ''}
                  ${!mobileLastRow ? 'border-b border-border-soft' : ''}
                  ${lgCol < 2 ? 'lg:border-r lg:border-border-soft' : 'lg:border-r-0'}
                  ${!lgLastRow ? 'lg:border-b lg:border-border-soft' : 'lg:border-b-0'}
                `}
              >
                {/* Stars */}
                <div className="flex gap-0.5 text-accent-400">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <StarIcon key={j} className="h-3.5 w-3.5 fill-current" />
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
        </ScrollReveal>
      </div>
    </section>
  )
}
