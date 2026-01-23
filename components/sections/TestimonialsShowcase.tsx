'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import type { Testimonial } from '@/lib/supabase/types'
import { useTestimonials } from '@/hooks/useTestimonials'
import { getImageUrl } from '@/lib/supabase/client'

interface TestimonialsShowcaseProps {
  language: 'mk' | 'en'
}

interface FallbackTestimonial {
  id: string
  customer_name: string
  customer_location_mk: string | null
  customer_location_en: string | null
  content_mk: string
  content_en: string
  rating: number
  avatar_path: string | null
}

const fallbackTestimonials: FallbackTestimonial[] = []

export default function TestimonialsShowcase({ language }: TestimonialsShowcaseProps) {
  const { testimonials } = useTestimonials()

  const dataset = useMemo(() => (
    testimonials.length > 0 ? testimonials : fallbackTestimonials
  ), [testimonials])

  const getContent = (testimonial: Testimonial | FallbackTestimonial) => {
    return language === 'mk' ? testimonial.content_mk : testimonial.content_en
  }

  const getLocation = (testimonial: Testimonial | FallbackTestimonial) => {
    return language === 'mk' ? testimonial.customer_location_mk : testimonial.customer_location_en
  }

  const getAvatarUrl = (testimonial: Testimonial | FallbackTestimonial) => {
    if (!testimonial.avatar_path) return null
    return getImageUrl(testimonial.avatar_path)
  }

  // Duplicate for seamless loop
  const duplicatedData = [...dataset, ...dataset]

  return (
    <section className="bg-white">
      <div className="w-full px-6 md:px-12 py-16 space-y-8">
        {/* Header - Centered */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="eyebrow font-body">
            {language === 'mk' ? 'Што велат клиентите' : 'What clients say'}
          </p>
          <h2 className="font-heading text-ds-section text-ink-strong">
            {language === 'mk' ? 'Задоволни клиенти' : 'Our Happy Clients'}
          </h2>
        </div>

        {dataset.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-muted text-ds-body">
              {language === 'mk' ? 'Наскоро додаваме рецензии' : 'Testimonials coming soon'}
            </p>
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <div
              className="flex gap-4"
              style={{
                width: 'max-content',
                animation: `marquee ${dataset.length * 5}s linear infinite`,
              }}
            >
              {duplicatedData.map((testimonial, index) => {
                const avatarUrl = getAvatarUrl(testimonial)
                return (
                  <div
                    key={`${testimonial.id}-${index}`}
                    className="w-72 flex-shrink-0 rounded-xl border-2 border-[#880f4f] bg-neutral-50/50 p-5"
                  >
                    {/* Stars */}
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <svg key={i} className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="mt-3 text-sm text-neutral-600 leading-relaxed line-clamp-4">
                      "{getContent(testimonial)}"
                    </p>

                    {/* Author */}
                    <div className="mt-4 flex items-center gap-2.5">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-neutral-200 flex-shrink-0">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={testimonial.customer_name}
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-400">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">{testimonial.customer_name}</p>
                        <p className="text-xs text-neutral-500 truncate">{getLocation(testimonial)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <style jsx>{`
              @keyframes marquee {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
            `}</style>
          </div>
        )}
      </div>
    </section>
  )
}
