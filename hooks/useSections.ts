'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchSectionsWithProducts } from '@/lib/sections/fetchSectionsWithProducts'
import type { SectionWithProducts } from '@/types/sections'

interface UseSectionsReturn {
  sections: SectionWithProducts[]
  loading: boolean
  error: string | null
  refresh: () => void
}

interface UseSectionsOptions {
  enabled?: boolean
  initialSections?: SectionWithProducts[]
}

export function useSections(options: UseSectionsOptions = {}): UseSectionsReturn {
  const { enabled = true, initialSections = [] } = options
  const supabase = createClient()
  const [sections, setSections] = useState<SectionWithProducts[]>(initialSections)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const fetchedSections = await fetchSectionsWithProducts(supabase)
      setSections(fetchedSections)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sections')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    fetchSections()
  }, [enabled, fetchSections])

  useEffect(() => {
    if (!enabled) {
      setSections(initialSections)
    }
  }, [enabled, initialSections])

  return {
    sections,
    loading,
    error,
    refresh: fetchSections,
  }
}
