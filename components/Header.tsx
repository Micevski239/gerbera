'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { SOCIAL } from '@/lib/social'
import { FacebookIcon, InstagramIcon, WhatsAppIcon, MenuIcon, CloseIcon } from '@/components/icons'
import type { Category } from '@/lib/supabase/types'

interface HeaderProps {
  categories?: Category[]
}

export default function Header({ categories = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { language, t } = useLanguage()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border-soft">
      <div className="max-w-shell mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16 md:grid md:grid-cols-3 md:h-20">
          {/* Logo - left */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex flex-col leading-none">
              <span className="font-heading text-2xl md:text-3xl tracking-wide text-ink-strong">
                Gerbera
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-ink-muted font-body">
                Момент на љубов
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - center */}
          <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') && pathname === '/' ? 'text-ink-strong' : 'text-ink-muted hover:text-ink-strong'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/products"
              className={`text-sm font-medium transition-colors ${
                isActive('/products') ? 'text-ink-strong' : 'text-ink-muted hover:text-ink-strong'
              }`}
            >
              {t('nav.products')}
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition-colors ${
                isActive('/about') ? 'text-ink-strong' : 'text-ink-muted hover:text-ink-strong'
              }`}
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors ${
                isActive('/contact') ? 'text-ink-strong' : 'text-ink-muted hover:text-ink-strong'
              }`}
            >
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Right side - right */}
          <div className="flex items-center gap-1 justify-self-end">

            {/* Social + WhatsApp icons - desktop only */}
            <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer"
              className="hidden md:flex p-2 text-ink-muted hover:text-ink-strong transition-colors" aria-label="Facebook">
              <FacebookIcon />
            </a>

            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
              className="hidden md:flex p-2 text-ink-muted hover:text-ink-strong transition-colors" aria-label="Instagram">
              <InstagramIcon />
            </a>

            <a href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer"
              className="hidden md:flex p-2 text-ink-muted hover:text-ink-strong transition-colors" aria-label="WhatsApp">
              <WhatsAppIcon />
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ink-base hover:text-ink-strong transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - full-width overlay below header */}
      <div
        className={`md:hidden fixed inset-x-0 top-16 bottom-0 bg-white z-40 transition-[opacity,transform] duration-300 ease-in-out ${
          mobileMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <nav className="flex flex-col h-full px-5 py-6 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className={`px-4 py-3.5 rounded-lg text-base font-medium transition-colors ${
                isActive('/') && pathname === '/' ? 'bg-state-hover text-ink-strong' : 'text-ink-base hover:bg-state-hover'
              }`}
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/products"
              className={`px-4 py-3.5 rounded-lg text-base font-medium transition-colors ${
                isActive('/products') ? 'bg-state-hover text-ink-strong' : 'text-ink-base hover:bg-state-hover'
              }`}
            >
              {t('nav.products')}
            </Link>
            <Link
              href="/about"
              className={`px-4 py-3.5 rounded-lg text-base font-medium transition-colors ${
                isActive('/about') ? 'bg-state-hover text-ink-strong' : 'text-ink-base hover:bg-state-hover'
              }`}
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/contact"
              className={`px-4 py-3.5 rounded-lg text-base font-medium transition-colors ${
                isActive('/contact') ? 'bg-state-hover text-ink-strong' : 'text-ink-base hover:bg-state-hover'
              }`}
            >
              {t('nav.contact')}
            </Link>
          </div>

          {/* Social links + WhatsApp - mobile */}
          <div className="pt-6 border-t border-border-soft mx-4 mt-6">
            <div className="flex items-center justify-center gap-4">
              <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer"
                className="p-2.5 text-ink-muted hover:text-ink-strong transition-colors" aria-label="Facebook">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer"
                className="p-2.5 text-ink-muted hover:text-ink-strong transition-colors" aria-label="Instagram">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href={SOCIAL.whatsapp} target="_blank" rel="noopener noreferrer"
                className="p-2.5 text-ink-muted hover:text-ink-strong transition-colors" aria-label="WhatsApp">
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

        </nav>
      </div>
    </header>
  )
}
