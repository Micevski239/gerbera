'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AboutStat, AboutContent, AboutGalleryImage } from '@/lib/supabase/types'

interface UseAboutStatsReturn {
  stats: AboutStat[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useAboutStats(): UseAboutStatsReturn {
  const [stats, setStats] = useState<AboutStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('about_stats')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError
      setStats(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch about stats')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}

interface UseAboutContentReturn {
  content: Map<string, AboutContent>
  mainContent: AboutContent | null
  quoteContent: AboutContent | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useAboutContent(): UseAboutContentReturn {
  const [content, setContent] = useState<Map<string, AboutContent>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('about_content')
        .select('*')
        .eq('is_active', true)

      if (fetchError) throw fetchError

      const contentMap = new Map<string, AboutContent>()
      data?.forEach(item => {
        contentMap.set(item.section_key, item)
      })
      setContent(contentMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch about content')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  return {
    content,
    mainContent: content.get('main') || null,
    quoteContent: content.get('quote') || null,
    loading,
    error,
    refresh: fetchContent,
  }
}

interface UseAboutGalleryReturn {
  images: AboutGalleryImage[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useAboutGallery(): UseAboutGalleryReturn {
  const [images, setImages] = useState<AboutGalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('about_gallery')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError
      setImages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gallery')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  return {
    images,
    loading,
    error,
    refresh: fetchGallery,
  }
}

// Combined hook for all about page data
interface UseAboutDataReturn {
  stats: AboutStat[]
  mainContent: AboutContent | null
  quoteContent: AboutContent | null
  gallery: AboutGalleryImage[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useAboutData(): UseAboutDataReturn {
  const [stats, setStats] = useState<AboutStat[]>([])
  const [content, setContent] = useState<Map<string, AboutContent>>(new Map())
  const [gallery, setGallery] = useState<AboutGalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsResult, contentResult, galleryResult] = await Promise.all([
        supabase
          .from('about_stats')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('about_content')
          .select('*')
          .eq('is_active', true),
        supabase
          .from('about_gallery')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ])

      if (statsResult.error) throw statsResult.error
      if (contentResult.error) throw contentResult.error
      if (galleryResult.error) throw galleryResult.error

      setStats(statsResult.data || [])

      const contentMap = new Map<string, AboutContent>()
      contentResult.data?.forEach(item => {
        contentMap.set(item.section_key, item)
      })
      setContent(contentMap)

      setGallery(galleryResult.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch about data')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    stats,
    mainContent: content.get('main') || null,
    quoteContent: content.get('quote') || null,
    gallery,
    loading,
    error,
    refresh: fetchAll,
  }
}
