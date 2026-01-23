'use client'

import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/supabase/client'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { AboutContent, AboutStat } from '@/lib/supabase/types'

interface AboutSectionProps {
  content: AboutContent | null
  stats?: AboutStat[]
  showStats?: boolean
  showLink?: boolean
}

function StatIcon({ icon }: { icon: string | null }) {
  switch (icon) {
    case 'users':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    case 'package':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'heart':
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    default:
      return (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
  }
}

export default function AboutSection({ content, stats = [], showStats = true, showLink = true }: AboutSectionProps) {
  const { language, t } = useLanguage()

  if (!content) return null

  const title = getLocalizedField(content, 'title', language)
  const text = getLocalizedField(content, 'content', language)
  const imageUrl = content.image_path ? getImageUrl(content.image_path) : null

  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-100 shadow-card">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title || 'About us'}
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
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary-100 rounded-3xl -z-10" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-secondary-100 rounded-2xl -z-10" />
          </div>

          {/* Content */}
          <div>
            {title && (
              <h2 className="heading-2 mb-6">{title}</h2>
            )}
            <div className="prose prose-lg text-neutral-600 mb-8">
              <p className="leading-relaxed">{text}</p>
            </div>

            {/* Stats */}
            {showStats && stats.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => {
                  const label = getLocalizedField(stat, 'label', language)
                  return (
                    <div key={stat.id} className="text-center p-4 rounded-2xl bg-neutral-50">
                      <div className="text-primary-500 mb-2 flex justify-center">
                        <StatIcon icon={stat.icon} />
                      </div>
                      <p className="text-2xl font-bold text-gradient-warm">{stat.value}</p>
                      <p className="text-sm text-neutral-500 mt-1">{label}</p>
                    </div>
                  )
                })}
              </div>
            )}

            {showLink && (
              <Link href="/about" className="btn btn-primary">
                {t('common.learnMore')}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Quote section component
interface QuoteSectionProps {
  content: AboutContent | null
}

export function QuoteSection({ content }: QuoteSectionProps) {
  const { language } = useLanguage()

  if (!content) return null

  const quote = getLocalizedField(content, 'content', language)
  const author = getLocalizedField(content, 'author', language)

  return (
    <section className="section bg-gradient-to-r from-primary-500 to-secondary-500">
      <div className="container-narrow text-center text-white">
        <svg className="w-12 h-12 mx-auto mb-6 opacity-50" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <blockquote className="text-2xl md:text-3xl lg:text-4xl font-medium italic mb-6 leading-relaxed">
          {quote}
        </blockquote>
        {author && (
          <cite className="text-lg text-white/80 not-italic">
            — {author}
          </cite>
        )}
      </div>
    </section>
  )
}
