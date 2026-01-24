'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import ProductCard from '@/components/ProductCard'
import ShopSidebar from '@/components/products/ShopSidebar'
import MobileShopFilter from '@/components/products/MobileShopFilter'
import type { Category, Product, Occasion, ProductOccasion } from '@/lib/supabase/types'

const navLinks = [
  { label: { mk: 'Дома', en: 'Home' }, href: '/' },
  { label: { mk: 'Продавница', en: 'Shop' }, href: '/products' },
  { label: { mk: 'За нас', en: 'About Us' }, href: '/about' },
  { label: { mk: 'Контакт', en: 'Contact' }, href: '/contact' },
]

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

  // Contact info
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+389 70 123 456'
  const dialablePhone = contactPhone.replace(/[^+\d]/g, '')
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com'
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com'

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
    <div className="min-h-screen bg-white text-neutral-600">
      {/* Header - Same as Home Page */}
      <header>
        <div className="container-custom py-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Link href="/" className="text-ink-strong font-heading">
              <span className="block text-3xl tracking-[0.25em] uppercase text-accent-burgundy-600">
                Gerbera
              </span>
              <span className="block text-ds-eyebrow uppercase tracking-[0.4em] text-accent-burgundy-500 font-medium">
                A moment of love
              </span>
            </Link>

            <nav className="flex flex-wrap items-center justify-center gap-1 text-ds-body-sm font-semibold uppercase tracking-wide text-neutral-700">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2 rounded ${
                    link.href === '/products'
                      ? 'text-accent-burgundy-500'
                      : 'hover:text-accent-burgundy-500'
                  }`}
                >
                  {language === 'mk' ? link.label.mk : link.label.en}
                  <span
                    className={`absolute bottom-1 left-3 right-3 h-0.5 bg-accent-burgundy-500 transition-transform duration-200 origin-left ${
                      link.href === '/products' ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <a
                href={`tel:${dialablePhone}`}
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 hover:text-accent-burgundy-500 hover:bg-accent-burgundy-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2"
                aria-label={language === 'mk' ? 'Јави ни се' : 'Call us'}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6.5c0 8.008 6.492 14.5 14.5 14.5h1.5a2 2 0 002-2v-3a1 1 0 00-.883-.993l-3.017-.335a1 1 0 00-.96.524l-.9 1.68a.75.75 0 01-1.043.3 12.06 12.06 0 01-5.696-5.696.75.75 0 01.3-1.043l1.68-.9a1 1 0 00.524-.96l-.335-3.017A1 1 0 009.5 4H6.5a2 2 0 00-2 2v.5z" />
                </svg>
              </a>
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 hover:text-accent-burgundy-500 hover:bg-accent-burgundy-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12.07C22 6.486 17.523 2 11.938 2 6.353 2 1.875 6.486 1.875 12.07c0 4.99 3.657 9.129 8.437 9.879v-6.988H7.898v-2.89h2.414V9.845c0-2.39 1.425-3.713 3.61-3.713 1.045 0 2.14.187 2.14.187v2.353h-1.206c-1.19 0-1.562.74-1.562 1.497v1.797h2.656l-.425 2.89h-2.231v6.988c4.78-.75 8.437-4.89 8.437-9.878z" />
                </svg>
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-600 hover:text-accent-burgundy-500 hover:bg-accent-burgundy-50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-burgundy-500 focus-visible:ring-offset-2"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Mini Hero Section */}
        <section
          className="bg-accent-sage-50 relative overflow-hidden"
          style={{
            backgroundImage: "url('/images/hero-background.png')",
            backgroundSize: '400px 400px',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
          }}
        >
          <div className="container-custom py-12 md:py-16 text-center relative z-10">
            <span className="inline-block px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium uppercase tracking-wider text-accent-burgundy-600 mb-4">
              {language === 'mk' ? 'Нашата колекција' : 'Our Collection'}
            </span>
            <h1 className="font-heading text-4xl md:text-5xl text-ink-strong mb-3">
              {t('nav.products')}
            </h1>
            <p className="text-neutral-600 max-w-md mx-auto">
              {language === 'mk'
                ? 'Пронајдете го совршениот подарок за вашите најблиски'
                : 'Find the perfect gift for your loved ones'}
            </p>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="bg-white border-b border-neutral-100 sticky top-0 z-30">
          <div className="container-custom py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
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
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-accent-burgundy-600 text-white rounded-full">
                    {[selectedCategory, priceRange.min, priceRange.max, showOnSale, showBestSeller].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Main Content - Sidebar + Grid */}
        <section className="bg-white">
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
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-burgundy-50 text-accent-burgundy-700 text-sm rounded-full">
                        {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="hover:text-accent-burgundy-900"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {selectedOccasion && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-burgundy-50 text-accent-burgundy-700 text-sm rounded-full">
                        {getOccasionLabel(selectedOccasion)}
                        <button
                          onClick={() => setSelectedOccasion(null)}
                          className="hover:text-accent-burgundy-900"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    )}
                    {(priceRange.min !== null || priceRange.max !== null) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-burgundy-50 text-accent-burgundy-700 text-sm rounded-full">
                        {priceRange.min || 0} - {priceRange.max || '∞'} ден
                        <button
                          onClick={() => setPriceRange({ min: null, max: null })}
                          className="hover:text-accent-burgundy-900"
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
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      {language === 'mk' ? 'Нема резултати' : 'No Results'}
                    </h3>
                    <p className="text-neutral-500 mb-6">
                      {language === 'mk'
                        ? 'Обидете се да ги промените филтрите'
                        : 'Try adjusting your filters'}
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="px-6 py-3 bg-accent-burgundy-600 text-white font-medium rounded-lg hover:bg-accent-burgundy-700 transition-colors"
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
