'use client'

import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { Category } from '@/lib/supabase/types'

interface CategoryWithCount extends Category {
  product_count: number
}

interface CategorySidebarProps {
  categories: CategoryWithCount[]
  selectedSlug: string | null
  onSelectCategory: (slug: string | null) => void
  loading?: boolean
}

export default function CategorySidebar({
  categories,
  selectedSlug,
  onSelectCategory,
  loading = false,
}: CategorySidebarProps) {
  const { language, t } = useLanguage()

  const totalProducts = categories.reduce((sum, cat) => sum + cat.product_count, 0)

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-10 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-1">
        <h3 className="heading-5 px-4 mb-4">{t('nav.categories')}</h3>

        {/* All products */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
            selectedSlug === null
              ? 'bg-primary-100 text-primary-700 font-medium'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <span>{t('nav.allProducts')}</span>
          <span className={`text-sm ${selectedSlug === null ? 'text-primary-500' : 'text-neutral-400'}`}>
            {totalProducts}
          </span>
        </button>

        {/* Category list */}
        {categories.map((category) => {
          const name = getLocalizedField(category, 'name', language)
          const isActive = selectedSlug === category.slug

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.slug)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <span className="line-clamp-1">{name}</span>
              <span className={`text-sm ${isActive ? 'text-primary-500' : 'text-neutral-400'}`}>
                {category.product_count}
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
