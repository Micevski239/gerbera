'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/supabase/types'

interface ProductShowcaseProps {
  products: {
    latest: Product[]
    popular: Product[]
    best: Product[]
  }
  language: 'mk' | 'en'
}

const tabLabels: Record<'latest' | 'popular' | 'best', { mk: string; en: string }> = {
  latest: { mk: 'Најнови', en: 'Latest Item' },
  popular: { mk: 'Популарни', en: 'Popular Item' },
  best: { mk: 'Топ продажба', en: 'Best Seller' },
}

const fallbackProducts: Product[] = Array.from({ length: 5 }).map((_, index) => ({
  id: `placeholder-${index}`,
  category_id: '',
  name: 'Gerbera bouquet',
  name_mk: 'Гербера букет',
  name_en: 'Gerbera bouquet',
  description: null,
  description_mk: null,
  description_en: null,
  image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  price_text: null,
  price: 29 + index,
  sale_price: index % 2 === 0 ? 24 + index : null,
  status: 'published',
  is_on_sale: index % 2 === 0,
  is_best_seller: index % 3 === 0,
  display_order: index * 10,
  is_visible: true,
  created_at: '',
  updated_at: '',
}))

function formatPrice(value: number | null | undefined) {
  if (typeof value !== 'number') return null
  return `€${value.toFixed(0)}`
}

function ProductCard({ product, language }: { product: Product; language: 'mk' | 'en' }) {
  const title = language === 'mk'
    ? product.name_mk || product.name_en || product.name
    : product.name_en || product.name_mk || product.name
  const price = formatPrice(product.price)
  const salePrice = formatPrice(product.sale_price)
  const hasSale = !!salePrice && !!price && salePrice !== price

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-2xl"
    >
      <div className="relative aspect-[5/6] w-full max-w-[216px] mx-auto overflow-hidden rounded-2xl shadow-card transition-shadow duration-300 group-hover:shadow-lift">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 280px"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-primary-50/50 text-primary-500/40 gap-2">
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c2.5-2 4-4 4-6s-1.5-4-4-4-4 2-4 4 1.5 4 4 6z" />
              <circle cx="12" cy="7" r="3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2m5 5h2m-2 0l1.5-1.5M7 7H5m2 0L5.5 5.5" />
            </svg>
            <span className="text-xs font-medium">{language === 'mk' ? 'Нема слика' : 'No image'}</span>
          </div>
        )}
        {hasSale && (
          <span className="absolute top-3 left-3 rounded-full bg-primary-500 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
            -{Math.max(5, Math.min(40, Math.round(((product.price || 0) - (product.sale_price || 0)) / (product.price || 1) * 100)))}%
          </span>
        )}
      </div>
      <div className="mt-3 space-y-0.5 text-center">
        <p className="font-body text-ds-body-sm font-medium text-ink-strong line-clamp-2 group-hover:text-primary-500 transition-colors duration-200">
          {title}
        </p>
        <div className="flex items-baseline justify-center gap-2">
          {hasSale && salePrice ? (
            <>
              <span className="font-body text-ds-body-sm font-semibold text-primary-500">{salePrice}</span>
              <span className="font-body text-xs text-ink-muted line-through">{price}</span>
            </>
          ) : price ? (
            <span className="font-body text-ds-body-sm font-semibold text-ink-strong">{price}</span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export default function ProductShowcase({ products, language }: ProductShowcaseProps) {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular' | 'best'>('latest')
  const datasets = useMemo(() => ({
    latest: products.latest.length ? products.latest : fallbackProducts,
    popular: products.popular.length ? products.popular : fallbackProducts,
    best: products.best.length ? products.best : fallbackProducts,
  }), [products])

  return (
    <section className="bg-white">
      <div className="container-custom py-16 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-wrap gap-6 font-heading text-xl leading-tight text-ink-strong">
              {(['latest', 'popular', 'best'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`pb-2 font-normal transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                    activeTab === tab
                      ? 'text-primary-500 border-b-2 border-primary-500'
                      : 'text-ink-strong hover:text-primary-500/70'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tabLabels[tab][language]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              aria-label={language === 'mk' ? 'Претходна категорија' : 'Previous category'}
              className="h-9 w-9 rounded-full bg-neutral-100 text-neutral-500 hover:text-primary-500 hover:bg-neutral-200 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              onClick={() => setActiveTab((prev) => (prev === 'latest' ? 'best' : prev === 'popular' ? 'latest' : 'popular'))}
            >
              ←
            </button>
            <button
              aria-label={language === 'mk' ? 'Следна категорија' : 'Next category'}
              className="h-9 w-9 rounded-full bg-neutral-100 text-neutral-500 hover:text-primary-500 hover:bg-neutral-200 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              onClick={() => setActiveTab((prev) => (prev === 'latest' ? 'popular' : prev === 'popular' ? 'best' : 'latest'))}
            >
              →
            </button>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {datasets[activeTab].slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} language={language} />
          ))}
        </div>
      </div>
    </section>
  )
}
