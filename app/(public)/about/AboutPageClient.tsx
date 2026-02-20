'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function AboutPageClient() {
  const { language } = useLanguage()
  const mk = language === 'mk'

  const values = [
    {
      title: mk ? 'Рачно изработено' : 'Handmade',
      desc: mk
        ? 'Секој производ е направен со раце, со внимание на секој детаљ.'
        : 'Every product is crafted by hand, with care given to every detail.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: mk ? 'Уникатни подароци' : 'Unique gifts',
      desc: mk
        ? 'Нема два исти производи. Секој подарок е посебен и незаборавен.'
        : 'No two products are alike. Every gift is special and memorable.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      title: mk ? 'Брза достава' : 'Fast delivery',
      desc: mk
        ? 'Испорачуваме брзо и безбедно, директно до вашата врата.'
        : 'We deliver fast and safely, straight to your door.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
    {
      title: mk ? 'Со љубов' : 'Made with love',
      desc: mk
        ? 'Вложуваме срце во секој производ, за да го направиме вашиот момент поспецијален.'
        : 'We pour our heart into every product, making your moment more special.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
    },
    {
      title: mk ? 'Пакување на подарок' : 'Gift wrapping',
      desc: mk
        ? 'Секој нарачан производ доаѓа убаво спакуван, готов за подарување.'
        : 'Every order comes beautifully wrapped, ready to be gifted.',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      title: mk ? 'WhatsApp нарачки' : 'WhatsApp orders',
      desc: mk
        ? 'Нарачувањето е едноставно — само пратете порака на WhatsApp.'
        : 'Ordering is simple — just send us a message on WhatsApp.',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="bg-canvas-100 text-ink-base">
      {/* Intro */}
      <div className="container-custom pt-14 pb-10 md:pt-20 md:pb-14 max-w-2xl text-center">
        <p className="eyebrow font-body mb-3">Gerbera Gifts</p>
        <h1 className="font-heading text-4xl md:text-5xl text-ink-strong mb-6 leading-tight">
          {mk ? 'За нас' : 'About us'}
        </h1>
        <p className="text-ink-base text-lg leading-relaxed mb-3">
          {mk
            ? 'Gerbera Gifts е бренд роден од страст кон уметноста на давање. Веруваме дека секој подарок треба да раскаже приказна.'
            : 'Gerbera Gifts is a brand born from a passion for the art of giving. We believe every gift should tell a story.'}
        </p>
        <p className="text-ink-muted leading-relaxed">
          {mk
            ? 'Секој производ е рачно изработен со внимание на деталите — за да го направиме вашиот момент уште поспецијален.'
            : 'Every product is handcrafted with attention to detail — to make your moment even more special.'}
        </p>
      </div>

      {/* Thin divider */}
      <div className="w-12 h-px bg-ink-muted/30 mx-auto" />

      {/* Values grid */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </div>

      {/* CTA */}
      <div className="container-custom pb-16 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 border border-ink-strong text-ink-strong text-sm font-medium px-8 py-3 rounded-full hover:bg-ink-strong hover:text-white transition-colors"
        >
          {mk ? 'Разгледај ја колекцијата' : 'Browse the collection'}
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
