'use client'

import { useState } from 'react'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { Category, Occasion } from '@/lib/supabase/types'

interface ShopSidebarProps {
  categories: Category[]
  occasions: Occasion[]
  selectedCategory: string | null
  selectedOccasion: string | null
  onCategoryChange: (slug: string | null) => void
  onOccasionChange: (slug: string | null) => void
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
  onOccasionChange,
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
  const { t } = useLanguage()
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
            Исчисти филтри
          </button>
        )}

        {/* Categories Section */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">
            {t('nav.categories')}
          </h3>
          <div className="space-y-1">
            <button
              onClick={() => onCategoryChange(null)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors duration-200 ${
                selectedCategory === null
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <span>Сите производи</span>
              <span className={`text-sm ${selectedCategory === null ? 'text-primary-500' : 'text-neutral-400'}`}>
                {totalProducts}
              </span>
            </button>

            {categories.map((category) => {
              const name = getLocalizedField(category, 'name')
              const count = getCategoryCount(category.slug)
              const isActive = selectedCategory === category.slug

              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span className="line-clamp-1 font-body text-sm">{name}</span>
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
                Пригоди
              </h3>
              <div className="space-y-1">
                {occasions.map((occasion) => {
                  const label = getLocalizedField(occasion, 'name')
                  const isActive = selectedOccasion === occasion.slug
                  return (
                    <button
                      key={occasion.id}
                      onClick={() => onOccasionChange(isActive ? null : occasion.slug)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors duration-200 ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <span className="line-clamp-1 font-body text-sm">{label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <div className="border-t border-neutral-200" />

        {/* Price Range Section */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">
            Цена
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  onKeyDown={handlePriceKeyDown}
                  placeholder="Мин"
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
                  placeholder="Макс"
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
                Примени
              </button>
              {(priceRange.min !== null || priceRange.max !== null) && (
                <button
                  onClick={handleClearPrice}
                  className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Исчисти
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200" />

        {/* Tags Section */}
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-3">
            Ознаки
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
              <input
                type="checkbox"
                checked={showOnSale}
                onChange={(e) => onSaleChange(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="flex items-center gap-2 text-neutral-700">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                  Попуст
                </span>
                На попуст
              </span>
            </label>

            <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
              <input
                type="checkbox"
                checked={showBestSeller}
                onChange={(e) => onBestSellerChange(e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="flex items-center gap-2 text-neutral-700">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                  Топ
                </span>
                Најпродаван
              </span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  )
}
