'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Language } from '@/lib/supabase/types'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'gerbera-language'

// Helper to get localized field from an object
export function getLocalizedField<T extends object>(
  obj: T,
  field: string,
  language: Language
): string {
  const localizedKey = `${field}_${language}` as keyof T
  const fallbackKey = field as keyof T
  return (obj[localizedKey] as string) || (obj[fallbackKey] as string) || ''
}

// Translations import
import { translations } from '@/i18n/translations'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('mk')
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null
    if (stored && (stored === 'mk' || stored === 'en')) {
      setLanguageState(stored)
    }
    setMounted(true)
  }, [])

  // Save language to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
  }

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: unknown = translations[language]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    return typeof value === 'string' ? value : key
  }

  // Prevent hydration mismatch by rendering children only after mount
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: 'mk', setLanguage, t }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Hook for getting localized content from database objects
export function useLocalized<T extends object>(
  obj: T | null | undefined,
  field: string
): string {
  const { language } = useLanguage()
  if (!obj) return ''
  return getLocalizedField(obj, field, language)
}
