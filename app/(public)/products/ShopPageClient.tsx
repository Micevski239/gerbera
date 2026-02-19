'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import ProductCard from '@/components/ProductCard'
import ShopSidebar from '@/components/products/ShopSidebar'
import MobileShopFilter from '@/components/products/MobileShopFilter'
import type { Category, Product, Occasion, ProductOccasion } from '@/lib/supabase/types'

// Extended product type with category info
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

export default function ShopPageClient({ categories, products, occasions, productOccasions }: ShopPageClientProps) {
  const { language, t } = useLanguage()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const occasionParam = searchParams.get('occasion')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(() => (
    categoryParam && categoryParam.length > 0 ? categoryParam : null
  ))
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(() => (
    occasionParam && occasionParam.length > 0 ? occasionParam : null
  ))
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  })
  const [showOnSale, setShowOnSale] = useState(false)
  const [showBestSeller, setShowBestSeller] = useState(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  useEffect(() => {
    if (categoryParam && categoryParam.length > 0) {
      setSelectedCategory(categoryParam)
    } else {
      setSelectedCategory(null)
    }
  }, [categoryParam])

  useEffect(() => {
    if (occasionParam && occasionParam.length > 0) {
      setSelectedOccasion(occasionParam)
    } else {
      setSelectedOccasion(null)
    }
  }, [occasionParam])

  // Filter products by all criteria
  const productOccasionMap = useMemo(() => {
    const map = new Map<string, Set<string>>()
    productOccasions.forEach((row) => {
      if (!row.occasion_slug) return
      if (!map.has(row.product_id)) {
        map.set(row.product_id, new Set())
      }
      map.get(row.product_id)?.add(row.occasion_slug)
    })
    return map
  }, [productOccasions])

  const filteredProducts = useMemo(() => {
    let result = products

    // Category filter
    if (selectedCategory) {
      result = result.filter(p => p.category_slug === selectedCategory)
    }

    // Occasion filter
    if (selectedOccasion) {
      result = result.filter((product) => productOccasionMap.get(product.id)?.has(selectedOccasion))
    }

    // Price filter
    if (priceRange.min !== null) {
      result = result.filter(p => (p.price || 0) >= priceRange.min!)
    }
    if (priceRange.max !== null) {
      result = result.filter(p => (p.price || 0) <= priceRange.max!)
    }

    // Sale filter
    if (showOnSale) {
      result = result.filter(p => p.is_on_sale)
    }

    // Best seller filter
    if (showBestSeller) {
      result = result.filter(p => p.is_best_seller)
    }

    return result
  }, [products, selectedCategory, selectedOccasion, priceRange, showOnSale, showBestSeller, productOccasionMap])

  // Get product count per category (from unfiltered products)
  const getCategoryCount = (slug: string) => {
    return products.filter(p => p.category_slug === slug).length
  }

  const getOccasionLabel = (slug: string) => {
    const occasion = occasions.find((item) => item.slug === slug)
    if (!occasion) return slug
    return language === 'mk' ? occasion.name_mk : occasion.name_en
  }

  // Check if any filters are active
  const hasActiveFilters = selectedCategory !== null ||
    selectedOccasion !== null ||
    priceRange.min !== null ||
    priceRange.max !== null ||
    showOnSale ||
    showBestSeller

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategory(null)
    setSelectedOccasion(null)
    setPriceRange({ min: null, max: null })
    setShowOnSale(false)
    setShowBestSeller(false)
  }

  return (
    <div className="min-h-screen bg-canvas-100 text-ink-base">
      <main>
        {/* Mini Hero Section */}
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
              {t('nav.products')}
            </h1>
            <p className="text-ink-base max-w-md mx-auto">
              {language === 'mk'
                ? 'Пронајдете го совршениот подарок за вашите најблиски'
                : 'Find the perfect gift for your loved ones'}
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="bg-surface-base border-b border-neutral-100 sticky top-0 z-30">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-muted">
                {language === 'mk'
                  ? `${filteredProducts.length} производи`
                  : `${filteredProducts.length} products`}
              </p>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="font-medium text-sm">
                  {language === 'mk' ? 'Филтри' : 'Filters'}
                </span>
                {hasActiveFilters && (
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-primary-600 text-white rounded-full">
                    {[selectedCategory, priceRange.min, priceRange.max, showOnSale, showBestSeller].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Main Content - Sidebar + Grid */}
        <section className="bg-surface-base">
          <div className="container-custom py-8">
            <div className="flex gap-8">
              {/* Sidebar - Desktop Only */}
              <ShopSidebar
                categories={categories}
                occasions={occasions}
                selectedCategory={selectedCategory}
                selectedOccasion={selectedOccasion}
                onCategoryChange={setSelectedCategory}
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

              {/* Product Grid */}
              <div className="flex-1">
                {/* Active Filters Tags (Mobile) */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 mb-6 lg:hidden">
                    {selectedCategory && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-full">
                        {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="hover:text-primary-900"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {selectedOccasion && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-full">
                        {getOccasionLabel(selectedOccasion)}
                        <button
                          onClick={() => setSelectedOccasion(null)}
                          className="hover:text-primary-900"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {(priceRange.min !== null || priceRange.max !== null) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-full">
                        {priceRange.min || 0} - {priceRange.max || '∞'} ден
                        <button
                          onClick={() => setPriceRange({ min: null, max: null })}
                          className="hover:text-primary-900"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {showOnSale && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-sm rounded-full">
                        {language === 'mk' ? 'На попуст' : 'On Sale'}
                        <button
                          onClick={() => setShowOnSale(false)}
                          className="hover:text-red-900"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {showBestSeller && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-full">
                        {language === 'mk' ? 'Најпродаван' : 'Best Seller'}
                        <button
                          onClick={() => setShowBestSeller(false)}
                          className="hover:text-amber-900"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                  </div>
                )}

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-ink-strong mb-2">
                      {language === 'mk' ? 'Нема резултати' : 'No Results'}
                    </h3>
                    <p className="text-ink-muted mb-6">
                      {language === 'mk'
                        ? 'Обидете се да ги промените филтрите'
                        : 'Try adjusting your filters'}
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {language === 'mk' ? 'Исчисти филтри' : 'Clear Filters'}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} variant="shop" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Filter Drawer */}
      <MobileShopFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
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
