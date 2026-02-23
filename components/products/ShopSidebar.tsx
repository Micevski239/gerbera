'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { Category, Occasion } from '@/lib/supabase/types'

interface ShopSidebarProps {
  categories: Category[]
  occasions: Occasion[]
  selectedCategory: string | null
  selectedOccasion: string | null
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
}

export default function ShopSidebar({
  categories,
  occasions,
  selectedCategory,
  selectedOccasion,
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
}: ShopSidebarProps) {
  const { language, t } = useLanguage()
  const [minInput, setMinInput] = useState(priceRange.min?.toString() || '')
  const [maxInput, setMaxInput] = useState(priceRange.max?.toString() || '')

  const handlePriceApply = () => {
    const min = minInput ? parseFloat(minInput) : null
    const max = maxInput ? parseFloat(maxInput) : null
    onPriceChange({ min, max })
  }

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePriceApply()
    }
  }

  const handleClearPrice = () => {
    setMinInput('')
    setMaxInput('')
    onPriceChange({ min: null, max: null })
  }

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {language === 'mk' ? 'Исчисти филтри' : 'Clear Filters'}
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
              onClick={() => onCategoryChange(null)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <span>{language === 'mk' ? 'Сите производи' : 'All Products'}</span>
              <span className={`text-sm ${selectedCategory === null ? 'text-primary-500' : 'text-neutral-400'}`}>
                {totalProducts}
              </span>
            </button>

            {/* Category List */}
            {categories.map((category) => {
              const name = getLocalizedField(category, 'name', language)
              const count = getCategoryCount(category.slug)
              const isActive = selectedCategory === category.slug

              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span className="line-clamp-1 font-handwriting text-lg">{name}</span>
                  <span className={`text-sm ${isActive ? 'text-primary-500' : 'text-neutral-400'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Occasions Section */}
        {occasions.length > 0 && (
          <>
            <div className="border-t border-neutral-200" />
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">
                {language === 'mk' ? 'Пригоди' : 'Occasions'}
              </h3>
              <div className="space-y-1">
                {occasions.map((occasion) => {
                  const label = getLocalizedField(occasion, 'name', language)
                  const isActive = selectedOccasion === occasion.slug
                  return (
                    <Link
                      key={occasion.id}
                      href={`/products?occasion=${occasion.slug}`}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <span className="line-clamp-1 font-handwriting text-lg">{label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}

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
                  onKeyDown={handlePriceKeyDown}
                  placeholder={language === 'mk' ? 'Мин' : 'Min'}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                />
              </div>
              <span className="text-neutral-400">-</span>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  onKeyDown={handlePriceKeyDown}
                  placeholder={language === 'mk' ? 'Макс' : 'Max'}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePriceApply}
                className="flex-1 px-3 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {language === 'mk' ? 'Примени' : 'Apply'}
              </button>
              {(priceRange.min !== null || priceRange.max !== null) && (
                <button
                  onClick={handleClearPrice}
                  className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  {language === 'mk' ? 'Исчисти' : 'Clear'}
                </button>
              )}
            </div>
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
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
              <input
                type="checkbox"
                checked={showOnSale}
                onChange={(e) => onSaleChange(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="flex items-center gap-2 text-neutral-700">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                  {language === 'mk' ? 'Попуст' : 'Sale'}
                </span>
                {language === 'mk' ? 'На попуст' : 'On Sale'}
              </span>
            </label>

            {/* Best Seller Checkbox */}
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
              <input
                type="checkbox"
                checked={showBestSeller}
                onChange={(e) => onBestSellerChange(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
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
    </aside>
  )
}
