'use client'

import { useLanguage } from '@/context/LanguageContext'
import { SOCIAL } from '@/lib/social'

export default function ContactPage() {
  const { language } = useLanguage()
  const mk = language === 'mk'

  const channels = [
    {
      label: 'WhatsApp',
      desc: mk ? 'Пишете ни директно на WhatsApp' : 'Message us directly on WhatsApp',
      value: '+389 78 448 400',
      href: SOCIAL.whatsapp,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      iconBg: 'bg-[#25D366]',
    },
    ...(SOCIAL.instagram ? [{
      label: 'Instagram',
      desc: mk ? 'Следете не на Instagram' : 'Follow us on Instagram',
      value: '@gerbera.gifts',
      href: SOCIAL.instagram,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
    }] : []),
    ...(process.env.NEXT_PUBLIC_FACEBOOK_URL ? [{
      label: 'Facebook',
      desc: mk ? 'Најдете не на Facebook' : 'Find us on Facebook',
      value: 'Gerbera Gifts',
      href: process.env.NEXT_PUBLIC_FACEBOOK_URL,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      iconBg: 'bg-blue-600',
    }] : []),
    ...(process.env.NEXT_PUBLIC_CONTACT_EMAIL ? [{
      label: mk ? 'Е-пошта' : 'Email',
      desc: mk ? 'Испратете ни порака' : 'Send us a message',
      value: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
      href: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: 'bg-ink-strong',
    }] : []),
  ]

  return (
    <div className="bg-canvas-100 text-ink-base">
      {/* Hero */}
      <section
        className="bg-secondary-50 relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/hero-background.png')",
          backgroundSize: '400px 400px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
        }}
      >
        <div className="container-custom py-12 md:py-16 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-surface-base/80 backdrop-blur-sm rounded-full text-xs font-medium uppercase tracking-wider text-primary-600 mb-4">
            Gerbera Gifts
          </span>
          <h1 className="font-heading text-4xl md:text-5xl text-ink-strong mb-3">
            {mk ? 'Контакт' : 'Contact'}
          </h1>
          <p className="text-ink-muted max-w-md mx-auto">
            {mk
              ? 'Секогаш сме тука за вас — пишете ни!'
              : 'We are always here for you — reach out!'}
          </p>
        </div>
      </section>

      {/* Contact channels */}
      <div className="container-custom py-12 md:py-16 max-w-3xl">
        <div className="text-center mb-10">
          <p className="eyebrow font-body mb-2">{mk ? 'Поврзете се со нас' : 'Get in touch'}</p>
          <h2 className="font-heading text-ds-section text-ink-strong">
            {mk ? 'Пишете ни' : 'Reach out'}
          </h2>
          <div className="w-12 h-px bg-ink-muted/40 mx-auto mt-4" />
        </div>

        <div className="flex flex-col gap-4">
          {channels.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target={ch.href.startsWith('mailto') ? undefined : '_blank'}
              rel={ch.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-5 bg-white border border-border-soft rounded-2xl px-6 py-5 hover:border-ink-strong/30 hover:shadow-soft transition-all group"
            >
              <div className={`w-12 h-12 rounded-full ${ch.iconBg} flex items-center justify-center text-white flex-shrink-0`}>
                {ch.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink-muted mb-0.5">{ch.desc}</p>
                <p className="font-semibold text-ink-strong truncate">{ch.value}</p>
              </div>
              <svg className="w-5 h-5 text-ink-muted group-hover:text-ink-strong transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
