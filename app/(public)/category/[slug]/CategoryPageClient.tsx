'use client'

import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { useLanguage, getLocalizedField } from '@/context/LanguageContext'
import type { ProductWithDetails, Category } from '@/lib/supabase/types'

interface CategoryPageClientProps {
  category: Category
  categories: Category[]
  products: ProductWithDetails[]
}

export default function CategoryPageClient({
  category,
  categories,
  products,
}: CategoryPageClientProps) {
  const { language, t } = useLanguage()

  const name = getLocalizedField(category, 'name', language)
  const description = getLocalizedField(category, 'description', language)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-warm">
        <div className="container-custom py-12">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm">
            <Link href="/" className="text-neutral-500 hover:text-primary-600 transition-colors">
              {t('nav.home')}
            </Link>
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/products" className="text-neutral-500 hover:text-primary-600 transition-colors">
              {t('nav.products')}
            </Link>
            <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-neutral-800 font-medium">{name}</span>
          </nav>

          {/* Category info */}
          <h1 className="heading-1 mb-4">
            <span className="text-gradient">{name}</span>
          </h1>
          {description && (
            <p className="text-lg text-neutral-600 max-w-2xl">
              {description}
            </p>
          )}
          <p className="mt-4 text-sm text-neutral-500">
            {t('categories.productsCount').replace('{count}', String(products.length))}
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-neutral-100 sticky top-16 z-20">
        <div className="container-custom">
          <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
            <Link
              href="/products"
              className="badge badge-secondary whitespace-nowrap"
            >
              {t('categories.all')}
            </Link>
            {categories.map((cat) => {
              const catName = getLocalizedField(cat, 'name', language)
              const isActive = cat.id === category.id
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={`badge whitespace-nowrap ${
                    isActive ? 'badge-primary' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {catName}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container-custom py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="heading-4 mb-2">{t('categories.noProducts')}</h3>
            <p className="text-neutral-500 mb-6">
              {language === 'mk'
                ? 'Проверете ги другите категории или погледнете ги сите производи.'
                : 'Check out other categories or browse all products.'}
            </p>
            <Link href="/products" className="btn btn-primary">
              {t('nav.allProducts')}
            </Link>
          </div>
        ) : (
          <div className="product-grid-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
