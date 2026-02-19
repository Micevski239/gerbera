'use client'

import Image from 'next/image'
import { useTestimonials } from '@/hooks/useTestimonials'
import { getImageUrl } from '@/lib/supabase/client'
import type { Testimonial } from '@/lib/supabase/types'

interface TestimonialsShowcaseProps {
  language: 'mk' | 'en'
}

export default function TestimonialsShowcase({ language }: TestimonialsShowcaseProps) {
  const { testimonials } = useTestimonials({ limit: 3 })

  // Render nothing if no testimonials
  if (testimonials.length === 0) return null

  const getContent = (t: Testimonial) =>
    language === 'mk' ? t.content_mk : t.content_en

  const getLocation = (t: Testimonial) =>
    language === 'mk' ? t.customer_location_mk : t.customer_location_en

  return (
    <section className="relative bg-canvas-200">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url(/images/hero-background.png)',
          backgroundSize: '400px',
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="absolute inset-0 bg-canvas-200/70" />

      <div className="relative container-custom py-16 md:py-20">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="eyebrow font-body">
            {language === 'mk' ? 'Што велат клиентите' : 'What clients say'}
          </p>
          <h2 className="font-heading text-ds-section text-ink-strong">
            {language === 'mk' ? 'Задоволни клиенти' : 'Our Happy Clients'}
          </h2>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => {
            const avatarUrl = testimonial.avatar_path
              ? getImageUrl(testimonial.avatar_path)
              : null
            const location = getLocation(testimonial)

            return (
              <div
                key={testimonial.id}
                className="relative bg-surface-base rounded-2xl border border-border-soft shadow-soft p-6 pt-8"
              >
                {/* Decorative quote mark */}
                <span className="absolute top-3 left-5 text-6xl leading-none font-serif text-primary-100 select-none pointer-events-none">
                  &ldquo;
                </span>

                {/* Quote text */}
                <p className="relative text-base text-ink-base leading-relaxed mt-4 mb-6">
                  {getContent(testimonial)}
                </p>

                {/* Star rating */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 fill-current text-accent-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-primary-50 flex-shrink-0">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={testimonial.customer_name}
                        fill
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary-300">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-strong truncate">
                      {testimonial.customer_name}
                    </p>
                    {location && (
                      <p className="text-xs text-ink-muted truncate">{location}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
