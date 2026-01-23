'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/supabase/types'

interface CategoryWithCount extends Category {
  product_count: number
}

interface UseCategoriesReturn {
  categories: CategoryWithCount[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true })

      if (categoriesError) throw categoriesError

      // Fetch product counts for each category
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('category_id')
        .eq('is_visible', true)
        .eq('status', 'published')

      if (productsError) throw productsError

      // Count products per category
      const countMap = new Map<string, number>()
      productsData?.forEach(product => {
        const count = countMap.get(product.category_id) || 0
        countMap.set(product.category_id, count + 1)
      })

      // Combine categories with counts
      const categoriesWithCounts: CategoryWithCount[] = (categoriesData || []).map(cat => ({
        ...cat,
        product_count: countMap.get(cat.id) || 0,
      }))

      setCategories(categoriesWithCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
  }
}

// Hook for single category by slug
export function useCategory(slug: string) {
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchCategory() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .eq('is_visible', true)
          .single()

        if (fetchError) throw fetchError
        setCategory(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch category')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCategory()
    }
  }, [slug, supabase])

  return { category, loading, error }
}
