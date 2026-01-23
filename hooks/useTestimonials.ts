'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Testimonial } from '@/lib/supabase/types'

interface UseTestimonialsOptions {
  featured?: boolean
  limit?: number
}

interface UseTestimonialsReturn {
  testimonials: Testimonial[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useTestimonials(options: UseTestimonialsOptions = {}): UseTestimonialsReturn {
  const { featured, limit } = options

  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (featured !== undefined) {
        query = query.eq('is_featured', featured)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setTestimonials(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch testimonials')
    } finally {
      setLoading(false)
    }
  }, [supabase, featured, limit])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  return {
    testimonials,
    loading,
    error,
    refresh: fetchTestimonials,
  }
}

// Hook for featured testimonials only
export function useFeaturedTestimonials(limit: number = 3) {
  return useTestimonials({ featured: true, limit })
}
