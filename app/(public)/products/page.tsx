'use client'

import { Suspense, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { CategorySidebar, MobileCategoryDrawer, ProductGridControls, LoadMoreButton } from '@/components/products'
import type { ViewMode } from '@/components/products'
import { useProducts, useCategories, SortOption } from '@/hooks'
import { useLanguage } from '@/context/LanguageContext'

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsContent />
    </Suspense>
  )
}

function ProductsPageFallback() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-center text-neutral-500 text-sm tracking-wide uppercase">
        Loading products...
      </div>
    </div>
  )
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category')

  const { t } = useLanguage()

  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)
  const [viewMode, setViewMode] = useState<ViewMode>('grid-4')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const { categories, loading: categoriesLoading } = useCategories()

  const {
    products,
    loading: productsLoading,
    hasMore,
    loadMore,
    total,
  } = useProducts({
    categorySlug: selectedCategory || undefined,
    sortBy,
    searchQuery: searchQuery.trim() || undefined,
    limit: 12,
  })

  // Filter products client-side for better UX during typing
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const search = searchQuery.toLowerCase()
    return products.filter(p =>
      p.name?.toLowerCase().includes(search) ||
      p.name_mk?.toLowerCase().includes(search) ||
      p.name_en?.toLowerCase().includes(search)
    )
  }, [products, searchQuery])

  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug)
  }

  const getGridClass = () => {
    switch (viewMode) {
      case 'grid-2':
        return 'product-grid-2'
      case 'grid-3':
        return 'product-grid-3'
      case 'grid-4':
        return 'product-grid-4'
      case 'grid-5':
        return 'product-grid-5'
      case 'list':
        return 'space-y-4'
      default:
        return 'product-grid-4'
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page header */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-custom py-8">
          <h1 className="heading-2">{t('nav.products')}</h1>
          <div className="w-16 h-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full mt-3" />
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <CategorySidebar
            categories={categories}
            selectedSlug={selectedCategory}
            onSelectCategory={handleCategorySelect}
            loading={categoriesLoading}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Controls */}
            <ProductGridControls
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              total={total}
              showing={filteredProducts.length}
              onOpenFilter={() => setFilterDrawerOpen(true)}
            />

            {/* Products grid */}
            {productsLoading && products.length === 0 ? (
              <div className={getGridClass()}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="card">
                    <div className="skeleton-image" />
                    <div className="p-4 space-y-3">
                      <div className="skeleton-text w-1/3" />
                      <div className="skeleton-title" />
                      <div className="skeleton-text w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="heading-4 mb-2">{t('common.noResults')}</h3>
                <p className="text-neutral-500">
                  {searchQuery
                    ? 'Try adjusting your search or filter'
                    : t('categories.noProducts')}
                </p>
              </div>
            ) : (
              <div className={getGridClass()}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={viewMode === 'list' ? 'horizontal' : 'default'}
                  />
                ))}
              </div>
            )}

            {/* Load more */}
            <LoadMoreButton
              onClick={loadMore}
              loading={productsLoading}
              hasMore={hasMore}
            />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileCategoryDrawer
        categories={categories}
        selectedSlug={selectedCategory}
        onSelectCategory={handleCategorySelect}
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      />
    </div>
  )
}
