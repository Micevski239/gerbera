'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HomepageSection, HomepageSectionItem } from '@/lib/supabase/types'

export interface SectionWithItems extends HomepageSection {
  items: HomepageSectionItem[]
}

interface UseHomepageSectionsReturn {
  sections: SectionWithItems[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useHomepageSections(): UseHomepageSectionsReturn {
  const [sections, setSections] = useState<SectionWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch active sections ordered by display_order
      const { data: sectionsRaw, error: sectionsError } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (sectionsError) throw sectionsError

      // Cast to proper type
      const sectionsData = (sectionsRaw || []) as HomepageSection[]

      if (sectionsData.length === 0) {
        setSections([])
        return
      }

      // Fetch all active items for these sections
      const sectionIds = sectionsData.map(s => s.id)
      const { data: itemsRaw, error: itemsError } = await supabase
        .from('homepage_section_items')
        .select('*')
        .in('section_id', sectionIds)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (itemsError) throw itemsError

      // Cast to proper type
      const itemsData = (itemsRaw || []) as HomepageSectionItem[]

      // Group items by section_id
      const itemsBySection = itemsData.reduce((acc, item) => {
        const sectionId = item.section_id
        if (!acc[sectionId]) acc[sectionId] = []
        acc[sectionId].push(item)
        return acc
      }, {} as Record<string, HomepageSectionItem[]>)

      // Combine sections with their items
      const sectionsWithItems: SectionWithItems[] = sectionsData.map(section => ({
        ...section,
        items: itemsBySection[section.id] || []
      }))

      setSections(sectionsWithItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch homepage sections')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  return {
    sections,
    loading,
    error,
    refresh: fetchSections,
  }
}
