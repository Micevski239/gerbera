'use client'

import { useLanguage } from '@/context/LanguageContext'
import type { Language } from '@/lib/supabase/types'

interface LanguageSwitcherProps {
  variant?: 'default' | 'dropdown'
}

export default function LanguageSwitcher({ variant = 'default' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()
  const toggleLanguage = () => setLanguage(language === 'mk' ? 'en' : 'mk')
  const label = language.toUpperCase()

  if (variant === 'dropdown') {
    const languages: { code: Language; label: string }[] = [
      { code: 'mk', label: 'MK' },
      { code: 'en', label: 'EN' },
    ]
    return (
      <div className="lang-switcher">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`lang-btn ${
              language === lang.code ? 'lang-btn-active' : 'lang-btn-inactive'
            }`}
            aria-label={`Switch to ${lang.label}`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex h-11 w-11 items-center justify-center rounded-full text-xs font-semibold text-neutral-600 transition-all duration-200 hover:text-primary-500 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label="Toggle language"
    >
      {label}
    </button>
  )
}
