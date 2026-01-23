'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Category } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
  categories: Category[]
}

const basePill = 'inline-flex items-center rounded-pill border px-4 py-2 text-ds-body-sm font-medium transition-colors whitespace-nowrap'
const activePill = 'bg-ink-strong text-canvas-100 border-ink-strong shadow-card'
const inactivePill = 'bg-surface-base text-ink-base border-border-soft hover:bg-state-hover'

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <section className="bg-surface-raised py-4">
      <div className="section-shell space-y-3">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Browse categories</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          <Link
            href="/"
            aria-current={isHome ? 'page' : undefined}
            className={cn(basePill, isHome ? activePill : inactivePill)}
          >
            All products
          </Link>

          {categories.map((category) => {
            const isActive = pathname === `/category/${category.slug}`
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(basePill, isActive ? activePill : inactivePill)}
              >
                {category.name}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
