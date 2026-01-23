'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HeroSlide, GridImage, WelcomeTile } from '@/lib/supabase/types'

interface UseHeroSlidesReturn {
  slides: HeroSlide[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useHeroSlides(): UseHeroSlidesReturn {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('homepage_hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError
      setSlides(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hero slides')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

  return {
    slides,
    loading,
    error,
    refresh: fetchSlides,
  }
}

interface UseGridImagesReturn {
  images: GridImage[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useGridImages(): UseGridImagesReturn {
  const [images, setImages] = useState<GridImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('homepage_grid_images')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError
      setImages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch grid images')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  return {
    images,
    loading,
    error,
    refresh: fetchImages,
  }
}

interface UseWelcomeTilesReturn {
  tiles: WelcomeTile[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useWelcomeTiles(): UseWelcomeTilesReturn {
  const [tiles, setTiles] = useState<WelcomeTile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchTiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('welcome_tiles')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError
      setTiles(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch welcome tiles')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTiles()
  }, [fetchTiles])

  return {
    tiles,
    loading,
    error,
    refresh: fetchTiles,
  }
}

// Combined hook for all homepage data
interface UseHomepageDataReturn {
  heroSlides: HeroSlide[]
  gridImages: GridImage[]
  welcomeTiles: WelcomeTile[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useHomepageData(): UseHomepageDataReturn {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [gridImages, setGridImages] = useState<GridImage[]>([])
  const [welcomeTiles, setWelcomeTiles] = useState<WelcomeTile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [slidesResult, imagesResult, tilesResult] = await Promise.all([
        supabase
          .from('homepage_hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('homepage_grid_images')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('welcome_tiles')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ])

      if (slidesResult.error) throw slidesResult.error
      if (imagesResult.error) throw imagesResult.error
      if (tilesResult.error) throw tilesResult.error

      setHeroSlides(slidesResult.data || [])
      setGridImages(imagesResult.data || [])
      setWelcomeTiles(tilesResult.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch homepage data')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    heroSlides,
    gridImages,
    welcomeTiles,
    loading,
    error,
    refresh: fetchAll,
  }
}
