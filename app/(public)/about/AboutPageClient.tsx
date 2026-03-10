'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import type { SiteStat } from '@/lib/supabase/types'

interface AboutPageClientProps {
  stats: SiteStat[]
}

function CountUp({ value, suffix, duration = 2000 }: { value: string; suffix?: string | null; duration?: number }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [display, setDisplay] = useState('0')
  const [hasAnimated, setHasAnimated] = useState(false)

  // Extract the numeric part from value (e.g. "500" from "500+", "3.5" from "3.5")
  const numericMatch = value.match(/^[\d,.]+/)
  const numericValue = numericMatch ? parseFloat(numericMatch[0].replace(/,/g, '')) : 0
  const textAfterNumber = numericMatch ? value.slice(numericMatch[0].length) : value
  const isDecimal = numericMatch ? numericMatch[0].includes('.') : false
  const decimalPlaces = isDecimal ? (numericMatch![0].split('.')[1]?.length || 0) : 0

  useEffect(() => {
    const el = ref.current
    if (!el || hasAnimated || numericValue === 0) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setHasAnimated(true)
        observer.disconnect()

        const start = performance.now()
        const animate = (now: number) => {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3)
          const current = eased * numericValue

          if (isDecimal) {
            setDisplay(current.toFixed(decimalPlaces))
          } else {
            setDisplay(Math.round(current).toLocaleString())
          }

          if (progress < 1) {
            requestAnimationFrame(animate)
          }
        }
        requestAnimationFrame(animate)
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasAnimated, numericValue, duration, isDecimal, decimalPlaces])

  // If the value is purely non-numeric, just show it
  if (!numericMatch || numericValue === 0) {
    return (
      <p className="font-heading text-3xl md:text-4xl text-primary-600">
        {value}{suffix && <span className="text-lg md:text-xl">{suffix}</span>}
      </p>
    )
  }

  return (
    <p ref={ref} className="font-heading text-3xl md:text-4xl text-primary-600">
      {display}{textAfterNumber}{suffix && <span className="text-lg md:text-xl">{suffix}</span>}
    </p>
  )
}

export default function AboutPageClient({ stats }: AboutPageClientProps) {
  const values = [
    {
      title: 'Рачно изработено',
      desc: 'Секој производ е направен со раце, со внимание на секој детаљ.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: 'Уникатни подароци',
      desc: 'Нема два исти производи. Секој подарок е посебен и незаборавен.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      title: 'Брза достава',
      desc: 'Испорачуваме брзо и безбедно, директно до вашата врата.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
    {
      title: 'Со љубов',
      desc: 'Вложуваме срце во секој производ, за да го направиме вашиот момент поспецијален.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
    },
    {
      title: 'Пакување на подарок',
      desc: 'Секој нарачан производ доаѓа убаво спакуван, готов за подарување.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: 'WhatsApp нарачки',
      desc: 'Нарачувањето е едноставно — само пратете порака на WhatsApp.',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="bg-canvas-100 text-ink-base">
      {/* Hero */}
      <section
        className="bg-secondary-50 relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/hero-background.webp')",
          backgroundSize: '400px 400px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
        }}
      >
        <div className="container-custom h-48 md:h-56 flex flex-col items-center justify-center text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-surface-base/80 backdrop-blur-sm rounded-full text-xs font-medium uppercase tracking-wider text-primary-600 mb-4">
            Gerbera Gifts
          </span>
          <h1 className="font-heading text-4xl md:text-5xl text-ink-strong mb-3">
            За нас
          </h1>
          <p className="text-ink-muted max-w-md mx-auto">
            Gerbera Gifts е бренд роден од страст кон уметноста на давање. Веруваме дека секој подарок треба да раскаже приказна.
          </p>
        </div>
      </section>

      {/* Stats counter */}
      {stats.length > 0 && (
        <div className="container-custom py-12 md:py-16">
          <div className={`grid gap-6 ${stats.length === 1 ? 'grid-cols-1' : stats.length === 2 ? 'grid-cols-2' : stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
            {stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <CountUp value={stat.value} suffix={stat.suffix_mk} />
                <p className="text-sm text-ink-muted mt-1">{stat.label_mk}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Values grid */}
      <div className="container-custom py-12 md:py-16">
        <ScrollReveal stagger={100} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-7 border border-border-soft flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-canvas-100 flex items-center justify-center text-ink-strong flex-shrink-0">
                {v.icon}
              </div>
              <div>
                <h3 className="font-heading text-base text-ink-strong mb-1">{v.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </ScrollReveal>
      </div>

      {/* CTA */}
      <ScrollReveal>
      <div className="container-custom pb-16 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 border border-ink-strong text-ink-strong text-sm font-medium px-8 py-3 rounded-full hover:bg-ink-strong hover:text-white transition-colors"
        >
          Разгледај ја колекцијата
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      </ScrollReveal>
    </div>
  )
}
