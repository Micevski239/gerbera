'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import ProductCard from '@/components/ProductCard'
import ShopSidebar from '@/components/products/ShopSidebar'
import MobileShopFilter from '@/components/products/MobileShopFilter'
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

export default function ShopPageClient({ categories, products, occasions, productOccasions }: ShopPageClientProps) {
  const { language } = useLanguage()
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
    if (selectedCategory) result = result.filter(p => p.category_slug === selectedCategory)
    if (selectedOccasion) result = result.filter(p => productOccasionMap.get(p.id)?.has(selectedOccasion))
    if (priceRange.min !== null) result = result.filter(p => (p.price || 0) >= priceRange.min!)
    if (priceRange.max !== null) result = result.filter(p => (p.price || 0) <= priceRange.max!)
    if (showOnSale) result = result.filter(p => p.is_on_sale)
    if (showBestSeller) result = result.filter(p => p.is_best_seller)
    return result
  }, [products, selectedCategory, selectedOccasion, priceRange, showOnSale, showBestSeller, productOccasionMap])

  const getCategoryCount = (slug: string) => products.filter(p => p.category_slug === slug).length

  const hasActiveFilters = selectedCategory !== null || selectedOccasion !== null ||
    priceRange.min !== null || priceRange.max !== null || showOnSale || showBestSeller

  const handleClearFilters = () => {
    setSelectedCategory(null)
    setSelectedOccasion(null)
    setPriceRange({ min: null, max: null })
    setShowOnSale(false)
    setShowBestSeller(false)
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
        <div className="container-custom py-3 flex items-center justify-between">
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

      {/* Sidebar + grid layout */}
      <div className="container-custom py-8">
        <div className="flex gap-8">
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

          <div className="flex-1 min-w-0">
            {/* Desktop product count */}
            <p className="hidden lg:block text-sm text-ink-muted mb-6">
              {language === 'mk' ? `${filteredProducts.length} производи` : `${filteredProducts.length} products`}
            </p>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-ink-muted mb-4">
                  {language === 'mk' ? 'Нема производи' : 'No products found'}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 border border-ink-strong text-ink-strong text-sm font-medium px-6 py-2.5 rounded-full hover:bg-ink-strong hover:text-white transition-colors"
                >
                  {language === 'mk' ? 'Исчисти филтри' : 'Clear filters'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="shop" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
