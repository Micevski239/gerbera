'use client'

import { useLanguage } from '@/context/LanguageContext'
import type { SortOption } from '@/hooks/useProducts'

export type ViewMode = 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5'

interface ProductGridControlsProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  total: number
  showing: number
}

export default function ProductGridControls({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  total,
  showing,
}: ProductGridControlsProps) {
  const { t } = useLanguage()

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
  ]

  return (
    <div className="mb-6 space-y-4">
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
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="select py-2 w-[120px]"
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
