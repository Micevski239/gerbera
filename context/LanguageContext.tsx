'use client'

import { createContext, useContext, ReactNode } from 'react'

interface LanguageContextType {
  language: 'mk'
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Helper to get Macedonian field from a DB object with _mk/_en suffixes
export function getLocalizedField<T extends object>(
  obj: T,
  field: string,
): string {
  const mkKey = `${field}_mk` as keyof T
  const fallbackKey = field as keyof T
  return (obj[mkKey] as string) || (obj[fallbackKey] as string) || ''
}

// Translations import
import { translations } from '@/i18n/translations'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: unknown = translations.mk

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

  return (
    <LanguageContext.Provider value={{ language: 'mk', t }}>
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

// Hook for getting Macedonian content from database objects
export function useLocalized<T extends object>(
  obj: T | null | undefined,
  field: string
): string {
  if (!obj) return ''
  return getLocalizedField(obj, field)
}
