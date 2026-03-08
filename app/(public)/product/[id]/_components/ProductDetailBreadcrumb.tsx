'use client'

import Link from 'next/link'
import { ChevronRightIcon } from './ProductDetailIcons'

interface ProductDetailBreadcrumbProps {
  homeLabel: string
  productsLabel: string
  productName: string
}

export default function ProductDetailBreadcrumb({
  homeLabel,
  productsLabel,
  productName,
}: ProductDetailBreadcrumbProps) {
  return (
    <nav aria-label="breadcrumb" className="mb-8 flex items-center gap-2 text-sm">
      <Link href="/" className="text-ink-muted hover:text-primary-500 transition-colors">
        {homeLabel}
      </Link>
      <ChevronRightIcon className="w-4 h-4 text-neutral-400" />
      <Link href="/products" className="text-ink-muted hover:text-primary-500 transition-colors">
        {productsLabel}
      </Link>
      <ChevronRightIcon className="w-4 h-4 text-neutral-400" />
      <span className="text-ink-strong font-medium truncate" aria-current="page">
        {productName}
      </span>
    </nav>
  )
}
