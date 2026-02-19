'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import type { Category } from '@/lib/supabase/types'

interface HeaderProps {
  categories?: Category[]
}

export default function Header({ categories = [] }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const { language, t } = useLanguage()

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const getCategoryLabel = (category: Category) => {
    if (language === 'mk') {
      return category.name_mk || category.name || category.name_en || ''
    }
    return category.name_en || category.name || category.name_mk || ''
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShopDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setShopDropdownOpen(false)
  }, [pathname])

  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    setShopDropdownOpen(true)
  }

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShopDropdownOpen(false)
    }, 150)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border-soft">
      <div className="max-w-shell mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="group flex-shrink-0">
            <div className="flex flex-col leading-none">
              <span className="font-heading text-2xl md:text-3xl tracking-wide text-ink-strong">
                Gerbera
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-ink-muted font-body">
                {language === 'mk' ? 'Момент на љубов' : 'A moment of love'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') && pathname === '/'
                  ? 'text-ink-strong'
                  : 'text-ink-muted hover:text-ink-strong'
              }`}
            >
              {t('nav.home')}
            </Link>

            {/* Shop with dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleDropdownEnter}
              onMouseLeave={handleDropdownLeave}
            >
              <Link
                href="/products"
                className={`text-sm font-medium transition-colors inline-flex items-center gap-1 ${
                  isActive('/products')
                    ? 'text-ink-strong'
                    : 'text-ink-muted hover:text-ink-strong'
                }`}
              >
                {t('nav.products')}
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${shopDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {/* Dropdown */}
              {shopDropdownOpen && categories.length > 0 && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-lg shadow-hero border border-border-soft py-2 animate-fade-in">
                  <Link
                    href="/products"
                    className="block px-4 py-2 text-sm text-ink-base hover:bg-state-hover hover:text-ink-strong transition-colors"
                  >
                    {t('nav.allProducts')}
                  </Link>
                  <div className="border-t border-border-soft my-1" />
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className="block px-4 py-2 text-sm text-ink-base hover:bg-state-hover hover:text-ink-strong transition-colors"
                    >
                      {getCategoryLabel(cat)}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className={`text-sm font-medium transition-colors text-neutral-400 cursor-not-allowed`}
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
            >
              {t('nav.about')}
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors text-neutral-400 cursor-not-allowed`}
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
            >
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* WhatsApp icon */}
            {whatsappNumber && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex p-2 text-ink-muted hover:text-[#25D366] transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            )}

            <LanguageSwitcher />

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ink-base hover:text-ink-strong transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-6 border-t border-border-soft animate-fade-in">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') && pathname === '/' ? 'bg-state-hover text-ink-strong' : 'text-ink-base hover:bg-state-hover'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/products"
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/products') ? 'bg-state-hover text-ink-strong' : 'text-ink-base hover:bg-state-hover'
                }`}
              >
                {t('nav.products')}
              </Link>

              {/* Mobile category sub-links */}
              {categories.length > 0 && (
                <div className="pl-4 flex flex-col gap-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className="px-4 py-2 text-sm text-ink-muted hover:text-ink-strong hover:bg-state-hover rounded-lg transition-colors"
                    >
                      {getCategoryLabel(cat)}
                    </Link>
                  ))}
                </div>
              )}

              <span className="px-4 py-3 text-sm text-neutral-400 cursor-not-allowed">
                {t('nav.about')}
              </span>
              <span className="px-4 py-3 text-sm text-neutral-400 cursor-not-allowed">
                {t('nav.contact')}
              </span>

              {/* Mobile WhatsApp */}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-4 mt-4 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-medium px-4 py-3 rounded-lg"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
