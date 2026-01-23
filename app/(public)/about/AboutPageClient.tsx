'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import AboutSection, { QuoteSection } from '@/components/AboutSection'
import TestimonialsSection from '@/components/TestimonialsSection'
import type { AboutContent, AboutStat, AboutGalleryImage, Testimonial } from '@/lib/supabase/types'

interface AboutPageClientProps {
  mainContent: AboutContent | null
  quoteContent: AboutContent | null
  stats: AboutStat[]
  gallery: AboutGalleryImage[]
  testimonials: Testimonial[]
}

function StatIcon({ icon }: { icon: string | null }) {
  switch (icon) {
    case 'users':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'package':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'heart':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    default:
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
  }
}

export default function AboutPageClient({
  mainContent,
  quoteContent,
  stats,
  gallery,
  testimonials,
}: AboutPageClientProps) {
  const { language, t } = useLanguage()

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-warm py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary-400 rounded-full blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <h1 className="heading-1 mb-4">
            <span className="text-gradient">{t('about.title')}</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto">
            {t('about.ourStory')}
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      {mainContent && (
        <section className="section bg-white">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Image */}
              <div className="relative">
                <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-100 shadow-card">
                  {mainContent.image_path ? (
                    <Image
                      src={getImageUrl(mainContent.image_path) || ''}
                      alt={getLocalizedField(mainContent, 'title', language) || 'About us'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
                      <svg className="w-24 h-24 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary-100 rounded-3xl -z-10" />
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary-100 rounded-2xl -z-10" />
              </div>

              {/* Content */}
              <div>
                {mainContent.title_mk && (
                  <h2 className="heading-2 mb-6">
                    {getLocalizedField(mainContent, 'title', language)}
                  </h2>
                )}
                <div className="prose prose-lg text-neutral-600">
                  <p className="leading-relaxed whitespace-pre-line">
                    {getLocalizedField(mainContent, 'content', language)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {stats.length > 0 && (
        <section className="section bg-neutral-50">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const label = getLocalizedField(stat, 'label', language)
                return (
                  <div key={stat.id} className="card p-8 text-center hover-lift">
                    <div className="text-primary-500 mb-4 flex justify-center">
                      <StatIcon icon={stat.icon} />
                    </div>
                    <p className="text-4xl md:text-5xl font-bold text-gradient-warm mb-2">
                      {stat.value}
                    </p>
                    <p className="text-neutral-600">{label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Quote Section */}
      {quoteContent && (
        <QuoteSection content={quoteContent} />
      )}

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section className="section bg-white">
          <div className="container-custom">
            <h2 className="heading-2 text-center mb-12">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((image, index) => {
                const imageUrl = getImageUrl(image.image_path)
                const caption = getLocalizedField(image, 'caption', language)
                return (
                  <div
                    key={image.id}
                    className={`relative overflow-hidden rounded-2xl hover-grow ${
                      index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                    }`}
                  >
                    <div className={`${index === 0 ? 'aspect-square' : 'aspect-square'} relative`}>
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={caption || `Gallery image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes={index === 0 ? '50vw' : '25vw'}
                        />
                      )}
                      {caption && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm">{caption}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-secondary-500 to-primary-500">
        <div className="container-custom text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.discoverMore')}
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            {t('contact.contactViaInstagram')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="btn bg-white text-primary-600 hover:bg-neutral-100"
            >
              {t('home.shopNow')}
            </Link>
            <Link
              href="/contact"
              className="btn border-2 border-white text-white hover:bg-white/10"
            >
              {t('contact.getInTouch')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
