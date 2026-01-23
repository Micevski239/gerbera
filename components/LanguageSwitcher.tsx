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
      className="inline-flex h-10 w-10 flex-col items-center justify-center rounded-full bg-surface-base text-[11px] font-semibold text-ink-strong transition-colors hover:bg-state-hover"
      aria-label="Toggle language"
    >
      <span>{label}</span>
      <span className="text-[9px] leading-none text-ink-muted">^</span>
    </button>
  )
}
