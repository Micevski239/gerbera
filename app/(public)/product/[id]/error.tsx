'use client'

import Link from 'next/link'
import { WarningIcon } from './_components/ProductDetailIcons'

export default function ProductError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-canvas-100 flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary-100 flex items-center justify-center">
          <WarningIcon className="w-8 h-8 text-primary-500" />
        </div>
        <h1 className="text-2xl font-heading font-semibold text-ink-strong mb-2">Something went wrong</h1>
        <p className="text-ink-muted mb-6">We couldn&apos;t load this product. Please try again.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/products" className="btn-outline">
            Browse products
          </Link>
        </div>
      </div>
    </div>
  )
}
