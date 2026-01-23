'use client'

import { useState, useEffect } from 'react'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { Category } from '@/lib/supabase/types'

interface MobileShopFilterProps {
  categories: Category[]
  selectedCategory: string | null
  onCategoryChange: (slug: string | null) => void
  priceRange: { min: number | null; max: number | null }
  onPriceChange: (range: { min: number | null; max: number | null }) => void
  showOnSale: boolean
  onSaleChange: (checked: boolean) => void
  showBestSeller: boolean
  onBestSellerChange: (checked: boolean) => void
  totalProducts: number
  getCategoryCount: (slug: string) => number
  onClearFilters: () => void
  hasActiveFilters: boolean
  isOpen: boolean
  onClose: () => void
  filteredCount: number
}

export default function MobileShopFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  showOnSale,
  onSaleChange,
  showBestSeller,
  onBestSellerChange,
  totalProducts,
  getCategoryCount,
  onClearFilters,
  hasActiveFilters,
  isOpen,
  onClose,
  filteredCount,
}: MobileShopFilterProps) {
  const { language, t } = useLanguage()
  const [minInput, setMinInput] = useState(priceRange.min?.toString() || '')
  const [maxInput, setMaxInput] = useState(priceRange.max?.toString() || '')

  // Sync local state with prop changes
  useEffect(() => {
    setMinInput(priceRange.min?.toString() || '')
    setMaxInput(priceRange.max?.toString() || '')
  }, [priceRange])

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

  const handlePriceApply = () => {
    const min = minInput ? parseFloat(minInput) : null
    const max = maxInput ? parseFloat(maxInput) : null
    onPriceChange({ min, max })
  }

  const handleClearPrice = () => {
    setMinInput('')
    setMaxInput('')
    onPriceChange({ min: null, max: null })
  }

  const handleCategorySelect = (slug: string | null) => {
    onCategoryChange(slug)
  }

  const handleApplyAndClose = () => {
    handlePriceApply()
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-full max-w-sm bg-white z-50 lg:hidden shadow-xl transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">
              {language === 'mk' ? 'Филтри' : 'Filters'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label={language === 'mk' ? 'Затвори' : 'Close'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-accent-burgundy-600 hover:text-accent-burgundy-700 border border-accent-burgundy-200 hover:bg-accent-burgundy-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {language === 'mk' ? 'Исчисти филтри' : 'Clear All Filters'}
              </button>
            )}

            {/* Categories Section */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">
                {t('nav.categories')}
              </h3>
              <div className="space-y-1">
                {/* All Products */}
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                    selectedCategory === null
                      ? 'bg-accent-burgundy-50 text-accent-burgundy-700 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>{language === 'mk' ? 'Сите производи' : 'All Products'}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${selectedCategory === null ? 'text-accent-burgundy-500' : 'text-neutral-400'}`}>
                      {totalProducts}
                    </span>
                    {selectedCategory === null && (
                      <svg className="w-5 h-5 text-accent-burgundy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Category List */}
                {categories.map((category) => {
                  const name = getLocalizedField(category, 'name', language)
                  const count = getCategoryCount(category.slug)
                  const isActive = selectedCategory === category.slug

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.slug)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-accent-burgundy-50 text-accent-burgundy-700 font-medium'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <span className="line-clamp-1">{name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isActive ? 'text-accent-burgundy-500' : 'text-neutral-400'}`}>
                          {count}
                        </span>
                        {isActive && (
                          <svg className="w-5 h-5 text-accent-burgundy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200" />

            {/* Price Range Section */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">
                {language === 'mk' ? 'Цена' : 'Price'}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={minInput}
                      onChange={(e) => setMinInput(e.target.value)}
                      placeholder={language === 'mk' ? 'Мин' : 'Min'}
                      className="w-full px-3 py-3 text-base border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <span className="text-neutral-400">-</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={maxInput}
                      onChange={(e) => setMaxInput(e.target.value)}
                      placeholder={language === 'mk' ? 'Макс' : 'Max'}
                      className="w-full px-3 py-3 text-base border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-burgundy-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>
                {(priceRange.min !== null || priceRange.max !== null) && (
                  <button
                    onClick={handleClearPrice}
                    className="text-sm text-accent-burgundy-600 hover:text-accent-burgundy-700"
                  >
                    {language === 'mk' ? 'Исчисти цена' : 'Clear price'}
                  </button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-200" />

            {/* Tags Section */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">
                {language === 'mk' ? 'Ознаки' : 'Tags'}
              </h3>
              <div className="space-y-2">
                {/* On Sale Checkbox */}
                <label className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={showOnSale}
                    onChange={(e) => onSaleChange(e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 text-accent-burgundy-600 focus:ring-accent-burgundy-500"
                  />
                  <span className="flex items-center gap-2 text-neutral-700">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                      {language === 'mk' ? 'Попуст' : 'Sale'}
                    </span>
                    {language === 'mk' ? 'На попуст' : 'On Sale'}
                  </span>
                </label>

                {/* Best Seller Checkbox */}
                <label className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={showBestSeller}
                    onChange={(e) => onBestSellerChange(e.target.checked)}
                    className="w-5 h-5 rounded border-neutral-300 text-accent-burgundy-600 focus:ring-accent-burgundy-500"
                  />
                  <span className="flex items-center gap-2 text-neutral-700">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                      {language === 'mk' ? 'Топ' : 'Best'}
                    </span>
                    {language === 'mk' ? 'Најпродаван' : 'Best Seller'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200 bg-white safe-area-inset-bottom">
            <button
              onClick={handleApplyAndClose}
              className="w-full py-3 px-4 bg-accent-burgundy-600 text-white font-medium rounded-lg hover:bg-accent-burgundy-700 transition-colors"
            >
              {language === 'mk'
                ? `Прикажи ${filteredCount} производи`
                : `Show ${filteredCount} Products`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
