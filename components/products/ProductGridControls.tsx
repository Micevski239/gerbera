'use client'

import { useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import type { SortOption } from '@/hooks/useProducts'

export type ViewMode = 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5' | 'list'

interface ProductGridControlsProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  total: number
  showing: number
  onOpenFilter?: () => void
}

export default function ProductGridControls({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  total,
  showing,
  onOpenFilter,
}: ProductGridControlsProps) {
  const { t } = useLanguage()
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: t('sort.newest') },
    { value: 'oldest', label: t('sort.oldest') },
    { value: 'priceAsc', label: t('sort.priceAsc') },
    { value: 'priceDesc', label: t('sort.priceDesc') },
    { value: 'nameAsc', label: t('sort.nameAsc') },
    { value: 'nameDesc', label: t('sort.nameDesc') },
  ]

  const viewModes: { value: ViewMode; icon: React.ReactNode; label: string }[] = [
    {
      value: 'grid-2',
      label: '2 columns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      value: 'grid-3',
      label: '3 columns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="3" width="5" height="5" rx="1" />
          <rect x="9.5" y="3" width="5" height="5" rx="1" />
          <rect x="17" y="3" width="5" height="5" rx="1" />
          <rect x="2" y="11" width="5" height="5" rx="1" />
          <rect x="9.5" y="11" width="5" height="5" rx="1" />
          <rect x="17" y="11" width="5" height="5" rx="1" />
        </svg>
      ),
    },
    {
      value: 'grid-4',
      label: '4 columns',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="3" width="4" height="4" rx="0.5" />
          <rect x="8" y="3" width="4" height="4" rx="0.5" />
          <rect x="14" y="3" width="4" height="4" rx="0.5" />
          <rect x="20" y="3" width="2" height="4" rx="0.5" />
          <rect x="2" y="11" width="4" height="4" rx="0.5" />
          <rect x="8" y="11" width="4" height="4" rx="0.5" />
          <rect x="14" y="11" width="4" height="4" rx="0.5" />
          <rect x="20" y="11" width="2" height="4" rx="0.5" />
        </svg>
      ),
    },
    {
      value: 'list',
      label: t('common.listView'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
  ]

  return (
    <div className="mb-6 space-y-4">
      {/* Mobile filter button + search */}
      <div className="flex gap-3 lg:hidden">
        {onOpenFilter && (
          <button
            onClick={onOpenFilter}
            className="btn btn-outline flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('common.filter')}
          </button>
        )}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder={t('common.searchPlaceholder')}
            className={`input pl-10 ${isSearchFocused ? 'ring-4 ring-primary-100' : ''}`}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Desktop controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Results count */}
        <p className="text-sm text-neutral-500">
          {t('common.showingOf')
            .replace('{count}', String(showing))
            .replace('{total}', String(total))}
        </p>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Desktop search */}
          <div className="hidden lg:block relative w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('common.searchPlaceholder')}
              className="input pl-10 py-2"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="select py-2 min-w-[140px]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* View mode toggle - desktop only */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
            {viewModes.map((mode) => (
              <button
                key={mode.value}
                onClick={() => onViewModeChange(mode.value)}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === mode.value
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
                aria-label={mode.label}
                title={mode.label}
              >
                {mode.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
