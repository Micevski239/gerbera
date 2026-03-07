'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import ProductCard from '@/components/ProductCard'
import ShopSidebar from '@/components/products/ShopSidebar'
import MobileShopFilter from '@/components/products/MobileShopFilter'
import ProductGridControls, { type ViewMode } from '@/components/products/ProductGridControls'
import LoadMoreButton from '@/components/products/LoadMoreButton'
import type { SortOption } from '@/hooks/useProducts'
import type { Category, Product, Occasion, ProductOccasion } from '@/lib/supabase/types'

interface ProductWithCategory extends Product {
  category_slug: string
  category_name: string
  category_name_mk: string
  category_name_en: string
}

interface ProductOccasionLink extends ProductOccasion {
  occasion_slug: string
}

interface ShopPageClientProps {
  categories: Category[]
  products: ProductWithCategory[]
  occasions: Occasion[]
  productOccasions: ProductOccasionLink[]
}

const PRODUCTS_PER_PAGE = 12

export default function ShopPageClient({ categories, products, occasions, productOccasions }: ShopPageClientProps) {
  const { language } = useLanguage()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const occasionParam = searchParams.get('occasion')

  const [selectedCategory, setSelectedCategory] = useState<string | null>(() =>
    categoryParam && categoryParam.length > 0 ? categoryParam : null
  )
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(() =>
    occasionParam && occasionParam.length > 0 ? occasionParam : null
  )
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null })
  const [showOnSale, setShowOnSale] = useState(false)
  const [showBestSeller, setShowBestSeller] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid-4')
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE)

  useEffect(() => {
    setSelectedCategory(categoryParam && categoryParam.length > 0 ? categoryParam : null)
  }, [categoryParam])

  useEffect(() => {
    setSelectedOccasion(occasionParam && occasionParam.length > 0 ? occasionParam : null)
  }, [occasionParam])

  const productOccasionMap = useMemo(() => {
    const map = new Map<string, Set<string>>()
    productOccasions.forEach((row) => {
      if (!row.occasion_slug) return
      if (!map.has(row.product_id)) map.set(row.product_id, new Set())
      map.get(row.product_id)?.add(row.occasion_slug)
    })
    return map
  }, [productOccasions])

  const filteredProducts = useMemo(() => {
    let result = products

    // Sidebar filters
    if (selectedCategory) result = result.filter(p => p.category_slug === selectedCategory)
    if (selectedOccasion) result = result.filter(p => productOccasionMap.get(p.id)?.has(selectedOccasion))
    if (priceRange.min !== null) result = result.filter(p => (p.price || 0) >= priceRange.min!)
    if (priceRange.max !== null) result = result.filter(p => (p.price || 0) <= priceRange.max!)
    if (showOnSale) result = result.filter(p => p.is_on_sale)
    if (showBestSeller) result = result.filter(p => p.is_best_seller)

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'priceAsc': return (a.price || 0) - (b.price || 0)
        case 'priceDesc': return (b.price || 0) - (a.price || 0)
        case 'nameAsc': return (a.name || '').localeCompare(b.name || '')
        case 'nameDesc': return (b.name || '').localeCompare(a.name || '')
        default: return 0
      }
    })

    return result
  }, [products, selectedCategory, selectedOccasion, priceRange, showOnSale, showBestSeller, productOccasionMap, sortBy])

  // Reset display count when filters/sort change
  useEffect(() => {
    setDisplayCount(PRODUCTS_PER_PAGE)
  }, [selectedCategory, selectedOccasion, priceRange, showOnSale, showBestSeller, sortBy])

  const visibleProducts = useMemo(() => filteredProducts.slice(0, displayCount), [filteredProducts, displayCount])
  const hasMore = displayCount < filteredProducts.length

  const handleLoadMore = useCallback(() => {
    setDisplayCount(prev => prev + PRODUCTS_PER_PAGE)
  }, [])

  const getCategoryCount = (slug: string) => products.filter(p => p.category_slug === slug).length

  const hasActiveFilters = selectedCategory !== null || selectedOccasion !== null ||
    priceRange.min !== null || priceRange.max !== null || showOnSale || showBestSeller

  const updateQueryParams = useCallback((updates: { category?: string | null; occasion?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('search')

    if ('category' in updates) {
      if (updates.category) {
        params.set('category', updates.category)
      } else {
        params.delete('category')
      }
    }

    if ('occasion' in updates) {
      if (updates.occasion) {
        params.set('occasion', updates.occasion)
      } else {
        params.delete('occasion')
      }
    }

    const nextQuery = params.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  const handleCategoryChange = useCallback((slug: string | null) => {
    setSelectedCategory(slug)
    updateQueryParams({ category: slug })
  }, [updateQueryParams])

  const handleOccasionChange = useCallback((slug: string | null) => {
    setSelectedOccasion(slug)
    updateQueryParams({ occasion: slug })
  }, [updateQueryParams])

  const handleClearFilters = useCallback(() => {
    setSelectedCategory(null)
    setSelectedOccasion(null)
    setPriceRange({ min: null, max: null })
    setShowOnSale(false)
    setShowBestSeller(false)
    updateQueryParams({ category: null, occasion: null })
  }, [updateQueryParams])

  const getGridClass = () => {
    switch (viewMode) {
      case 'grid-2': return 'grid grid-cols-2 gap-4 md:gap-5'
      case 'grid-3': return 'grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5'
      case 'grid-5': return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5'
      case 'grid-4':
      default: return 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5'
    }
  }

  return (
    <div className="bg-canvas-100 text-ink-base">
      {/* Hero */}
      <section
        className="bg-secondary-50 relative overflow-hidden"
        style={{
          backgroundImage: "url('/images/hero-background.png')",
          backgroundSize: '400px 400px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
        }}
      >
        <div className="container-custom py-12 md:py-16 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 bg-surface-base/80 backdrop-blur-sm rounded-full text-xs font-medium uppercase tracking-wider text-primary-600 mb-4">
            {language === 'mk' ? 'Нашата колекција' : 'Our Collection'}
          </span>
          <h1 className="font-heading text-4xl md:text-5xl text-ink-strong mb-3">
            {language === 'mk' ? 'Сите производи' : 'All Products'}
          </h1>
          <p className="text-ink-muted max-w-md mx-auto">
            {language === 'mk'
              ? 'Пронајдете го совршениот подарок за вашите најблиски'
              : 'Find the perfect gift for your loved ones'}
          </p>
        </div>
      </section>

      {/* Mobile filter bar */}
      <div className="lg:hidden border-b border-border-soft bg-white">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-muted">
              {language === 'mk' ? `${filteredProducts.length} производи` : `${filteredProducts.length} products`}
            </p>
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-full text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {language === 'mk' ? 'Филтри' : 'Filters'}
              {hasActiveFilters && (
                <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-ink-strong text-white rounded-full">
                  {[selectedCategory, selectedOccasion, priceRange.min, priceRange.max, showOnSale, showBestSeller].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar + grid layout */}
      <div className="container-custom py-8">
        <div className="flex gap-8">
          <ShopSidebar
            categories={categories}
            occasions={occasions}
            selectedCategory={selectedCategory}
            selectedOccasion={selectedOccasion}
            onCategoryChange={handleCategoryChange}
            onOccasionChange={handleOccasionChange}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            showOnSale={showOnSale}
            onSaleChange={setShowOnSale}
            showBestSeller={showBestSeller}
            onBestSellerChange={setShowBestSeller}
            totalProducts={products.length}
            getCategoryCount={getCategoryCount}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <div className="flex-1 min-w-0">
            {/* Grid Controls */}
            <div className="hidden lg:block">
              <ProductGridControls
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortBy={sortBy}
                onSortChange={setSortBy}
                total={filteredProducts.length}
                showing={visibleProducts.length}
              />
            </div>

            {/* Mobile sort */}
            <div className="lg:hidden mb-4 flex justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-44 px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">{language === 'mk' ? 'Најнови' : 'Newest'}</option>
                <option value="oldest">{language === 'mk' ? 'Најстари' : 'Oldest'}</option>
                <option value="priceAsc">{language === 'mk' ? 'Цена: ниска - висока' : 'Price: Low to High'}</option>
                <option value="priceDesc">{language === 'mk' ? 'Цена: висока - ниска' : 'Price: High to Low'}</option>
                <option value="nameAsc">{language === 'mk' ? 'Име: А - Ш' : 'Name: A - Z'}</option>
                <option value="nameDesc">{language === 'mk' ? 'Име: Ш - А' : 'Name: Z - A'}</option>
              </select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-heading font-semibold text-ink-strong mb-2">
                  {language === 'mk' ? 'Нема пронајдени производи' : 'No products found'}
                </h3>
                <p className="text-ink-muted text-sm mb-6 max-w-xs mx-auto">
                  {language === 'mk'
                    ? 'Пробајте да ги промените филтрите'
                    : 'Try adjusting your filters'}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {language === 'mk' ? 'Исчисти сè' : 'Clear all'}
                </button>
              </div>
            ) : (
              <>
                <div className={getGridClass()}>
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      variant="shop"
                    />
                  ))}
                </div>
                <LoadMoreButton
                  onClick={handleLoadMore}
                  loading={false}
                  hasMore={hasMore}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <MobileShopFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        showOnSale={showOnSale}
        onSaleChange={setShowOnSale}
        showBestSeller={showBestSeller}
        onBestSellerChange={setShowBestSeller}
        totalProducts={products.length}
        getCategoryCount={getCategoryCount}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filteredCount={filteredProducts.length}
      />
    </div>
  )
}
