'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProductWithDetails, ProductStatus } from '@/lib/supabase/types'

export type SortOption = 'newest' | 'oldest' | 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc'

interface UseProductsOptions {
  categorySlug?: string
  status?: ProductStatus | 'all'
  isBestSeller?: boolean
  isOnSale?: boolean
  searchQuery?: string
  sortBy?: SortOption
  limit?: number
}

interface UseProductsReturn {
  products: ProductWithDetails[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
  total: number
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    categorySlug,
    status = 'published',
    isBestSeller,
    isOnSale,
    searchQuery,
    sortBy = 'newest',
    limit = 12,
  } = options

  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)

  const supabase = createClient()

  const fetchProducts = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('products_with_details')
        .select('*', { count: 'exact' })

      // Filter by visibility
      query = query.eq('is_visible', true)

      // Filter by status
      if (status !== 'all') {
        query = query.eq('status', status)
      }

      // Filter by category
      if (categorySlug) {
        query = query.eq('category_slug', categorySlug)
      }

      // Filter by best seller
      if (isBestSeller !== undefined) {
        query = query.eq('is_best_seller', isBestSeller)
      }

      // Filter by on sale
      if (isOnSale !== undefined) {
        query = query.eq('is_on_sale', isOnSale)
      }

      // Search filter
      if (searchQuery && searchQuery.trim()) {
        const search = searchQuery.trim().toLowerCase()
        query = query.or(`name.ilike.%${search}%,name_mk.ilike.%${search}%,name_en.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // Sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'priceAsc':
          query = query.order('price', { ascending: true, nullsFirst: false })
          break
        case 'priceDesc':
          query = query.order('price', { ascending: false, nullsFirst: false })
          break
        case 'nameAsc':
          query = query.order('name', { ascending: true })
          break
        case 'nameDesc':
          query = query.order('name', { ascending: false })
          break
      }

      // Pagination
      const from = pageNum * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      const newProducts = data || []
      setProducts(prev => append ? [...prev, ...newProducts] : newProducts)
      setTotal(count || 0)
      setHasMore(newProducts.length === limit && (count || 0) > from + newProducts.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [supabase, categorySlug, status, isBestSeller, isOnSale, searchQuery, sortBy, limit])

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    setPage(0)
    fetchProducts(0, false)
  }, [fetchProducts])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchProducts(nextPage, true)
    }
  }, [loading, hasMore, page, fetchProducts])

  const refresh = useCallback(() => {
    setPage(0)
    fetchProducts(0, false)
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    total,
  }
}

// Hook for single product
export function useProduct(id: string) {
  const [product, setProduct] = useState<ProductWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('products_with_details')
          .select('*')
          .eq('id', id)
          .single()

        if (fetchError) throw fetchError
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, supabase])

  return { product, loading, error }
}

// Hook for best sellers
export function useBestSellers(limit: number = 8) {
  return useProducts({ isBestSeller: true, limit })
}

// Hook for sale products
export function useSaleProducts(limit: number = 8) {
  return useProducts({ isOnSale: true, limit })
}
