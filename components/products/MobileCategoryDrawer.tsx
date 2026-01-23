'use client'

import { useEffect } from 'react'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { Category } from '@/lib/supabase/types'

interface CategoryWithCount extends Category {
  product_count: number
}

interface MobileCategoryDrawerProps {
  categories: CategoryWithCount[]
  selectedSlug: string | null
  onSelectCategory: (slug: string | null) => void
  isOpen: boolean
  onClose: () => void
}

export default function MobileCategoryDrawer({
  categories,
  selectedSlug,
  onSelectCategory,
  isOpen,
  onClose,
}: MobileCategoryDrawerProps) {
  const { language, t } = useLanguage()

  const totalProducts = categories.reduce((sum, cat) => sum + cat.product_count, 0)

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSelect = (slug: string | null) => {
    onSelectCategory(slug)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="overlay lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="drawer lg:hidden drawer-open">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-100">
            <h2 className="heading-5">{t('common.filter')}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label={t('common.close')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <div className="space-y-1">
              {/* All products */}
              <button
                onClick={() => handleSelect(null)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  selectedSlug === null
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span>{t('nav.allProducts')}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${selectedSlug === null ? 'text-primary-500' : 'text-neutral-400'}`}>
                    {totalProducts}
                  </span>
                  {selectedSlug === null && (
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>

              {/* Category list */}
              {categories.map((category) => {
                const name = getLocalizedField(category, 'name', language)
                const isActive = selectedSlug === category.slug

                return (
                  <button
                    key={category.id}
                    onClick={() => handleSelect(category.slug)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="line-clamp-1">{name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${isActive ? 'text-primary-500' : 'text-neutral-400'}`}>
                        {category.product_count}
                      </span>
                      {isActive && (
                        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-100 pb-safe">
            <button
              onClick={onClose}
              className="btn btn-primary w-full"
            >
              {t('common.viewAll')} ({selectedSlug ? categories.find(c => c.slug === selectedSlug)?.product_count : totalProducts})
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
